import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    formaPagamento: {
      create: (...args: unknown[]) => mockCreate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

import {
  createFormaPagamento,
  createDefaultFormasPagamento,
  listFormasPagamento,
  updateFormaPagamento,
  toggleFormaPagamento,
} from '@/modules/cadastros/forma-pagamento.service';

describe('FormaPagamento Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createFormaPagamento', () => {
    it('should create a forma de pagamento', async () => {
      mockCreate.mockResolvedValue({ id: 'fp1', name: 'PIX', type: 'PIX' });

      const result = await createFormaPagamento({
        name: 'PIX',
        type: 'PIX',
        installments: 1,
        fee: 0,
      });

      expect(result.name).toBe('PIX');
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'PIX',
          type: 'PIX',
          installments: 1,
          fee: 0,
        }),
      });
    });
  });

  describe('createDefaultFormasPagamento', () => {
    it('should create PIX with correct defaults', async () => {
      mockCreate.mockResolvedValue({ id: 'fp1' });

      await createDefaultFormasPagamento(['PIX']);

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'PIX',
          type: 'PIX',
          installments: 1,
          fee: 0,
          isDefault: true,
        }),
      });
    });

    it('should create CARTAO_CREDITO with 12 installments and 3.50% fee', async () => {
      mockCreate.mockResolvedValue({ id: 'fp1' });

      await createDefaultFormasPagamento(['CARTAO_CREDITO']);

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Cartao de Credito',
          type: 'CREDITO',
          installments: 12,
          fee: 350,
          isDefault: false,
        }),
      });
    });

    it('should create multiple formas in order', async () => {
      mockCreate.mockResolvedValue({ id: 'fp1' });

      await createDefaultFormasPagamento(['PIX', 'DINHEIRO', 'BOLETO']);

      expect(mockCreate).toHaveBeenCalledTimes(3);
    });

    it('should skip unknown payment methods', async () => {
      mockCreate.mockResolvedValue({ id: 'fp1' });

      await createDefaultFormasPagamento(['PIX', 'UNKNOWN_METHOD']);

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should create CARTAO_DEBITO with 1.50% fee', async () => {
      mockCreate.mockResolvedValue({ id: 'fp1' });

      await createDefaultFormasPagamento(['CARTAO_DEBITO']);

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Cartao de Debito',
          type: 'DEBITO',
          installments: 1,
          fee: 150,
        }),
      });
    });
  });

  describe('listFormasPagamento', () => {
    it('should list all formas', async () => {
      mockFindMany.mockResolvedValue([{ id: 'fp1' }, { id: 'fp2' }]);

      const result = await listFormasPagamento();

      expect(result).toHaveLength(2);
      expect(mockFindMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('updateFormaPagamento', () => {
    it('should update fields', async () => {
      mockUpdate.mockResolvedValue({ id: 'fp1', fee: 500 });

      const result = await updateFormaPagamento('fp1', { fee: 500 });

      expect(result.fee).toBe(500);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'fp1' },
        data: { fee: 500 },
      });
    });
  });

  describe('toggleFormaPagamento', () => {
    it('should toggle active from true to false', async () => {
      mockFindUnique.mockResolvedValue({ id: 'fp1', active: true });
      mockUpdate.mockResolvedValue({ id: 'fp1', active: false });

      await toggleFormaPagamento('fp1');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'fp1' },
        data: { active: false },
      });
    });

    it('should toggle active from false to true', async () => {
      mockFindUnique.mockResolvedValue({ id: 'fp1', active: false });
      mockUpdate.mockResolvedValue({ id: 'fp1', active: true });

      await toggleFormaPagamento('fp1');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'fp1' },
        data: { active: true },
      });
    });

    it('should throw if forma not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(toggleFormaPagamento('fp1')).rejects.toThrow(
        'Forma de pagamento nao encontrada',
      );
    });
  });
});
