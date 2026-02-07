import { describe, it, expect } from 'vitest';
import {
  emitirNFeSchema,
  listNotasFiscaisQuerySchema,
  cancelarNotaSchema,
} from '@/modules/fiscal/nota-fiscal.schema';

describe('Nota Fiscal Schema', () => {
  describe('emitirNFeSchema', () => {
    it('should accept valid saleId', () => {
      const result = emitirNFeSchema.safeParse({ saleId: 'sale-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty saleId', () => {
      const result = emitirNFeSchema.safeParse({ saleId: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing saleId', () => {
      const result = emitirNFeSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('listNotasFiscaisQuerySchema', () => {
    it('should apply defaults', () => {
      const result = listNotasFiscaisQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    it('should accept valid type filter', () => {
      const result = listNotasFiscaisQuerySchema.safeParse({ type: 'NFE' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const result = listNotasFiscaisQuerySchema.safeParse({ type: 'INVALID' });
      expect(result.success).toBe(false);
    });

    it('should accept valid status filter', () => {
      const result = listNotasFiscaisQuerySchema.safeParse({ status: 'AUTORIZADA' });
      expect(result.success).toBe(true);
    });

    it('should coerce page from string', () => {
      const result = listNotasFiscaisQuerySchema.safeParse({ page: '3', pageSize: '10' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.pageSize).toBe(10);
      }
    });
  });

  describe('cancelarNotaSchema', () => {
    it('should accept valid motivo', () => {
      const result = cancelarNotaSchema.safeParse({
        motivo: 'Cancelamento por erro no valor da nota fiscal',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short motivo', () => {
      const result = cancelarNotaSchema.safeParse({ motivo: 'curto' });
      expect(result.success).toBe(false);
    });

    it('should reject missing motivo', () => {
      const result = cancelarNotaSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
