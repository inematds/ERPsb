import { describe, it, expect } from 'vitest';
import { listNotificationsQuerySchema } from '@/modules/notificacoes/notification.schema';

describe('Notification Schema', () => {
  describe('listNotificationsQuerySchema', () => {
    it('should apply default page and pageSize', () => {
      const result = listNotificationsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    it('should coerce page and pageSize from strings', () => {
      const result = listNotificationsQuerySchema.safeParse({
        page: '2',
        pageSize: '10',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(10);
      }
    });

    it('should accept read filter', () => {
      const result = listNotificationsQuerySchema.safeParse({ read: 'false' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.read).toBe(false);
      }
    });

    it('should accept no read filter', () => {
      const result = listNotificationsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.read).toBeUndefined();
      }
    });
  });
});
