import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockCount = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    produto: {
      create: (...args: unknown[]) => mockCreate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}));

import { createProduto, listProdutos, getProduto, updateProduto, deleteProduto } from '@/modules/cadastros/produto.service';

describe('Produto Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduto', () => {
    it('should set trackStock=true for PRODUTO', async () => {
      mockCreate.mockResolvedValue({ id: 'p1' });

      await createProduto({ name: 'Camiseta', type: 'PRODUTO', sellPrice: 5990, unit: 'un' });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          trackStock: true,
          unit: 'un',
          type: 'PRODUTO',
        }),
      });
    });

    it('should set trackStock=false for SERVICO', async () => {
      mockCreate.mockResolvedValue({ id: 'p2' });

      await createProduto({ name: 'Consultoria', type: 'SERVICO', sellPrice: 15000, unit: 'srv' });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          trackStock: false,
          unit: 'srv',
          type: 'SERVICO',
        }),
      });
    });
  });

  describe('listProdutos', () => {
    it('should filter by type', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listProdutos({ page: 1, pageSize: 20, type: 'PRODUTO' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'PRODUTO' }),
        }),
      );
    });

    it('should search by name/barcode', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listProdutos({ search: 'cam', page: 1, pageSize: 20 });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'cam', mode: 'insensitive' } },
              { barcode: { contains: 'cam' } },
            ],
          }),
        }),
      );
    });
  });

  describe('getProduto', () => {
    it('should get by id', async () => {
      mockFindUnique.mockResolvedValue({ id: 'p1' });
      const result = await getProduto('p1');
      expect(result).toEqual({ id: 'p1' });
    });
  });

  describe('updateProduto', () => {
    it('should update fields', async () => {
      mockUpdate.mockResolvedValue({ id: 'p1', name: 'Updated' });
      const result = await updateProduto('p1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteProduto', () => {
    it('should soft-delete by setting active=false', async () => {
      mockUpdate.mockResolvedValue({ id: 'p1', active: false });
      await deleteProduto('p1');
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { active: false },
      });
    });
  });
});
