import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockTransaction, mockUpdateMany, mockUpdate, mockCreate, mockFindMany, mockFindUnique } =
  vi.hoisted(() => ({
    mockTransaction: vi.fn(),
    mockUpdateMany: vi.fn(),
    mockUpdate: vi.fn(),
    mockCreate: vi.fn(),
    mockFindMany: vi.fn(),
    mockFindUnique: vi.fn(),
  }));

vi.mock('@/lib/prisma', () => ({
  basePrisma: {
    $transaction: (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: unknown) => unknown)({
          userTenant: {
            updateMany: mockUpdateMany,
            create: mockCreate,
          },
          tenant: {
            create: mockCreate,
          },
        });
      }
      return mockTransaction(fn);
    },
    userTenant: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      updateMany: mockUpdateMany,
      update: mockUpdate,
    },
  },
}));

import { createTenant, listUserTenants, switchActiveTenant } from '@/core/tenant/tenant.service';

describe('Tenant Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTenant', () => {
    it('should create a tenant and UserTenant with OWNER role', async () => {
      const newTenant = {
        id: 'tenant_1',
        name: 'Minha Empresa',
        type: 'INFORMAL',
        plan: 'FREE',
      };

      mockUpdateMany.mockResolvedValue({ count: 0 });
      mockCreate.mockResolvedValueOnce(newTenant).mockResolvedValueOnce({});

      const result = await createTenant('user_1', { name: 'Minha Empresa' });

      expect(result).toEqual(newTenant);
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { userId: 'user_1' },
        data: { isActive: false },
      });
    });
  });

  describe('listUserTenants', () => {
    it('should return formatted tenant list for user', async () => {
      mockFindMany.mockResolvedValue([
        {
          tenant: {
            id: 'tenant_1',
            name: 'Empresa A',
            type: 'MEI',
            plan: 'FREE',
            onboardingCompleted: true,
          },
          role: 'OWNER',
          isActive: true,
        },
      ]);

      const result = await listUserTenants('user_1');

      expect(result).toEqual([
        {
          tenantId: 'tenant_1',
          name: 'Empresa A',
          type: 'MEI',
          plan: 'FREE',
          role: 'OWNER',
          isActive: true,
          onboardingCompleted: true,
        },
      ]);
    });
  });

  describe('switchActiveTenant', () => {
    it('should throw error when user does not belong to tenant', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(switchActiveTenant('user_1', 'tenant_x')).rejects.toThrow(
        'User does not belong to this tenant',
      );
    });

    it('should switch active tenant when user belongs to it', async () => {
      mockFindUnique.mockResolvedValue({ id: 'ut_1', userId: 'user_1', tenantId: 'tenant_2' });
      mockUpdateMany.mockResolvedValue({ count: 1 });
      mockUpdate.mockResolvedValue({});
      mockTransaction.mockResolvedValue([{ count: 1 }, {}]);

      const result = await switchActiveTenant('user_1', 'tenant_2');
      expect(result).toEqual({ tenantId: 'tenant_2' });
    });
  });
});
