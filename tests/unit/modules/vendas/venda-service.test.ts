import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockVendaCreate = vi.fn();
const mockVendaFindUnique = vi.fn();
const mockVendaFindMany = vi.fn();
const mockVendaCount = vi.fn();
const mockVendaUpdate = vi.fn();
const mockContaReceberCreate = vi.fn();
const mockContaReceberUpdateMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    venda: {
      create: (...args: unknown[]) => mockVendaCreate(...args),
      findUnique: (...args: unknown[]) => mockVendaFindUnique(...args),
      findMany: (...args: unknown[]) => mockVendaFindMany(...args),
      count: (...args: unknown[]) => mockVendaCount(...args),
      update: (...args: unknown[]) => mockVendaUpdate(...args),
    },
    contaReceber: {
      create: (...args: unknown[]) => mockContaReceberCreate(...args),
      updateMany: (...args: unknown[]) => mockContaReceberUpdateMany(...args),
    },
  },
}));

import { createVenda, confirmVenda, cancelVenda, listVendas } from '@/modules/vendas/venda.service';

describe('Venda Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createVenda', () => {
    it('should calculate subtotal and total correctly', async () => {
      mockVendaCreate.mockResolvedValueOnce({ id: 'v1' });

      await createVenda({
        items: [
          { productId: 'p1', name: 'A', quantity: 2, unitPrice: 5000, total: 10000 },
          { productId: 'p2', name: 'B', quantity: 1, unitPrice: 3000, total: 3000 },
        ],
        paymentMethodId: 'pm-1',
        discount: 0,
      });

      expect(mockVendaCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 13000,
            total: 13000,
            discount: 0,
            status: 'RASCUNHO',
          }),
        }),
      );
    });

    it('should apply discount correctly', async () => {
      mockVendaCreate.mockResolvedValueOnce({ id: 'v1' });

      await createVenda({
        items: [
          { productId: 'p1', name: 'A', quantity: 1, unitPrice: 10000, total: 10000 },
        ],
        paymentMethodId: 'pm-1',
        discount: 2000,
      });

      expect(mockVendaCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 10000,
            discount: 2000,
            total: 8000,
          }),
        }),
      );
    });

    it('should not allow negative total', async () => {
      mockVendaCreate.mockResolvedValueOnce({ id: 'v1' });

      await createVenda({
        items: [
          { productId: 'p1', name: 'A', quantity: 1, unitPrice: 1000, total: 1000 },
        ],
        paymentMethodId: 'pm-1',
        discount: 5000,
      });

      expect(mockVendaCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 1000,
            discount: 5000,
            total: 0,
          }),
        }),
      );
    });
  });

  describe('confirmVenda', () => {
    it('should set status to CONFIRMADA and create ContaReceber', async () => {
      mockVendaFindUnique.mockResolvedValueOnce({
        id: 'v1',
        tenantId: 't1',
        total: 15000,
        status: 'RASCUNHO',
        clientId: 'c1',
        paymentMethod: { type: 'pix' },
      });
      mockVendaCount.mockResolvedValueOnce(5);
      mockVendaUpdate.mockResolvedValueOnce({ id: 'v1', status: 'CONFIRMADA', number: 6 });
      mockContaReceberCreate.mockResolvedValueOnce({ id: 'cr1' });

      const result = await confirmVenda('v1');

      expect(result.status).toBe('CONFIRMADA');
      expect(result.number).toBe(6);
      expect(mockContaReceberCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            description: 'Venda #6',
            amount: 15000,
            status: 'RECEBIDO',
            category: 'Vendas',
            clientId: 'c1',
            saleId: 'v1',
          }),
        }),
      );
    });

    it('should throw if venda is not RASCUNHO', async () => {
      mockVendaFindUnique.mockResolvedValueOnce({
        id: 'v1',
        status: 'CONFIRMADA',
      });

      await expect(confirmVenda('v1')).rejects.toThrow('Venda ja foi confirmada ou cancelada');
    });
  });

  describe('cancelVenda', () => {
    it('should cancel venda and linked ContaReceber', async () => {
      mockVendaFindUnique.mockResolvedValueOnce({
        id: 'v1',
        status: 'CONFIRMADA',
        contasReceber: [{ id: 'cr1' }],
      });
      mockVendaUpdate.mockResolvedValueOnce({ id: 'v1', status: 'CANCELADA' });
      mockContaReceberUpdateMany.mockResolvedValueOnce({ count: 1 });

      const result = await cancelVenda('v1');

      expect(result.status).toBe('CANCELADA');
      expect(mockContaReceberUpdateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { saleId: 'v1' },
          data: { status: 'CANCELADO' },
        }),
      );
    });

    it('should throw if venda is already cancelled', async () => {
      mockVendaFindUnique.mockResolvedValueOnce({
        id: 'v1',
        status: 'CANCELADA',
        contasReceber: [],
      });

      await expect(cancelVenda('v1')).rejects.toThrow('Venda ja esta cancelada');
    });
  });

  describe('listVendas', () => {
    it('should filter by status and return paginated results', async () => {
      mockVendaFindMany.mockResolvedValueOnce([{ id: 'v1' }]);
      mockVendaCount.mockResolvedValueOnce(1);

      const result = await listVendas({ page: 1, pageSize: 20, status: 'CONFIRMADA' });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockVendaFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'CONFIRMADA' }),
        }),
      );
    });
  });
});
