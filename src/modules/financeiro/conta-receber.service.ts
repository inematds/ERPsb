import { prisma } from '@/lib/prisma';
import type { CreateContaReceberInput, UpdateContaReceberInput, ListContaReceberQuery } from './conta-receber.schema';

export async function createContaReceber(data: CreateContaReceberInput) {
  return prisma.contaReceber.create({
    data: {
      tenantId: '', // auto-injected by tenant extension
      description: data.description,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      category: data.category,
      clientId: data.clientId || null,
      notes: data.notes || null,
      status: 'PENDENTE',
    },
  });
}

export async function listContasReceber(query: ListContaReceberQuery) {
  const { search, page, pageSize, status, clientId, startDate, endDate } = query;

  const where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (search) where.description = { contains: search, mode: 'insensitive' };

  if (startDate || endDate) {
    where.dueDate = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }

  const [data, total] = await Promise.all([
    prisma.contaReceber.findMany({
      where,
      include: { client: { select: { id: true, name: true } } },
      orderBy: { dueDate: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contaReceber.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function getContaReceber(id: string) {
  return prisma.contaReceber.findUnique({
    where: { id },
    include: { client: { select: { id: true, name: true } } },
  });
}

export async function updateContaReceber(id: string, data: UpdateContaReceberInput) {
  const updateData: Record<string, unknown> = {};

  if (data.description !== undefined) updateData.description = data.description;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
  if (data.category !== undefined) updateData.category = data.category;
  if (data.clientId !== undefined) updateData.clientId = data.clientId || null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  return prisma.contaReceber.update({
    where: { id },
    data: updateData,
  });
}

export async function markAsReceived(id: string) {
  return prisma.contaReceber.update({
    where: { id },
    data: {
      status: 'RECEBIDO',
      receivedDate: new Date(),
    },
  });
}

export async function cancelContaReceber(id: string) {
  return prisma.contaReceber.update({
    where: { id },
    data: { status: 'CANCELADO' },
  });
}
