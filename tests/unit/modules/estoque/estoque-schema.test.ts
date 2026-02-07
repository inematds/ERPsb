import { describe, it, expect } from 'vitest';
import { registrarEntradaSchema, registrarAjusteSchema, listMovimentacoesQuerySchema } from '@/modules/estoque/estoque.schema';

describe('Estoque Schema', () => {
  describe('registrarEntradaSchema', () => {
    it('should accept valid input', () => {
      const result = registrarEntradaSchema.safeParse({ productId: 'p1', quantity: 10 });
      expect(result.success).toBe(true);
    });

    it('should accept input with notes', () => {
      const result = registrarEntradaSchema.safeParse({ productId: 'p1', quantity: 5, notes: 'Compra fornecedor X' });
      expect(result.success).toBe(true);
    });

    it('should reject missing productId', () => {
      const result = registrarEntradaSchema.safeParse({ quantity: 10 });
      expect(result.success).toBe(false);
    });

    it('should reject quantity 0', () => {
      const result = registrarEntradaSchema.safeParse({ productId: 'p1', quantity: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject negative quantity', () => {
      const result = registrarEntradaSchema.safeParse({ productId: 'p1', quantity: -5 });
      expect(result.success).toBe(false);
    });
  });

  describe('registrarAjusteSchema', () => {
    it('should accept positive adjustment with notes', () => {
      const result = registrarAjusteSchema.safeParse({ productId: 'p1', quantity: 5, notes: 'Contagem corrigida' });
      expect(result.success).toBe(true);
    });

    it('should accept negative adjustment', () => {
      const result = registrarAjusteSchema.safeParse({ productId: 'p1', quantity: -3, notes: 'Perda' });
      expect(result.success).toBe(true);
    });

    it('should reject missing notes', () => {
      const result = registrarAjusteSchema.safeParse({ productId: 'p1', quantity: 5 });
      expect(result.success).toBe(false);
    });

    it('should reject empty notes', () => {
      const result = registrarAjusteSchema.safeParse({ productId: 'p1', quantity: 5, notes: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('listMovimentacoesQuerySchema', () => {
    it('should apply defaults', () => {
      const result = listMovimentacoesQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    it('should accept valid type filter', () => {
      const result = listMovimentacoesQuerySchema.safeParse({ type: 'ENTRADA' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const result = listMovimentacoesQuerySchema.safeParse({ type: 'INVALID' });
      expect(result.success).toBe(false);
    });
  });
});
