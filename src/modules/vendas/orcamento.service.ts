import { prisma } from '@/lib/prisma';
import type { CreateOrcamentoInput, UpdateOrcamentoInput, ListOrcamentosQuery } from './orcamento.schema';
import type { VendaItem } from './venda.schema';
import { createVenda, confirmVenda } from './venda.service';

export async function createOrcamento(data: CreateOrcamentoInput) {
  const items = data.items as VendaItem[];
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = data.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  // Get next sequential number for this tenant
  const count = await prisma.orcamento.count({});
  const number = count + 1;

  return prisma.orcamento.create({
    data: {
      tenantId: '', // auto-injected by tenant extension
      number,
      clientId: data.clientId,
      items: items as unknown as Record<string, unknown>[],
      subtotal,
      discount,
      total,
      validUntil: new Date(data.validUntil),
      notes: data.notes || null,
      status: 'PENDENTE',
    },
    include: {
      client: { select: { id: true, name: true, phone: true } },
    },
  });
}

export async function listOrcamentos(query: ListOrcamentosQuery) {
  // Auto-expire overdue quotes before listing
  await markExpired();

  const { search, page, pageSize, status, clientId, startDate, endDate } = query;

  const where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (search) {
    where.OR = [
      { notes: { contains: search, mode: 'insensitive' } },
      { client: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }

  const [data, total] = await Promise.all([
    prisma.orcamento.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        sale: { select: { id: true, number: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.orcamento.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function getOrcamento(id: string) {
  return prisma.orcamento.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      sale: { select: { id: true, number: true, status: true } },
    },
  });
}

export async function updateOrcamento(id: string, data: UpdateOrcamentoInput) {
  const updateData: Record<string, unknown> = {};

  if (data.clientId !== undefined) updateData.clientId = data.clientId;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.validUntil !== undefined) updateData.validUntil = new Date(data.validUntil);
  if (data.status !== undefined) updateData.status = data.status;

  if (data.items) {
    const items = data.items as VendaItem[];
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discount = data.discount ?? 0;
    updateData.items = items as unknown as Record<string, unknown>[];
    updateData.subtotal = subtotal;
    updateData.discount = discount;
    updateData.total = Math.max(0, subtotal - discount);
  } else if (data.discount !== undefined) {
    // Only discount changed, need to recalculate total from existing subtotal
    const existing = await prisma.orcamento.findUnique({ where: { id } });
    if (existing) {
      updateData.discount = data.discount;
      updateData.total = Math.max(0, existing.subtotal - data.discount);
    }
  }

  return prisma.orcamento.update({
    where: { id },
    data: updateData,
    include: {
      client: { select: { id: true, name: true, phone: true } },
    },
  });
}

export async function convertToVenda(id: string) {
  const orcamento = await prisma.orcamento.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!orcamento) throw new Error('Orcamento nao encontrado');
  if (orcamento.status !== 'PENDENTE' && orcamento.status !== 'APROVADO') {
    throw new Error('Apenas orcamentos pendentes ou aprovados podem ser convertidos');
  }

  const items = orcamento.items as unknown as VendaItem[];

  // Create a new Venda from the orcamento data
  // We need a paymentMethodId - get the default one for this tenant
  const defaultPayment = await prisma.formaPagamento.findFirst({
    where: { isDefault: true },
  });

  if (!defaultPayment) {
    throw new Error('Nenhuma forma de pagamento padrao configurada');
  }

  // Create the sale
  const venda = await createVenda({
    clientId: orcamento.clientId,
    items,
    discount: orcamento.discount,
    paymentMethodId: defaultPayment.id,
  });

  // Confirm the sale (creates ContaReceber)
  const confirmedVenda = await confirmVenda(venda.id);

  // Update orcamento status
  await prisma.orcamento.update({
    where: { id },
    data: { status: 'CONVERTIDO', saleId: venda.id },
  });

  return confirmedVenda;
}

export async function duplicateOrcamento(id: string) {
  const orcamento = await prisma.orcamento.findUnique({ where: { id } });

  if (!orcamento) throw new Error('Orcamento nao encontrado');

  // Get next sequential number
  const count = await prisma.orcamento.count({});
  const number = count + 1;

  // Set new validity to 30 days from now
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  return prisma.orcamento.create({
    data: {
      tenantId: orcamento.tenantId,
      number,
      clientId: orcamento.clientId,
      items: orcamento.items as unknown as Record<string, unknown>[],
      subtotal: orcamento.subtotal,
      discount: orcamento.discount,
      total: orcamento.total,
      validUntil,
      notes: orcamento.notes,
      status: 'PENDENTE',
    },
    include: {
      client: { select: { id: true, name: true, phone: true } },
    },
  });
}

export async function markExpired() {
  return prisma.orcamento.updateMany({
    where: {
      status: 'PENDENTE',
      validUntil: { lt: new Date() },
    },
    data: { status: 'EXPIRADO' },
  });
}
