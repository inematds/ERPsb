import { describe, it, expect } from 'vitest';
import { createPixChargeSchema, listPixChargesQuerySchema } from '@/integrations/pix/pix.schema';

describe('PIX Schema', () => {
  describe('createPixChargeSchema', () => {
    it('should require contaReceberId', () => {
      const result = createPixChargeSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should accept valid input with defaults', () => {
      const result = createPixChargeSchema.safeParse({
        contaReceberId: 'cr-123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expirationMinutes).toBe(1440);
      }
    });

    it('should default expirationMinutes to 1440 (24h)', () => {
      const result = createPixChargeSchema.safeParse({
        contaReceberId: 'cr-123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expirationMinutes).toBe(1440);
      }
    });

    it('should reject expirationMinutes < 15', () => {
      const result = createPixChargeSchema.safeParse({
        contaReceberId: 'cr-123',
        expirationMinutes: 5,
      });
      expect(result.success).toBe(false);
    });

    it('should reject expirationMinutes > 43200', () => {
      const result = createPixChargeSchema.safeParse({
        contaReceberId: 'cr-123',
        expirationMinutes: 50000,
      });
      expect(result.success).toBe(false);
    });

    it('should accept custom expirationMinutes within range', () => {
      const result = createPixChargeSchema.safeParse({
        contaReceberId: 'cr-123',
        expirationMinutes: 60,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expirationMinutes).toBe(60);
      }
    });
  });

  describe('listPixChargesQuerySchema', () => {
    it('should apply defaults', () => {
      const result = listPixChargesQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    it('should accept status filter', () => {
      const result = listPixChargesQuerySchema.safeParse({ status: 'PAID' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = listPixChargesQuerySchema.safeParse({ status: 'INVALID' });
      expect(result.success).toBe(false);
    });
  });
});
