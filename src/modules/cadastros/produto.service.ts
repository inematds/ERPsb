import { prisma } from '@/lib/prisma';
import type { CreateProdutoInput, UpdateProdutoInput, ListProdutoQuery } from './produto.schema';

export async function createProduto(data: CreateProdutoInput) {
  const trackStock = data.trackStock ?? (data.type === 'PRODUTO');
  const unit = data.unit ?? (data.type === 'SERVICO' ? 'srv' : 'un');

  return prisma.produto.create({
    data: {
      tenantId: '', // auto-injected by tenant extension
      name: data.name,
      type: data.type,
      sellPrice: data.sellPrice,
      costPrice: data.costPrice ?? null,
      unit,
      barcode: data.barcode || null,
      ncm: data.ncm || null,
      description: data.description || null,
      stockMin: data.stockMin ?? 0,
      trackStock,
      active: true,
    },
  });
}

export async function listProdutos(query: ListProdutoQuery) {
  const { search, page, pageSize, type, active } = query;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { barcode: { contains: search } },
    ];
  }

  if (type) where.type = type;
  if (active !== undefined) where.active = active;

  const [data, total] = await Promise.all([
    prisma.produto.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.produto.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function getProduto(id: string) {
  return prisma.produto.findUnique({ where: { id } });
}

export async function updateProduto(id: string, data: UpdateProdutoInput) {
  return prisma.produto.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.sellPrice !== undefined && { sellPrice: data.sellPrice }),
      ...(data.costPrice !== undefined && { costPrice: data.costPrice ?? null }),
      ...(data.unit !== undefined && { unit: data.unit }),
      ...(data.barcode !== undefined && { barcode: data.barcode || null }),
      ...(data.ncm !== undefined && { ncm: data.ncm || null }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.stockMin !== undefined && { stockMin: data.stockMin ?? 0 }),
      ...(data.trackStock !== undefined && { trackStock: data.trackStock }),
    },
  });
}

export async function deleteProduto(id: string) {
  return prisma.produto.update({
    where: { id },
    data: { active: false },
  });
}
