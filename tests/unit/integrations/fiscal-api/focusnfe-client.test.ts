import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    FOCUS_NFE_TOKEN: undefined,
  },
}));

import { createNFe, getNFeStatus, cancelNFe, createNFSe, getNFSeStatus, cancelNFSe, mapFocusStatus } from '@/integrations/fiscal-api/focusnfe.client';

describe('Focus NFe Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNFe (mock mode)', () => {
    it('should return mock response when no token', async () => {
      const result = await createNFe('ref-123', { test: true });
      expect(result.status).toBe('autorizado');
      expect(result.chave_nfe).toBeTruthy();
      expect(result.caminho_xml_nota_fiscal).toContain('ref-123');
      expect(result.caminho_danfe).toContain('ref-123');
    });
  });

  describe('getNFeStatus (mock mode)', () => {
    it('should return mock autorizado status when no token', async () => {
      const result = await getNFeStatus('ref-456');
      expect(result.status).toBe('autorizado');
      expect(result.chave_nfe).toBeTruthy();
    });
  });

  describe('cancelNFe (mock mode)', () => {
    it('should return mock cancelado response when no token', async () => {
      const result = await cancelNFe('ref-789', 'motivo do cancelamento');
      expect(result.status).toBe('cancelado');
    });
  });

  describe('createNFSe (mock mode)', () => {
    it('should return mock response when no token', async () => {
      const result = await createNFSe('nfse-ref-123', { test: true });
      expect(result.status).toBe('autorizado');
      expect(result.caminho_xml_nota_fiscal).toContain('nfse-ref-123');
    });
  });

  describe('getNFSeStatus (mock mode)', () => {
    it('should return mock autorizado status when no token', async () => {
      const result = await getNFSeStatus('nfse-ref-456');
      expect(result.status).toBe('autorizado');
    });
  });

  describe('cancelNFSe (mock mode)', () => {
    it('should return mock cancelado response when no token', async () => {
      const result = await cancelNFSe('nfse-ref-789', 'motivo do cancelamento nfse');
      expect(result.status).toBe('cancelado');
    });
  });

  describe('mapFocusStatus', () => {
    it('should map autorizado to AUTORIZADA', () => {
      expect(mapFocusStatus('autorizado')).toBe('AUTORIZADA');
    });

    it('should map cancelado to CANCELADA', () => {
      expect(mapFocusStatus('cancelado')).toBe('CANCELADA');
    });

    it('should map erro_autorizacao to REJEITADA', () => {
      expect(mapFocusStatus('erro_autorizacao')).toBe('REJEITADA');
    });

    it('should map rejeitado to REJEITADA', () => {
      expect(mapFocusStatus('rejeitado')).toBe('REJEITADA');
    });

    it('should map processando_autorizacao to PROCESSANDO', () => {
      expect(mapFocusStatus('processando_autorizacao')).toBe('PROCESSANDO');
    });

    it('should map unknown status to PROCESSANDO', () => {
      expect(mapFocusStatus('unknown')).toBe('PROCESSANDO');
    });
  });
});
