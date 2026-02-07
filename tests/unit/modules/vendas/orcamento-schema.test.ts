import { describe, it, expect } from 'vitest';
import { createOrcamentoSchema } from '@/modules/vendas/orcamento.schema';

describe('Orcamento Schema', () => {
  describe('createOrcamentoSchema', () => {
    const validItem = {
      productId: 'prod-1',
      name: 'Produto Teste',
      quantity: 2,
      unitPrice: 5000,
      total: 10000,
    };

    const validData = {
      clientId: 'client-1',
      items: [validItem],
      validUntil: '2026-03-15',
    };

    it('should accept valid data', () => {
      const result = createOrcamentoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty items array', () => {
      const result = createOrcamentoSchema.safeParse({
        ...validData,
        items: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative discount', () => {
      const result = createOrcamentoSchema.safeParse({
        ...validData,
        discount: -100,
      });
      expect(result.success).toBe(false);
    });

    it('should require clientId', () => {
      const result = createOrcamentoSchema.safeParse({
        items: [validItem],
        validUntil: '2026-03-15',
      });
      expect(result.success).toBe(false);
    });

    it('should require validUntil', () => {
      const result = createOrcamentoSchema.safeParse({
        clientId: 'client-1',
        items: [validItem],
      });
      expect(result.success).toBe(false);
    });

    it('should default discount to 0', () => {
      const result = createOrcamentoSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.discount).toBe(0);
      }
    });

    it('should allow optional notes', () => {
      const result = createOrcamentoSchema.safeParse({
        ...validData,
        notes: 'Condicoes especiais',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBe('Condicoes especiais');
      }
    });

    it('should reject item with quantity <= 0', () => {
      const result = createOrcamentoSchema.safeParse({
        ...validData,
        items: [{ ...validItem, quantity: 0 }],
      });
      expect(result.success).toBe(false);
    });
  });
});
