import { prisma } from '@/lib/prisma';
import type { RegistrarEntradaInput, RegistrarAjusteInput, ListMovimentacoesQuery } from './estoque.schema';

export async function getSaldoEstoque(tenantId: string, productId: string): Promise<number> {
  const result = await prisma.movimentacaoEstoque.groupBy({
    by: ['type'],
    where: { tenantId, productId },
    _sum: { quantity: true },
  });

  let saldo = 0;
  for (const row of result) {
    const qty = row._sum.quantity ?? 0;
    if (row.type === 'ENTRADA') saldo += qty;
    else if (row.type === 'SAIDA') saldo -= qty;
    else if (row.type === 'AJUSTE') saldo += qty; // AJUSTE can be positive or negative
  }

  return saldo;
}

export async function getSaldosTodos(tenantId: string) {
  const produtos = await prisma.produto.findMany({
    where: { tenantId, trackStock: true, active: true },
    select: { id: true, name: true, unit: true, stockMin: true },
  });

  const movimentacoes = await prisma.movimentacaoEstoque.groupBy({
    by: ['productId', 'type'],
    where: { tenantId },
    _sum: { quantity: true },
  });

  const saldoMap = new Map<string, number>();
  for (const row of movimentacoes) {
    const current = saldoMap.get(row.productId) ?? 0;
    const qty = row._sum.quantity ?? 0;
    if (row.type === 'ENTRADA') saldoMap.set(row.productId, current + qty);
    else if (row.type === 'SAIDA') saldoMap.set(row.productId, current - qty);
    else if (row.type === 'AJUSTE') saldoMap.set(row.productId, current + qty);
  }

  return produtos.map((p) => ({
    productId: p.id,
    name: p.name,
    unit: p.unit,
    saldo: saldoMap.get(p.id) ?? 0,
    stockMin: p.stockMin ?? 0,
    abaixoMinimo: (saldoMap.get(p.id) ?? 0) <= (p.stockMin ?? 0),
  }));
}

export async function registrarEntrada(tenantId: string, data: RegistrarEntradaInput) {
  return prisma.movimentacaoEstoque.create({
    data: {
      tenantId,
      productId: data.productId,
      type: 'ENTRADA',
      quantity: data.quantity,
      reason: 'compra',
      notes: data.notes ?? null,
    },
  });
}

export async function registrarSaida(
  tenantId: string,
  productId: string,
  quantity: number,
  reason: string,
  referenceId?: string,
) {
  return prisma.movimentacaoEstoque.create({
    data: {
      tenantId,
      productId,
      type: 'SAIDA',
      quantity,
      reason,
      referenceId: referenceId ?? null,
    },
  });
}

export async function registrarAjuste(tenantId: string, data: RegistrarAjusteInput) {
  return prisma.movimentacaoEstoque.create({
    data: {
      tenantId,
      productId: data.productId,
      type: 'AJUSTE',
      quantity: data.quantity,
      reason: 'ajuste_manual',
      notes: data.notes,
    },
  });
}

export async function registrarSaidaVenda(
  tenantId: string,
  saleId: string,
  items: { productId: string; quantity: number }[],
) {
  const creates = items.map((item) =>
    prisma.movimentacaoEstoque.create({
      data: {
        tenantId,
        productId: item.productId,
        type: 'SAIDA',
        quantity: item.quantity,
        reason: 'venda',
        referenceId: saleId,
      },
    }),
  );
  return Promise.all(creates);
}

export async function listarMovimentacoes(tenantId: string, query: ListMovimentacoesQuery) {
  const where: Record<string, unknown> = { tenantId };
  if (query.productId) where.productId = query.productId;
  if (query.type) where.type = query.type;

  const [data, total] = await Promise.all([
    prisma.movimentacaoEstoque.findMany({
      where,
      include: { produto: { select: { name: true, unit: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.movimentacaoEstoque.count({ where }),
  ]);

  return { data, total, page: query.page, pageSize: query.pageSize };
}

export async function getAlertasEstoque(tenantId: string) {
  const saldos = await getSaldosTodos(tenantId);
  return saldos.filter((s) => s.abaixoMinimo && s.stockMin > 0);
}
