import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockNotificationCreate = vi.fn();
const mockNotificationFindMany = vi.fn();
const mockNotificationCount = vi.fn();
const mockNotificationUpdate = vi.fn();
const mockNotificationUpdateMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      create: (...args: unknown[]) => mockNotificationCreate(...args),
      findMany: (...args: unknown[]) => mockNotificationFindMany(...args),
      count: (...args: unknown[]) => mockNotificationCount(...args),
      update: (...args: unknown[]) => mockNotificationUpdate(...args),
      updateMany: (...args: unknown[]) => mockNotificationUpdateMany(...args),
    },
  },
}));

import {
  createNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '@/modules/notificacoes/notification.service';

describe('Notification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create notification in database', async () => {
      mockNotificationCreate.mockResolvedValueOnce({ id: 'n1', type: 'PIX_PAID' });

      const result = await createNotification({
        tenantId: 't1',
        type: 'PIX_PAID',
        title: 'Pagamento recebido',
        message: 'R$ 50,00 de Joao',
      });

      expect(result.id).toBe('n1');
      expect(mockNotificationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 't1',
            type: 'PIX_PAID',
            title: 'Pagamento recebido',
          }),
        }),
      );
    });
  });

  describe('listNotifications', () => {
    it('should filter by read status', async () => {
      mockNotificationFindMany.mockResolvedValueOnce([{ id: 'n1' }]);
      mockNotificationCount.mockResolvedValueOnce(1);

      const result = await listNotifications({ page: 1, pageSize: 20, read: false });

      expect(result.data).toHaveLength(1);
      expect(mockNotificationFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ read: false }),
        }),
      );
    });

    it('should return paginated results without filter', async () => {
      mockNotificationFindMany.mockResolvedValueOnce([{ id: 'n1' }, { id: 'n2' }]);
      mockNotificationCount.mockResolvedValueOnce(2);

      const result = await listNotifications({ page: 1, pageSize: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('markAsRead', () => {
    it('should update read to true', async () => {
      mockNotificationUpdate.mockResolvedValueOnce({ id: 'n1', read: true });

      const result = await markAsRead('n1');

      expect(result.read).toBe(true);
      expect(mockNotificationUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'n1' },
          data: { read: true },
        }),
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread to read', async () => {
      mockNotificationUpdateMany.mockResolvedValueOnce({ count: 5 });

      const result = await markAllAsRead();

      expect(result.count).toBe(5);
      expect(mockNotificationUpdateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { read: false },
          data: { read: true },
        }),
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      mockNotificationCount.mockResolvedValueOnce(3);

      const result = await getUnreadCount();

      expect(result).toBe(3);
      expect(mockNotificationCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { read: false },
        }),
      );
    });
  });
});
