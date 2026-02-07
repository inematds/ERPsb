import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockCount = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    cliente: {
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
  createCliente,
  listClientes,
  getCliente,
  updateCliente,
  deleteCliente,
} from '@/modules/cadastros/cliente.service';

describe('Cliente Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCliente', () => {
    it('should create a cliente with required fields', async () => {
      const input = { name: 'Joao Silva', phone: '11999998888' };
      const expected = { id: 'c1', ...input, tenantId: 't1' };
      mockCreate.mockResolvedValue(expected);

      const result = await createCliente(input);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          tenantId: '',
          name: 'Joao Silva',
          phone: '11999998888',
          email: null,
          document: null,
          address: undefined,
          notes: null,
        },
      });
      expect(result).toEqual(expected);
    });

    it('should create a cliente with all fields', async () => {
      const input = {
        name: 'Maria',
        phone: '11988887777',
        email: 'maria@test.com',
        document: '12345678901',
        address: { street: 'Rua A', city: 'SP' },
        notes: 'VIP',
      };
      mockCreate.mockResolvedValue({ id: 'c2', ...input });

      await createCliente(input);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          tenantId: '',
          name: 'Maria',
          phone: '11988887777',
          email: 'maria@test.com',
          document: '12345678901',
          address: { street: 'Rua A', city: 'SP' },
          notes: 'VIP',
        },
      });
    });
  });

  describe('listClientes', () => {
    it('should list clientes with pagination', async () => {
      const clientes = [{ id: 'c1', name: 'A' }];
      mockFindMany.mockResolvedValue(clientes);
      mockCount.mockResolvedValue(1);

      const result = await listClientes({ page: 1, pageSize: 20 });

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
        skip: 0,
        take: 20,
      });
      expect(result).toEqual({ data: clientes, total: 1, page: 1, pageSize: 20 });
    });

    it('should search by name/phone/document', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listClientes({ search: 'joao', page: 1, pageSize: 20 });

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'joao', mode: 'insensitive' } },
            { phone: { contains: 'joao' } },
            { document: { contains: 'joao' } },
          ],
        },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 20,
      });
    });

    it('should paginate correctly on page 2', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(25);

      const result = await listClientes({ page: 2, pageSize: 10 });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(result.total).toBe(25);
    });
  });

  describe('getCliente', () => {
    it('should get a cliente by id', async () => {
      const cliente = { id: 'c1', name: 'Test' };
      mockFindUnique.mockResolvedValue(cliente);

      const result = await getCliente('c1');

      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'c1' } });
      expect(result).toEqual(cliente);
    });
  });

  describe('updateCliente', () => {
    it('should update cliente fields', async () => {
      const updated = { id: 'c1', name: 'Updated' };
      mockUpdate.mockResolvedValue(updated);

      const result = await updateCliente('c1', { name: 'Updated' });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { name: 'Updated' },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteCliente', () => {
    it('should delete a cliente', async () => {
      mockDelete.mockResolvedValue({ id: 'c1' });

      const result = await deleteCliente('c1');

      expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'c1' } });
      expect(result).toEqual({ id: 'c1' });
    });
  });
});
