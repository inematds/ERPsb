import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockContaReceberAggregate = vi.fn();
const mockContaPagarAggregate = vi.fn();
const mockContaPagarFindMany = vi.fn();
const mockContaReceberFindMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contaReceber: {
      aggregate: (...args: unknown[]) => mockContaReceberAggregate(...args),
      findMany: (...args: unknown[]) => mockContaReceberFindMany(...args),
    },
    contaPagar: {
      aggregate: (...args: unknown[]) => mockContaPagarAggregate(...args),
      findMany: (...args: unknown[]) => mockContaPagarFindMany(...args),
    },
  },
}));

import { getSemaforoStatus, getPendingTotals } from '@/modules/financeiro/dashboard.service';

describe('Dashboard Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSemaforoStatus', () => {
    it('should return VERDE for saldo covering 30+ days', () => {
      // Despesas de R$ 3.000 no mes (300000 centavos), mes de 30 dias
      // Despesa media diaria = 300000/30 = 10000
      // Saldo de R$ 5.000 (500000) => 500000/10000 = 50 dias
      const result = getSemaforoStatus(500000, 300000);
      expect(result.level).toBe('VERDE');
      expect(result.diasCobertura).toBeGreaterThanOrEqual(30);
    });

    it('should return AMARELO for 7-30 days coverage', () => {
      // Despesas de R$ 3.000 (300000), mes de ~30 dias
      // Media diaria ~10000
      // Saldo de R$ 1.500 (150000) => 150000/10000 = 15 dias
      const result = getSemaforoStatus(150000, 300000);
      expect(result.level).toBe('AMARELO');
      expect(result.diasCobertura).toBeGreaterThanOrEqual(7);
      expect(result.diasCobertura).toBeLessThan(30);
    });

    it('should return VERMELHO for less than 7 days coverage', () => {
      // Despesas de R$ 3.000 (300000), media diaria ~10000
      // Saldo de R$ 500 (50000) => 50000/10000 = 5 dias
      const result = getSemaforoStatus(50000, 300000);
      expect(result.level).toBe('VERMELHO');
      expect(result.diasCobertura).toBeLessThan(7);
    });

    it('should return VERMELHO for negative saldo', () => {
      const result = getSemaforoStatus(-100000, 300000);
      expect(result.level).toBe('VERMELHO');
    });

    it('should return VERDE when no expenses (sem dados)', () => {
      const result = getSemaforoStatus(100000, 0);
      expect(result.level).toBe('VERDE');
      expect(result.despesaMediaDiaria).toBe(0);
    });

    it('should return VERDE for zero saldo with zero expenses', () => {
      const result = getSemaforoStatus(0, 0);
      expect(result.level).toBe('VERDE');
    });

    it('should calculate despesa media diaria correctly', () => {
      const result = getSemaforoStatus(500000, 300000);
      expect(result.despesaMediaDiaria).toBeGreaterThan(0);
    });
  });

  describe('getPendingTotals', () => {
    it('should sum pending accounts correctly', async () => {
      mockContaPagarAggregate.mockResolvedValue({
        _sum: { amount: 250000 },
      });
      mockContaReceberAggregate.mockResolvedValue({
        _sum: { amount: 500000 },
      });

      const result = await getPendingTotals();

      expect(result.totalPagar).toBe(250000);
      expect(result.totalReceber).toBe(500000);
    });

    it('should return 0 when no pending accounts', async () => {
      mockContaPagarAggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      mockContaReceberAggregate.mockResolvedValue({
        _sum: { amount: null },
      });

      const result = await getPendingTotals();

      expect(result.totalPagar).toBe(0);
      expect(result.totalReceber).toBe(0);
    });

    it('should filter by PENDENTE and VENCIDO statuses', async () => {
      mockContaPagarAggregate.mockResolvedValue({ _sum: { amount: 0 } });
      mockContaReceberAggregate.mockResolvedValue({ _sum: { amount: 0 } });

      await getPendingTotals();

      expect(mockContaPagarAggregate).toHaveBeenCalledWith({
        where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
        _sum: { amount: true },
      });
      expect(mockContaReceberAggregate).toHaveBeenCalledWith({
        where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
        _sum: { amount: true },
      });
    });
  });
});
