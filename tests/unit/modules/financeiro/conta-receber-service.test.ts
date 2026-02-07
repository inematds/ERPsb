import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockCount = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contaReceber: {
      create: (...args: unknown[]) => mockCreate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}));

import {
  createContaReceber,
  listContasReceber,
  markAsReceived,
  cancelContaReceber,
} from '@/modules/financeiro/conta-receber.service';

describe('ContaReceber Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createContaReceber', () => {
    it('should create with status PENDENTE', async () => {
      mockCreate.mockResolvedValue({ id: 'cr1', status: 'PENDENTE' });

      await createContaReceber({
        description: 'Venda produto',
        amount: 50000,
        dueDate: '2026-03-15',
        category: 'VENDAS',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'PENDENTE',
          description: 'Venda produto',
          amount: 50000,
          category: 'VENDAS',
        }),
      });
    });
  });

  describe('listContasReceber', () => {
    it('should filter by status', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listContasReceber({ page: 1, pageSize: 20, status: 'PENDENTE' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDENTE' }),
        }),
      );
    });

    it('should filter by clientId', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listContasReceber({ page: 1, pageSize: 20, clientId: 'c1' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ clientId: 'c1' }),
        }),
      );
    });
  });

  describe('markAsReceived', () => {
    it('should set status RECEBIDO and receivedDate', async () => {
      mockUpdate.mockResolvedValue({ id: 'cr1', status: 'RECEBIDO' });

      await markAsReceived('cr1');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'cr1' },
        data: {
          status: 'RECEBIDO',
          receivedDate: expect.any(Date),
        },
      });
    });
  });

  describe('cancelContaReceber', () => {
    it('should set status CANCELADO', async () => {
      mockUpdate.mockResolvedValue({ id: 'cr1', status: 'CANCELADO' });

      await cancelContaReceber('cr1');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'cr1' },
        data: { status: 'CANCELADO' },
      });
    });
  });
});
