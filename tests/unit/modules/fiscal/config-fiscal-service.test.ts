import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockConfigFiscalFindUnique = vi.fn();
const mockConfigFiscalUpsert = vi.fn();
const mockConfigFiscalUpdate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    configFiscal: {
      findUnique: (...args: unknown[]) => mockConfigFiscalFindUnique(...args),
      upsert: (...args: unknown[]) => mockConfigFiscalUpsert(...args),
      update: (...args: unknown[]) => mockConfigFiscalUpdate(...args),
    },
  },
}));

vi.mock('@/lib/crypto', () => ({
  encryptString: (val: string) => `encrypted:${val}`,
  decryptString: (val: string) => val.replace('encrypted:', ''),
  parseCertificate: vi.fn().mockResolvedValue({
    valid: true,
    expiry: new Date('2027-01-01'),
    subject: 'EMPRESA TESTE LTDA',
  }),
}));

import {
  getConfigFiscal,
  upsertConfigFiscal,
  uploadCertificate,
  removeCertificate,
  checkCertificateExpiry,
  incrementNumero,
} from '@/modules/fiscal/config-fiscal.service';
import { parseCertificate } from '@/lib/crypto';

describe('Config Fiscal Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConfigFiscal', () => {
    it('should return null when config does not exist', async () => {
      mockConfigFiscalFindUnique.mockResolvedValueOnce(null);
      const result = await getConfigFiscal('t1');
      expect(result).toBeNull();
    });

    it('should return config without sensitive data', async () => {
      mockConfigFiscalFindUnique.mockResolvedValueOnce({
        id: 'cf1',
        tenantId: 't1',
        regimeTributario: 'MEI',
        certificateData: 'encrypted-data',
        certificatePassword: 'encrypted-pass',
        ambiente: 'homologacao',
      });

      const result = await getConfigFiscal('t1');
      expect(result).toBeTruthy();
      expect(result?.regimeTributario).toBe('MEI');
      expect(result?.hasCertificate).toBe(true);
      expect(result?.certificateData).toBeUndefined();
      expect(result?.certificatePassword).toBeUndefined();
    });
  });

  describe('upsertConfigFiscal', () => {
    it('should create new config', async () => {
      mockConfigFiscalUpsert.mockResolvedValueOnce({
        id: 'cf1',
        tenantId: 't1',
        regimeTributario: 'SIMPLES_NACIONAL',
      });

      const result = await upsertConfigFiscal('t1', { regimeTributario: 'SIMPLES_NACIONAL' });
      expect(result.regimeTributario).toBe('SIMPLES_NACIONAL');
      expect(mockConfigFiscalUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 't1' },
          create: expect.objectContaining({ tenantId: 't1', regimeTributario: 'SIMPLES_NACIONAL' }),
          update: expect.objectContaining({ regimeTributario: 'SIMPLES_NACIONAL' }),
        }),
      );
    });
  });

  describe('uploadCertificate', () => {
    it('should encrypt and save certificate', async () => {
      mockConfigFiscalUpsert.mockResolvedValueOnce({ id: 'cf1' });

      const result = await uploadCertificate('t1', 'base64data', 'senha123');

      expect(result.expiry).toEqual(new Date('2027-01-01'));
      expect(result.subject).toBe('EMPRESA TESTE LTDA');
      expect(mockConfigFiscalUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 't1' },
          update: expect.objectContaining({
            certificateData: 'encrypted:base64data',
            certificatePassword: 'encrypted:senha123',
          }),
        }),
      );
    });

    it('should throw when certificate is invalid', async () => {
      vi.mocked(parseCertificate).mockResolvedValueOnce({
        valid: false,
        expiry: null,
        subject: null,
        error: 'Certificado expirado',
      });

      await expect(uploadCertificate('t1', 'baddata', 'pass')).rejects.toThrow('Certificado expirado');
    });
  });

  describe('removeCertificate', () => {
    it('should clear certificate fields', async () => {
      mockConfigFiscalUpdate.mockResolvedValueOnce({ id: 'cf1' });
      await removeCertificate('t1');

      expect(mockConfigFiscalUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 't1' },
          data: { certificateData: null, certificatePassword: null, certificateExpiry: null },
        }),
      );
    });
  });

  describe('checkCertificateExpiry', () => {
    it('should return not having certificate when none exists', async () => {
      mockConfigFiscalFindUnique.mockResolvedValueOnce(null);
      const result = await checkCertificateExpiry('t1');

      expect(result.hasCertificate).toBe(false);
      expect(result.isExpiring).toBe(false);
      expect(result.isExpired).toBe(false);
    });

    it('should detect expiring certificate within 30 days', async () => {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 15);

      mockConfigFiscalFindUnique.mockResolvedValueOnce({
        certificateData: 'some-data',
        certificateExpiry: expiry,
      });

      const result = await checkCertificateExpiry('t1');
      expect(result.hasCertificate).toBe(true);
      expect(result.isExpiring).toBe(true);
      expect(result.isExpired).toBe(false);
      expect(result.daysUntilExpiry).toBeLessThanOrEqual(15);
    });

    it('should detect expired certificate', async () => {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() - 5);

      mockConfigFiscalFindUnique.mockResolvedValueOnce({
        certificateData: 'some-data',
        certificateExpiry: expiry,
      });

      const result = await checkCertificateExpiry('t1');
      expect(result.hasCertificate).toBe(true);
      expect(result.isExpired).toBe(true);
    });
  });

  describe('incrementNumero', () => {
    it('should increment and return next number', async () => {
      mockConfigFiscalUpsert.mockResolvedValueOnce({ ultimoNumeroNFe: 5 });

      const result = await incrementNumero('t1', 'NFe');
      expect(result).toBe(5);
      expect(mockConfigFiscalUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 't1' },
          update: { ultimoNumeroNFe: { increment: 1 } },
        }),
      );
    });
  });
});
