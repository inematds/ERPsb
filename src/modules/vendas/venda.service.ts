import { prisma } from '@/lib/prisma';
import { registrarSaidaVenda } from '@/modules/estoque/estoque.service';
import type { CreateVendaInput, ListVendasQuery, VendaItem } from './venda.schema';

export async function createVenda(data: CreateVendaInput) {
  const items = data.items as VendaItem[];
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = data.discount ?? 0;
  const total = subtotal - discount;

  return prisma.venda.create({
    data: {
      tenantId: '', // auto-injected by tenant extension
      clientId: data.clientId || null,
      items: items as unknown as Record<string, unknown>[],
      subtotal,
      discount,
      total: total < 0 ? 0 : total,
      paymentMethodId: data.paymentMethodId,
      notes: data.notes || null,
      status: 'RASCUNHO',
    },
    include: {
      client: { select: { id: true, name: true } },
      paymentMethod: { select: { id: true, name: true, type: true } },
    },
  });
}

export async function confirmVenda(id: string) {
  const venda = await prisma.venda.findUnique({
    where: { id },
    include: { paymentMethod: true },
  });

  if (!venda) throw new Error('Venda nao encontrada');
  if (venda.status !== 'RASCUNHO') throw new Error('Venda ja foi confirmada ou cancelada');

  // Get next sequential number for this tenant
  const count = await prisma.venda.count({
    where: { tenantId: venda.tenantId, status: 'CONFIRMADA' },
  });
  const number = count + 1;

  // Update venda status and assign number
  const updated = await prisma.venda.update({
    where: { id },
    data: { status: 'CONFIRMADA', number },
    include: {
      client: { select: { id: true, name: true } },
      paymentMethod: { select: { id: true, name: true, type: true } },
    },
  });

  // Deduct stock for items (non-blocking - errors don't prevent sale)
  const items = venda.items as VendaItem[];
  try {
    await registrarSaidaVenda(
      venda.tenantId,
      venda.id,
      items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    );
  } catch {
    // Stock deduction failure doesn't block sale confirmation
  }

  // Create linked ContaReceber (all sales are "a vista" for MVP)
  await prisma.contaReceber.create({
    data: {
      tenantId: venda.tenantId,
      description: `Venda #${number}`,
      amount: venda.total,
      dueDate: new Date(),
      receivedDate: new Date(),
      status: 'RECEBIDO',
      category: 'Vendas',
      clientId: venda.clientId,
      saleId: venda.id,
    },
  });

  return updated;
}

export async function listVendas(query: ListVendasQuery) {
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
    prisma.venda.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        paymentMethod: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.venda.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function getVenda(id: string) {
  return prisma.venda.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      paymentMethod: { select: { id: true, name: true, type: true } },
      contasReceber: { select: { id: true, status: true, amount: true } },
    },
  });
}

export async function cancelVenda(id: string) {
  const venda = await prisma.venda.findUnique({
    where: { id },
    include: { contasReceber: true },
  });

  if (!venda) throw new Error('Venda nao encontrada');
  if (venda.status === 'CANCELADA') throw new Error('Venda ja esta cancelada');

  // Cancel the sale
  const updated = await prisma.venda.update({
    where: { id },
    data: { status: 'CANCELADA' },
    include: {
      client: { select: { id: true, name: true } },
      paymentMethod: { select: { id: true, name: true, type: true } },
    },
  });

  // Cancel linked ContaReceber
  if (venda.contasReceber.length > 0) {
    await prisma.contaReceber.updateMany({
      where: { saleId: id },
      data: { status: 'CANCELADO' },
    });
  }

  return updated;
}
