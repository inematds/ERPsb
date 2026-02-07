import { prisma } from '@/lib/prisma';
import type { CreateFormaPagamentoInput, UpdateFormaPagamentoInput } from './forma-pagamento.schema';

const DEFAULT_CONFIGS: Record<string, { name: string; type: string; installments: number; fee: number; isDefault: boolean }> = {
  PIX: { name: 'PIX', type: 'PIX', installments: 1, fee: 0, isDefault: true },
  DINHEIRO: { name: 'Dinheiro', type: 'DINHEIRO', installments: 1, fee: 0, isDefault: false },
  CARTAO_DEBITO: { name: 'Cartao de Debito', type: 'DEBITO', installments: 1, fee: 150, isDefault: false },
  CARTAO_CREDITO: { name: 'Cartao de Credito', type: 'CREDITO', installments: 12, fee: 350, isDefault: false },
  BOLETO: { name: 'Boleto', type: 'BOLETO', installments: 1, fee: 250, isDefault: false },
};

export async function createFormaPagamento(data: CreateFormaPagamentoInput) {
  return prisma.formaPagamento.create({
    data: {
      tenantId: '', // auto-injected by tenant extension
      name: data.name,
      type: data.type,
      installments: data.installments ?? 1,
      fee: data.fee ?? 0,
    },
  });
}

export async function createDefaultFormasPagamento(paymentMethods: string[]) {
  const formas = paymentMethods
    .map((method) => DEFAULT_CONFIGS[method])
    .filter(Boolean);

  const results = [];
  for (const forma of formas) {
    const created = await prisma.formaPagamento.create({
      data: {
        tenantId: '', // auto-injected by tenant extension
        name: forma.name,
        type: forma.type,
        installments: forma.installments,
        fee: forma.fee,
        isDefault: forma.isDefault,
      },
    });
    results.push(created);
  }

  return results;
}

export async function listFormasPagamento() {
  return prisma.formaPagamento.findMany({
    orderBy: { createdAt: 'asc' },
  });
}

export async function updateFormaPagamento(id: string, data: UpdateFormaPagamentoInput) {
  return prisma.formaPagamento.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      ...(data.installments !== undefined && { installments: data.installments }),
      ...(data.fee !== undefined && { fee: data.fee }),
    },
  });
}

export async function toggleFormaPagamento(id: string) {
  const forma = await prisma.formaPagamento.findUnique({ where: { id } });
  if (!forma) throw new Error('Forma de pagamento nao encontrada');

  return prisma.formaPagamento.update({
    where: { id },
    data: { active: !forma.active },
  });
}
