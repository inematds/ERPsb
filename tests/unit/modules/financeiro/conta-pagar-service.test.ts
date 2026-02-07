import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockCount = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contaPagar: {
      create: (...args: unknown[]) => mockCreate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}));

import {
  createContaPagar,
  listContasPagar,
  markAsPaid,
  cancelContaPagar,
} from '@/modules/financeiro/conta-pagar.service';

describe('ContaPagar Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createContaPagar', () => {
    it('should create with status PENDENTE', async () => {
      mockCreate.mockResolvedValue({ id: 'cp1', status: 'PENDENTE' });

      await createContaPagar({
        description: 'Aluguel',
        amount: 150000,
        dueDate: '2026-03-01',
        category: 'ALUGUEL',
        recurrent: false,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'PENDENTE',
          description: 'Aluguel',
          amount: 150000,
          category: 'ALUGUEL',
        }),
      });
    });
  });

  describe('listContasPagar', () => {
    it('should filter by status', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listContasPagar({ page: 1, pageSize: 20, status: 'PENDENTE' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDENTE' }),
        }),
      );
    });

    it('should filter by category', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listContasPagar({ page: 1, pageSize: 20, category: 'ALUGUEL' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'ALUGUEL' }),
        }),
      );
    });

    it('should filter by date range', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listContasPagar({
        page: 1,
        pageSize: 20,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dueDate: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });

  describe('markAsPaid', () => {
    it('should set status PAGO and paidDate', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'cp1',
        status: 'PENDENTE',
        recurrent: false,
        dueDate: new Date('2026-03-01'),
      });
      mockUpdate.mockResolvedValue({ id: 'cp1', status: 'PAGO' });

      await markAsPaid('cp1');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'cp1' },
        data: {
          status: 'PAGO',
          paidDate: expect.any(Date),
        },
      });
    });

    it('should create next installment for monthly recurrent', async () => {
      const dueDate = new Date('2026-03-01');
      mockFindUnique.mockResolvedValue({
        id: 'cp1',
        description: 'Aluguel',
        amount: 150000,
        dueDate,
        category: 'ALUGUEL',
        supplierId: null,
        notes: null,
        recurrent: true,
        recurrenceType: 'MENSAL',
      });
      mockUpdate.mockResolvedValue({ id: 'cp1', status: 'PAGO' });
      mockCreate.mockResolvedValue({ id: 'cp2' });

      await markAsPaid('cp1');

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: 'Aluguel',
          amount: 150000,
          recurrent: true,
          recurrenceType: 'MENSAL',
          status: 'PENDENTE',
        }),
      });

      // Check the new dueDate is one month later
      const createCall = mockCreate.mock.calls[0][0];
      const newDueDate = createCall.data.dueDate as Date;
      expect(newDueDate.getUTCMonth()).toBe(3); // April (0-indexed)
    });

    it('should create next installment for weekly recurrent', async () => {
      const dueDate = new Date('2026-03-01');
      mockFindUnique.mockResolvedValue({
        id: 'cp1',
        description: 'Internet',
        amount: 5000,
        dueDate,
        category: 'SERVICOS',
        supplierId: null,
        notes: null,
        recurrent: true,
        recurrenceType: 'SEMANAL',
      });
      mockUpdate.mockResolvedValue({ id: 'cp1', status: 'PAGO' });
      mockCreate.mockResolvedValue({ id: 'cp2' });

      await markAsPaid('cp1');

      const createCall = mockCreate.mock.calls[0][0];
      const newDueDate = createCall.data.dueDate as Date;
      expect(newDueDate.getUTCDate()).toBe(8); // 1 + 7 = 8
    });

    it('should NOT create next installment for non-recurrent', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'cp1',
        recurrent: false,
        dueDate: new Date('2026-03-01'),
      });
      mockUpdate.mockResolvedValue({ id: 'cp1', status: 'PAGO' });

      await markAsPaid('cp1');

      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('cancelContaPagar', () => {
    it('should set status CANCELADO', async () => {
      mockUpdate.mockResolvedValue({ id: 'cp1', status: 'CANCELADO' });

      await cancelContaPagar('cp1');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'cp1' },
        data: { status: 'CANCELADO' },
      });
    });
  });
});
