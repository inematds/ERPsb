import { describe, it, expect } from 'vitest';
import { updateLembreteConfigSchema } from '@/modules/whatsapp/lembrete.schema';

describe('Lembrete Schema', () => {
  describe('updateLembreteConfigSchema', () => {
    it('should accept valid config', () => {
      const result = updateLembreteConfigSchema.safeParse({
        ativo: true,
        diasAntes: 3,
        noDia: true,
        diasDepois: 1,
      });
      expect(result.success).toBe(true);
    });

    it('should apply defaults for diasAntes and diasDepois', () => {
      const result = updateLembreteConfigSchema.safeParse({ ativo: false, noDia: false });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.diasAntes).toBe(3);
        expect(result.data.diasDepois).toBe(1);
      }
    });

    it('should reject diasAntes > 30', () => {
      const result = updateLembreteConfigSchema.safeParse({
        ativo: true, diasAntes: 31, noDia: true, diasDepois: 1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative diasAntes', () => {
      const result = updateLembreteConfigSchema.safeParse({
        ativo: true, diasAntes: -1, noDia: true, diasDepois: 1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing ativo', () => {
      const result = updateLembreteConfigSchema.safeParse({ diasAntes: 3 });
      expect(result.success).toBe(false);
    });
  });
});
