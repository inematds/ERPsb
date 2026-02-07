import { describe, it, expect } from 'vitest';
import { updateConfigFiscalSchema, uploadCertificateSchema } from '@/modules/fiscal/config-fiscal.schema';

describe('Config Fiscal Schema', () => {
  describe('updateConfigFiscalSchema', () => {
    it('should accept valid regime tributario', () => {
      const result = updateConfigFiscalSchema.safeParse({
        regimeTributario: 'MEI',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.regimeTributario).toBe('MEI');
      }
    });

    it('should reject invalid regime tributario', () => {
      const result = updateConfigFiscalSchema.safeParse({
        regimeTributario: 'INVALID',
      });
      expect(result.success).toBe(false);
    });

    it('should accept all valid regimes', () => {
      for (const regime of ['MEI', 'SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL']) {
        const result = updateConfigFiscalSchema.safeParse({ regimeTributario: regime });
        expect(result.success).toBe(true);
      }
    });

    it('should accept valid ambiente', () => {
      const result = updateConfigFiscalSchema.safeParse({ ambiente: 'producao' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ambiente).toBe('producao');
      }
    });

    it('should reject invalid ambiente', () => {
      const result = updateConfigFiscalSchema.safeParse({ ambiente: 'staging' });
      expect(result.success).toBe(false);
    });

    it('should accept nullable inscricoes', () => {
      const result = updateConfigFiscalSchema.safeParse({
        inscricaoEstadual: null,
        inscricaoMunicipal: null,
      });
      expect(result.success).toBe(true);
    });

    it('should validate serie range', () => {
      const valid = updateConfigFiscalSchema.safeParse({ serieNFe: 1 });
      expect(valid.success).toBe(true);

      const invalid = updateConfigFiscalSchema.safeParse({ serieNFe: 0 });
      expect(invalid.success).toBe(false);

      const tooHigh = updateConfigFiscalSchema.safeParse({ serieNFe: 1000 });
      expect(tooHigh.success).toBe(false);
    });

    it('should accept empty object', () => {
      const result = updateConfigFiscalSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('uploadCertificateSchema', () => {
    it('should accept valid certificate data', () => {
      const result = uploadCertificateSchema.safeParse({
        certificateData: 'base64encodeddata',
        certificatePassword: 'mypassword',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty certificate data', () => {
      const result = uploadCertificateSchema.safeParse({
        certificateData: '',
        certificatePassword: 'pass',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = uploadCertificateSchema.safeParse({
        certificateData: 'data',
        certificatePassword: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const result = uploadCertificateSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
