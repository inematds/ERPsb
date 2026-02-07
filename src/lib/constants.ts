export const BUSINESS_TYPES = [
  { value: 'SERVICOS', label: 'Servicos' },
  { value: 'COMERCIO', label: 'Comercio' },
  { value: 'ALIMENTACAO', label: 'Alimentacao' },
  { value: 'BELEZA', label: 'Beleza' },
  { value: 'OUTRO', label: 'Outro' },
] as const;

export const MONTHLY_REVENUE_RANGES = [
  { value: 'ATE_5K', label: 'Ate R$ 5.000' },
  { value: '5K_20K', label: 'R$ 5.000 a R$ 20.000' },
  { value: '20K_100K', label: 'R$ 20.000 a R$ 100.000' },
  { value: 'ACIMA_100K', label: 'Acima de R$ 100.000' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'CREDITO', label: 'Cartao de Credito' },
  { value: 'DEBITO', label: 'Cartao de Debito' },
  { value: 'BOLETO', label: 'Boleto' },
] as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Aluguel',
  'Funcionarios',
  'Fornecedores',
  'Impostos',
  'Marketing',
  'Servicos',
  'Outros',
] as const;

export const DEFAULT_INCOME_CATEGORIES = ['Vendas', 'Servicos', 'Outros'] as const;

export function determineTenantType(hasCnpj: boolean, monthlyRevenue: string): string {
  if (!hasCnpj) return 'INFORMAL';
  if (monthlyRevenue === 'ATE_5K' || monthlyRevenue === '5K_20K') return 'MEI';
  return 'ME';
}

export function suggestPlan(monthlyRevenue: string): string {
  switch (monthlyRevenue) {
    case 'ATE_5K':
      return 'FREE';
    case '5K_20K':
      return 'STARTER';
    case '20K_100K':
      return 'GROWTH';
    case 'ACIMA_100K':
      return 'PRO';
    default:
      return 'FREE';
  }
}
