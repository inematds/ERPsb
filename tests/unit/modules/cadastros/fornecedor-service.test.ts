import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockCount = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    fornecedor: {
      create: (...args: unknown[]) => mockCreate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}));

import {
  createFornecedor,
  listFornecedores,
  getFornecedor,
  updateFornecedor,
  deleteFornecedor,
} from '@/modules/cadastros/fornecedor.service';

describe('Fornecedor Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createFornecedor', () => {
    it('should create a fornecedor with only name', async () => {
      const input = { name: 'Fornecedor ABC' };
      mockCreate.mockResolvedValue({ id: 'f1', ...input });

      const result = await createFornecedor(input);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          tenantId: '',
          name: 'Fornecedor ABC',
          phone: null,
          email: null,
          document: null,
          address: undefined,
          notes: null,
        },
      });
      expect(result.id).toBe('f1');
    });
  });

  describe('listFornecedores', () => {
    it('should list with pagination', async () => {
      mockFindMany.mockResolvedValue([{ id: 'f1' }]);
      mockCount.mockResolvedValue(1);

      const result = await listFornecedores({ page: 1, pageSize: 20 });

      expect(result).toEqual({ data: [{ id: 'f1' }], total: 1, page: 1, pageSize: 20 });
    });

    it('should search by name/phone/document', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listFornecedores({ search: 'abc', page: 1, pageSize: 20 });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'abc', mode: 'insensitive' } },
              { phone: { contains: 'abc' } },
              { document: { contains: 'abc' } },
            ],
          },
        }),
      );
    });
  });

  describe('getFornecedor', () => {
    it('should get by id', async () => {
      mockFindUnique.mockResolvedValue({ id: 'f1' });
      const result = await getFornecedor('f1');
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'f1' } });
      expect(result).toEqual({ id: 'f1' });
    });
  });

  describe('updateFornecedor', () => {
    it('should update fields', async () => {
      mockUpdate.mockResolvedValue({ id: 'f1', name: 'Updated' });
      const result = await updateFornecedor('f1', { name: 'Updated' });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'f1' },
        data: { name: 'Updated' },
      });
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteFornecedor', () => {
    it('should delete', async () => {
      mockDelete.mockResolvedValue({ id: 'f1' });
      await deleteFornecedor('f1');
      expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'f1' } });
    });
  });
});
