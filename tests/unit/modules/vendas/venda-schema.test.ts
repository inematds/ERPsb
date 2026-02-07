import { describe, it, expect } from 'vitest';
import { createVendaSchema } from '@/modules/vendas/venda.schema';

describe('Venda Schema', () => {
  describe('createVendaSchema', () => {
    const validItem = {
      productId: 'prod-1',
      name: 'Produto Teste',
      quantity: 2,
      unitPrice: 5000,
      total: 10000,
    };

    it('should accept valid data with items', () => {
      const result = createVendaSchema.safeParse({
        items: [validItem],
        paymentMethodId: 'pm-1',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty items array', () => {
      const result = createVendaSchema.safeParse({
        items: [],
        paymentMethodId: 'pm-1',
      });
      expect(result.success).toBe(false);
    });

    it('should reject item with quantity <= 0', () => {
      const result = createVendaSchema.safeParse({
        items: [{ ...validItem, quantity: 0 }],
        paymentMethodId: 'pm-1',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative discount', () => {
      const result = createVendaSchema.safeParse({
        items: [validItem],
        paymentMethodId: 'pm-1',
        discount: -100,
      });
      expect(result.success).toBe(false);
    });

    it('should accept discount of 0', () => {
      const result = createVendaSchema.safeParse({
        items: [validItem],
        paymentMethodId: 'pm-1',
        discount: 0,
      });
      expect(result.success).toBe(true);
    });

    it('should require paymentMethodId', () => {
      const result = createVendaSchema.safeParse({
        items: [validItem],
      });
      expect(result.success).toBe(false);
    });

    it('should allow optional clientId', () => {
      const result = createVendaSchema.safeParse({
        items: [validItem],
        paymentMethodId: 'pm-1',
        clientId: 'client-1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.clientId).toBe('client-1');
      }
    });

    it('should default discount to 0', () => {
      const result = createVendaSchema.safeParse({
        items: [validItem],
        paymentMethodId: 'pm-1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.discount).toBe(0);
      }
    });
  });
});
