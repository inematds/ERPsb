import { prisma } from '@/lib/prisma';
import type { CreateContaPagarInput, UpdateContaPagarInput, ListContaPagarQuery } from './conta-pagar.schema';

export async function createContaPagar(data: CreateContaPagarInput) {
  return prisma.contaPagar.create({
    data: {
      tenantId: '', // auto-injected by tenant extension
      description: data.description,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      category: data.category,
      supplierId: data.supplierId || null,
      notes: data.notes || null,
      recurrent: data.recurrent,
      recurrenceType: data.recurrent ? data.recurrenceType : null,
      status: 'PENDENTE',
    },
  });
}

export async function listContasPagar(query: ListContaPagarQuery) {
  const { search, page, pageSize, status, category, startDate, endDate } = query;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (category) {
    where.category = category;
  }

  if (search) {
    where.description = { contains: search, mode: 'insensitive' };
  }

  if (startDate || endDate) {
    where.dueDate = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }

  const [data, total] = await Promise.all([
    prisma.contaPagar.findMany({
      where,
      include: { supplier: { select: { id: true, name: true } } },
      orderBy: { dueDate: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contaPagar.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function getContaPagar(id: string) {
  return prisma.contaPagar.findUnique({
    where: { id },
    include: { supplier: { select: { id: true, name: true } } },
  });
}

export async function updateContaPagar(id: string, data: UpdateContaPagarInput) {
  const updateData: Record<string, unknown> = {};

  if (data.description !== undefined) updateData.description = data.description;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
  if (data.category !== undefined) updateData.category = data.category;
  if (data.supplierId !== undefined) updateData.supplierId = data.supplierId || null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.recurrent !== undefined) updateData.recurrent = data.recurrent;
  if (data.recurrenceType !== undefined) updateData.recurrenceType = data.recurrenceType || null;

  return prisma.contaPagar.update({
    where: { id },
    data: updateData,
  });
}

export async function markAsPaid(id: string) {
  const conta = await prisma.contaPagar.findUnique({ where: { id } });
  if (!conta) throw new Error('Conta nao encontrada');

  const updated = await prisma.contaPagar.update({
    where: { id },
    data: {
      status: 'PAGO',
      paidDate: new Date(),
    },
  });

  // If recurrent, create next installment
  if (conta.recurrent && conta.recurrenceType) {
    const nextDueDate = new Date(conta.dueDate);
    if (conta.recurrenceType === 'MENSAL') {
      nextDueDate.setUTCMonth(nextDueDate.getUTCMonth() + 1);
    } else if (conta.recurrenceType === 'SEMANAL') {
      nextDueDate.setUTCDate(nextDueDate.getUTCDate() + 7);
    }

    await prisma.contaPagar.create({
      data: {
        tenantId: '', // auto-injected by tenant extension
        description: conta.description,
        amount: conta.amount,
        dueDate: nextDueDate,
        category: conta.category,
        supplierId: conta.supplierId,
        notes: conta.notes,
        recurrent: true,
        recurrenceType: conta.recurrenceType,
        status: 'PENDENTE',
      },
    });
  }

  return updated;
}

export async function cancelContaPagar(id: string) {
  return prisma.contaPagar.update({
    where: { id },
    data: { status: 'CANCELADO' },
  });
}
