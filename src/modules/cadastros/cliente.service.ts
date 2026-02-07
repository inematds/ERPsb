import { prisma } from '@/lib/prisma';
import type { CreateClienteInput, UpdateClienteInput, ListClienteQuery } from './cliente.schema';

export async function createCliente(data: CreateClienteInput) {
  return prisma.cliente.create({
    data: {
      tenantId: '', // auto-injected by tenant extension
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      document: data.document || null,
      address: data.address ?? undefined,
      notes: data.notes || null,
    },
  });
}

export async function listClientes(query: ListClienteQuery) {
  const { search, page, pageSize } = query;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
          { document: { contains: search } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.cliente.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function getCliente(id: string) {
  return prisma.cliente.findUnique({ where: { id } });
}

export async function updateCliente(id: string, data: UpdateClienteInput) {
  return prisma.cliente.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.document !== undefined && { document: data.document || null }),
      ...(data.address !== undefined && { address: data.address ?? undefined }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
  });
}

export async function deleteCliente(id: string) {
  return prisma.cliente.delete({ where: { id } });
}
