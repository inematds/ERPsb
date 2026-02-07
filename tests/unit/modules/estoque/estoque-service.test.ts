import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMovimentacaoCreate = vi.fn();
const mockMovimentacaoGroupBy = vi.fn();
const mockMovimentacaoFindMany = vi.fn();
const mockMovimentacaoCount = vi.fn();
const mockProdutoFindMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    movimentacaoEstoque: {
      create: (...args: unknown[]) => mockMovimentacaoCreate(...args),
      groupBy: (...args: unknown[]) => mockMovimentacaoGroupBy(...args),
      findMany: (...args: unknown[]) => mockMovimentacaoFindMany(...args),
      count: (...args: unknown[]) => mockMovimentacaoCount(...args),
    },
    produto: {
      findMany: (...args: unknown[]) => mockProdutoFindMany(...args),
    },
  },
}));

import {
  getSaldoEstoque,
  getSaldosTodos,
  registrarEntrada,
  registrarAjuste,
  registrarSaidaVenda,
  listarMovimentacoes,
  getAlertasEstoque,
} from '@/modules/estoque/estoque.service';

describe('Estoque Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSaldoEstoque', () => {
    it('should calculate saldo from movimentacoes', async () => {
      mockMovimentacaoGroupBy.mockResolvedValueOnce([
        { type: 'ENTRADA', _sum: { quantity: 100 } },
        { type: 'SAIDA', _sum: { quantity: 30 } },
      ]);
      const saldo = await getSaldoEstoque('t1', 'p1');
      expect(saldo).toBe(70);
    });

    it('should return 0 for no movimentacoes', async () => {
      mockMovimentacaoGroupBy.mockResolvedValueOnce([]);
      const saldo = await getSaldoEstoque('t1', 'p1');
      expect(saldo).toBe(0);
    });

    it('should handle AJUSTE (positive and negative)', async () => {
      mockMovimentacaoGroupBy.mockResolvedValueOnce([
        { type: 'ENTRADA', _sum: { quantity: 50 } },
        { type: 'AJUSTE', _sum: { quantity: -10 } },
      ]);
      const saldo = await getSaldoEstoque('t1', 'p1');
      expect(saldo).toBe(40);
    });
  });

  describe('getSaldosTodos', () => {
    it('should return saldos for all tracked products', async () => {
      mockProdutoFindMany.mockResolvedValueOnce([
        { id: 'p1', name: 'Produto A', unit: 'un', stockMin: 5 },
        { id: 'p2', name: 'Produto B', unit: 'kg', stockMin: 0 },
      ]);
      mockMovimentacaoGroupBy.mockResolvedValueOnce([
        { productId: 'p1', type: 'ENTRADA', _sum: { quantity: 10 } },
        { productId: 'p1', type: 'SAIDA', _sum: { quantity: 3 } },
      ]);

      const result = await getSaldosTodos('t1');
      expect(result).toHaveLength(2);
      expect(result[0].saldo).toBe(7);
      expect(result[0].abaixoMinimo).toBe(false);
      expect(result[1].saldo).toBe(0);
    });
  });

  describe('registrarEntrada', () => {
    it('should create ENTRADA movimentacao', async () => {
      mockMovimentacaoCreate.mockResolvedValueOnce({
        id: 'm1', type: 'ENTRADA', quantity: 10, reason: 'compra',
      });
      const result = await registrarEntrada('t1', { productId: 'p1', quantity: 10 });
      expect(result.type).toBe('ENTRADA');
      expect(mockMovimentacaoCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'ENTRADA', quantity: 10, reason: 'compra' }),
        }),
      );
    });
  });

  describe('registrarAjuste', () => {
    it('should create AJUSTE movimentacao', async () => {
      mockMovimentacaoCreate.mockResolvedValueOnce({
        id: 'm2', type: 'AJUSTE', quantity: -5, reason: 'ajuste_manual',
      });
      const result = await registrarAjuste('t1', { productId: 'p1', quantity: -5, notes: 'Perda' });
      expect(result.type).toBe('AJUSTE');
      expect(mockMovimentacaoCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'AJUSTE', notes: 'Perda' }),
        }),
      );
    });
  });

  describe('registrarSaidaVenda', () => {
    it('should create SAIDA for each item', async () => {
      mockMovimentacaoCreate
        .mockResolvedValueOnce({ id: 'm1' })
        .mockResolvedValueOnce({ id: 'm2' });

      const result = await registrarSaidaVenda('t1', 'sale-1', [
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 3 },
      ]);
      expect(result).toHaveLength(2);
      expect(mockMovimentacaoCreate).toHaveBeenCalledTimes(2);
    });
  });

  describe('listarMovimentacoes', () => {
    it('should return paginated results', async () => {
      mockMovimentacaoFindMany.mockResolvedValueOnce([{ id: 'm1' }]);
      mockMovimentacaoCount.mockResolvedValueOnce(1);

      const result = await listarMovimentacoes('t1', { page: 1, pageSize: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by type', async () => {
      mockMovimentacaoFindMany.mockResolvedValueOnce([]);
      mockMovimentacaoCount.mockResolvedValueOnce(0);

      await listarMovimentacoes('t1', { page: 1, pageSize: 20, type: 'ENTRADA' });
      expect(mockMovimentacaoFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'ENTRADA' }),
        }),
      );
    });
  });

  describe('getAlertasEstoque', () => {
    it('should return products below minimum', async () => {
      mockProdutoFindMany.mockResolvedValueOnce([
        { id: 'p1', name: 'Produto A', unit: 'un', stockMin: 10 },
        { id: 'p2', name: 'Produto B', unit: 'un', stockMin: 0 },
      ]);
      mockMovimentacaoGroupBy.mockResolvedValueOnce([
        { productId: 'p1', type: 'ENTRADA', _sum: { quantity: 5 } },
      ]);

      const alertas = await getAlertasEstoque('t1');
      expect(alertas).toHaveLength(1);
      expect(alertas[0].name).toBe('Produto A');
    });
  });
});
