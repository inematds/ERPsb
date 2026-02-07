import { prisma } from '@/lib/prisma';
import type {
  CreateFornecedorInput,
  UpdateFornecedorInput,
  ListFornecedorQuery,
} from './fornecedor.schema';

export async function createFornecedor(data: CreateFornecedorInput) {
  return prisma.fornecedor.create({
    data: {
      tenantId: '', // auto-injected by tenant extension
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      document: data.document || null,
      address: data.address ?? undefined,
      notes: data.notes || null,
    },
  });
}

export async function listFornecedores(query: ListFornecedorQuery) {
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
    prisma.fornecedor.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.fornecedor.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function getFornecedor(id: string) {
  return prisma.fornecedor.findUnique({ where: { id } });
}

export async function updateFornecedor(id: string, data: UpdateFornecedorInput) {
  return prisma.fornecedor.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.document !== undefined && { document: data.document || null }),
      ...(data.address !== undefined && { address: data.address ?? undefined }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
  });
}

export async function deleteFornecedor(id: string) {
  return prisma.fornecedor.delete({ where: { id } });
}
