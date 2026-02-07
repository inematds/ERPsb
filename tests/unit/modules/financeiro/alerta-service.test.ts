import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockContaReceberAggregate = vi.fn();
const mockContaPagarAggregate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contaReceber: {
      aggregate: (...args: unknown[]) => mockContaReceberAggregate(...args),
    },
    contaPagar: {
      aggregate: (...args: unknown[]) => mockContaPagarAggregate(...args),
    },
  },
}));

import {
  getAlertas,
  calcularQuantoPossoRetirar,
  getResumoMensal,
} from '@/modules/financeiro/alerta.service';

describe('Alerta Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAlertas', () => {
    function setupDefaultMocks(overrides?: {
      vencidas?: { sum: number | null; count: number };
      proximas7d?: number | null;
      saldoRecebido?: number | null;
      saldoPago?: number | null;
      despesas30d?: number | null;
      receitas30d?: number | null;
    }) {
      const defaults = {
        vencidas: { sum: null, count: 0 },
        proximas7d: null,
        saldoRecebido: null,
        saldoPago: null,
        despesas30d: null,
        receitas30d: null,
        ...overrides,
      };

      // The function makes multiple aggregate calls. We need to mock them in order.
      // Call order for getAlertas:
      // 1. contaPagar.aggregate (vencidas - status PENDENTE, dueDate < hoje)
      // 2. contaPagar.aggregate (proximas 7d)
      // 3. contaReceber.aggregate (saldo recebido) + contaPagar.aggregate (saldo pago) [Promise.all]
      // 4. contaPagar.aggregate (despesas 30d) + contaReceber.aggregate (receitas 30d) [Promise.all - conditional]

      mockContaPagarAggregate
        .mockResolvedValueOnce({
          _sum: { amount: defaults.vencidas.sum },
          _count: { id: defaults.vencidas.count },
        })
        .mockResolvedValueOnce({
          _sum: { amount: defaults.proximas7d },
        })
        .mockResolvedValueOnce({
          _sum: { amount: defaults.saldoPago },
        })
        .mockResolvedValueOnce({
          _sum: { amount: defaults.despesas30d },
        });

      mockContaReceberAggregate
        .mockResolvedValueOnce({
          _sum: { amount: defaults.saldoRecebido },
        })
        .mockResolvedValueOnce({
          _sum: { amount: defaults.receitas30d },
        });
    }

    it('should return contas_vencidas alert when overdue bills exist', async () => {
      setupDefaultMocks({
        vencidas: { sum: 150000, count: 3 },
        saldoRecebido: 500000,
        saldoPago: 200000,
      });

      const alertas = await getAlertas();

      const vencidas = alertas.find((a) => a.type === 'contas_vencidas');
      expect(vencidas).toBeDefined();
      expect(vencidas!.severity).toBe('critical');
      expect(vencidas!.amount).toBe(150000);
    });

    it('should return contas_proximos_7_dias when amount > 50% of saldo', async () => {
      // Saldo: 500000 - 200000 = 300000
      // Proximas 7d: 200000 > 300000 * 0.5 = 150000 => trigger
      setupDefaultMocks({
        proximas7d: 200000,
        saldoRecebido: 500000,
        saldoPago: 200000,
      });

      const alertas = await getAlertas();

      const prox = alertas.find((a) => a.type === 'contas_proximos_7_dias');
      expect(prox).toBeDefined();
      expect(prox!.severity).toBe('warning');
      expect(prox!.amount).toBe(200000);
    });

    it('should NOT return contas_proximos_7_dias when amount <= 50% of saldo', async () => {
      // Saldo: 500000 - 200000 = 300000
      // Proximas 7d: 100000 <= 300000 * 0.5 = 150000 => no trigger
      setupDefaultMocks({
        proximas7d: 100000,
        saldoRecebido: 500000,
        saldoPago: 200000,
      });

      const alertas = await getAlertas();
      const prox = alertas.find((a) => a.type === 'contas_proximos_7_dias');
      expect(prox).toBeUndefined();
    });

    it('should return no alerts when no risk situations', async () => {
      setupDefaultMocks({
        saldoRecebido: 1000000,
        saldoPago: 200000,
        receitas30d: 500000,
        despesas30d: 100000,
      });

      const alertas = await getAlertas();
      expect(alertas).toHaveLength(0);
    });

    it('should return caixa_apertado_30_dias when expenses > income', async () => {
      setupDefaultMocks({
        saldoRecebido: 500000,
        saldoPago: 200000,
        despesas30d: 400000,
        receitas30d: 200000,
      });

      const alertas = await getAlertas();
      const apertado = alertas.find((a) => a.type === 'caixa_apertado_30_dias');
      expect(apertado).toBeDefined();
      expect(apertado!.severity).toBe('warning');
    });
  });

  describe('calcularQuantoPossoRetirar', () => {
    it('should calculate withdrawal amount correctly', async () => {
      // saldo = 500000 - 200000 = 300000
      // contas 30d = 100000
      // receita media mensal = 200000 (mock 3 meses iguais)
      // reserva = 200000 * 0.10 = 20000
      // retiravel = 300000 - 100000 - 20000 = 180000
      mockContaReceberAggregate
        .mockResolvedValueOnce({ _sum: { amount: 500000 } }) // saldo recebido
        .mockResolvedValueOnce({ _sum: { amount: 200000 } }) // mes -1
        .mockResolvedValueOnce({ _sum: { amount: 200000 } }) // mes -2
        .mockResolvedValueOnce({ _sum: { amount: 200000 } }); // mes -3

      mockContaPagarAggregate
        .mockResolvedValueOnce({ _sum: { amount: 200000 } }) // saldo pago
        .mockResolvedValueOnce({ _sum: { amount: 100000 } }); // contas 30d

      const result = await calcularQuantoPossoRetirar();
      expect(result).toBe(180000);
    });

    it('should return 0 when saldo is insufficient', async () => {
      // saldo = 100000 - 200000 = -100000
      mockContaReceberAggregate
        .mockResolvedValueOnce({ _sum: { amount: 100000 } })
        .mockResolvedValueOnce({ _sum: { amount: 0 } })
        .mockResolvedValueOnce({ _sum: { amount: 0 } })
        .mockResolvedValueOnce({ _sum: { amount: 0 } });

      mockContaPagarAggregate
        .mockResolvedValueOnce({ _sum: { amount: 200000 } })
        .mockResolvedValueOnce({ _sum: { amount: 50000 } });

      const result = await calcularQuantoPossoRetirar();
      expect(result).toBe(0);
    });

    it('should include 10% reserve from average monthly revenue', async () => {
      // saldo = 1000000 - 0 = 1000000
      // contas 30d = 0
      // receita media = (300000+300000+300000)/3 = 300000
      // reserva = 300000 * 0.10 = 30000
      // retiravel = 1000000 - 0 - 30000 = 970000
      mockContaReceberAggregate
        .mockResolvedValueOnce({ _sum: { amount: 1000000 } })
        .mockResolvedValueOnce({ _sum: { amount: 300000 } })
        .mockResolvedValueOnce({ _sum: { amount: 300000 } })
        .mockResolvedValueOnce({ _sum: { amount: 300000 } });

      mockContaPagarAggregate
        .mockResolvedValueOnce({ _sum: { amount: 0 } })
        .mockResolvedValueOnce({ _sum: { amount: 0 } });

      const result = await calcularQuantoPossoRetirar();
      expect(result).toBe(970000);
    });
  });

  describe('getResumoMensal', () => {
    it('should return current month receipts and expenses', async () => {
      mockContaReceberAggregate.mockResolvedValueOnce({
        _sum: { amount: 350000 },
      });
      mockContaPagarAggregate.mockResolvedValueOnce({
        _sum: { amount: 180000 },
      });

      const result = await getResumoMensal();

      expect(result.receitas).toBe(350000);
      expect(result.despesas).toBe(180000);
    });

    it('should return 0 when no data for current month', async () => {
      mockContaReceberAggregate.mockResolvedValueOnce({
        _sum: { amount: null },
      });
      mockContaPagarAggregate.mockResolvedValueOnce({
        _sum: { amount: null },
      });

      const result = await getResumoMensal();

      expect(result.receitas).toBe(0);
      expect(result.despesas).toBe(0);
    });
  });
});
