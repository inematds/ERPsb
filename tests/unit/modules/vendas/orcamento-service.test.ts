import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockOrcamentoCreate = vi.fn();
const mockOrcamentoFindUnique = vi.fn();
const mockOrcamentoFindMany = vi.fn();
const mockOrcamentoCount = vi.fn();
const mockOrcamentoUpdate = vi.fn();
const mockOrcamentoUpdateMany = vi.fn();
const mockVendaCreate = vi.fn();
const mockVendaFindUnique = vi.fn();
const mockVendaCount = vi.fn();
const mockVendaUpdate = vi.fn();
const mockContaReceberCreate = vi.fn();
const mockFormaPagamentoFindFirst = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    orcamento: {
      create: (...args: unknown[]) => mockOrcamentoCreate(...args),
      findUnique: (...args: unknown[]) => mockOrcamentoFindUnique(...args),
      findMany: (...args: unknown[]) => mockOrcamentoFindMany(...args),
      count: (...args: unknown[]) => mockOrcamentoCount(...args),
      update: (...args: unknown[]) => mockOrcamentoUpdate(...args),
      updateMany: (...args: unknown[]) => mockOrcamentoUpdateMany(...args),
    },
    venda: {
      create: (...args: unknown[]) => mockVendaCreate(...args),
      findUnique: (...args: unknown[]) => mockVendaFindUnique(...args),
      count: (...args: unknown[]) => mockVendaCount(...args),
      update: (...args: unknown[]) => mockVendaUpdate(...args),
    },
    contaReceber: {
      create: (...args: unknown[]) => mockContaReceberCreate(...args),
    },
    formaPagamento: {
      findFirst: (...args: unknown[]) => mockFormaPagamentoFindFirst(...args),
    },
  },
}));

import {
  createOrcamento,
  convertToVenda,
  duplicateOrcamento,
  markExpired,
  listOrcamentos,
} from '@/modules/vendas/orcamento.service';

describe('Orcamento Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // markExpired is called by listOrcamentos, mock it by default
    mockOrcamentoUpdateMany.mockResolvedValue({ count: 0 });
  });

  describe('createOrcamento', () => {
    it('should calculate subtotal and total correctly', async () => {
      mockOrcamentoCount.mockResolvedValueOnce(3);
      mockOrcamentoCreate.mockResolvedValueOnce({ id: 'o1' });

      await createOrcamento({
        clientId: 'c1',
        items: [
          { productId: 'p1', name: 'A', quantity: 2, unitPrice: 5000, total: 10000 },
          { productId: 'p2', name: 'B', quantity: 1, unitPrice: 3000, total: 3000 },
        ],
        validUntil: '2026-03-15',
        discount: 0,
      });

      expect(mockOrcamentoCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 13000,
            total: 13000,
            discount: 0,
            status: 'PENDENTE',
            number: 4,
            clientId: 'c1',
          }),
        }),
      );
    });

    it('should apply discount correctly', async () => {
      mockOrcamentoCount.mockResolvedValueOnce(0);
      mockOrcamentoCreate.mockResolvedValueOnce({ id: 'o1' });

      await createOrcamento({
        clientId: 'c1',
        items: [
          { productId: 'p1', name: 'A', quantity: 1, unitPrice: 10000, total: 10000 },
        ],
        validUntil: '2026-03-15',
        discount: 2000,
      });

      expect(mockOrcamentoCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 10000,
            discount: 2000,
            total: 8000,
          }),
        }),
      );
    });
  });

  describe('convertToVenda', () => {
    it('should create venda, confirm, and set CONVERTIDO', async () => {
      const orcamentoData = {
        id: 'o1',
        tenantId: 't1',
        clientId: 'c1',
        items: [{ productId: 'p1', name: 'A', quantity: 1, unitPrice: 5000, total: 5000 }],
        subtotal: 5000,
        discount: 0,
        total: 5000,
        status: 'PENDENTE',
      };

      mockOrcamentoFindUnique.mockResolvedValueOnce(orcamentoData);
      mockFormaPagamentoFindFirst.mockResolvedValueOnce({ id: 'pm-1' });

      // createVenda mock
      mockVendaCreate.mockResolvedValueOnce({ id: 'v1', status: 'RASCUNHO' });

      // confirmVenda mocks
      mockVendaFindUnique.mockResolvedValueOnce({
        id: 'v1',
        tenantId: 't1',
        total: 5000,
        status: 'RASCUNHO',
        clientId: 'c1',
        paymentMethod: { type: 'pix' },
      });
      mockVendaCount.mockResolvedValueOnce(5);
      mockVendaUpdate.mockResolvedValueOnce({ id: 'v1', status: 'CONFIRMADA', number: 6 });
      mockContaReceberCreate.mockResolvedValueOnce({ id: 'cr1' });

      // updateOrcamento mock
      mockOrcamentoUpdate.mockResolvedValueOnce({ id: 'o1', status: 'CONVERTIDO', saleId: 'v1' });

      const result = await convertToVenda('o1');

      expect(result.status).toBe('CONFIRMADA');
      expect(mockOrcamentoUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'o1' },
          data: { status: 'CONVERTIDO', saleId: 'v1' },
        }),
      );
    });

    it('should reject if not PENDENTE or APROVADO', async () => {
      mockOrcamentoFindUnique.mockResolvedValueOnce({
        id: 'o1',
        status: 'CONVERTIDO',
      });

      await expect(convertToVenda('o1')).rejects.toThrow(
        'Apenas orcamentos pendentes ou aprovados podem ser convertidos',
      );
    });
  });

  describe('duplicateOrcamento', () => {
    it('should copy data with PENDENTE status', async () => {
      mockOrcamentoFindUnique.mockResolvedValueOnce({
        id: 'o1',
        tenantId: 't1',
        clientId: 'c1',
        items: [{ productId: 'p1', name: 'A', quantity: 1, unitPrice: 5000, total: 5000 }],
        subtotal: 5000,
        discount: 0,
        total: 5000,
        notes: 'Original note',
      });
      mockOrcamentoCount.mockResolvedValueOnce(10);
      mockOrcamentoCreate.mockResolvedValueOnce({ id: 'o2', number: 11 });

      const result = await duplicateOrcamento('o1');

      expect(result.number).toBe(11);
      expect(mockOrcamentoCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 't1',
            clientId: 'c1',
            subtotal: 5000,
            total: 5000,
            status: 'PENDENTE',
            number: 11,
          }),
        }),
      );
    });
  });

  describe('markExpired', () => {
    it('should update overdue PENDENTE orcamentos to EXPIRADO', async () => {
      mockOrcamentoUpdateMany.mockResolvedValueOnce({ count: 2 });

      const result = await markExpired();

      expect(result.count).toBe(2);
      expect(mockOrcamentoUpdateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDENTE',
            validUntil: expect.objectContaining({ lt: expect.any(Date) }),
          }),
          data: { status: 'EXPIRADO' },
        }),
      );
    });
  });

  describe('listOrcamentos', () => {
    it('should filter by status and return paginated results', async () => {
      mockOrcamentoFindMany.mockResolvedValueOnce([{ id: 'o1' }]);
      mockOrcamentoCount.mockResolvedValueOnce(1);

      const result = await listOrcamentos({ page: 1, pageSize: 20, status: 'PENDENTE' });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockOrcamentoFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDENTE' }),
        }),
      );
    });
  });
});
