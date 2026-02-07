import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    NEXTAUTH_SECRET: 'test-secret-for-nota-fiscal-service-tests',
    FOCUS_NFE_TOKEN: undefined,
  },
}));

const mockVendaFindUnique = vi.fn();
const mockNotaFiscalCreate = vi.fn();
const mockNotaFiscalFindFirst = vi.fn();
const mockNotaFiscalFindUnique = vi.fn();
const mockNotaFiscalFindMany = vi.fn();
const mockNotaFiscalCount = vi.fn();
const mockNotaFiscalUpdate = vi.fn();
const mockConfigFiscalFindUnique = vi.fn();
const mockConfigFiscalUpsert = vi.fn();
const mockTenantFindUnique = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    venda: { findUnique: (...args: unknown[]) => mockVendaFindUnique(...args) },
    notaFiscal: {
      create: (...args: unknown[]) => mockNotaFiscalCreate(...args),
      findFirst: (...args: unknown[]) => mockNotaFiscalFindFirst(...args),
      findUnique: (...args: unknown[]) => mockNotaFiscalFindUnique(...args),
      findMany: (...args: unknown[]) => mockNotaFiscalFindMany(...args),
      count: (...args: unknown[]) => mockNotaFiscalCount(...args),
      update: (...args: unknown[]) => mockNotaFiscalUpdate(...args),
    },
    configFiscal: {
      findUnique: (...args: unknown[]) => mockConfigFiscalFindUnique(...args),
      upsert: (...args: unknown[]) => mockConfigFiscalUpsert(...args),
    },
    tenant: { findUnique: (...args: unknown[]) => mockTenantFindUnique(...args) },
  },
}));

vi.mock('@/integrations/fiscal-api/focusnfe.client', () => ({
  createNFe: vi.fn().mockResolvedValue({
    status: 'autorizado',
    chave_nfe: 'chave123',
    caminho_xml_nota_fiscal: '/xml/test.xml',
    caminho_danfe: '/danfe/test.pdf',
  }),
  getNFeStatus: vi.fn().mockResolvedValue({
    status: 'autorizado',
    chave_nfe: 'chave123',
    caminho_xml_nota_fiscal: '/xml/test.xml',
    caminho_danfe: '/danfe/test.pdf',
  }),
  cancelNFe: vi.fn().mockResolvedValue({ status: 'cancelado' }),
  createNFSe: vi.fn().mockResolvedValue({
    status: 'autorizado',
    caminho_xml_nota_fiscal: '/xml/nfse-test.xml',
    caminho_danfe: '/danfe/nfse-test.pdf',
  }),
  getNFSeStatus: vi.fn().mockResolvedValue({
    status: 'autorizado',
    caminho_xml_nota_fiscal: '/xml/nfse-test.xml',
    caminho_danfe: '/danfe/nfse-test.pdf',
  }),
  cancelNFSe: vi.fn().mockResolvedValue({ status: 'cancelado' }),
  mapFocusStatus: vi.fn((s: string) => {
    if (s === 'autorizado') return 'AUTORIZADA';
    if (s === 'cancelado') return 'CANCELADA';
    return 'PROCESSANDO';
  }),
}));

import { emitirNFe, emitirNFSe, listNotasFiscais, checkNotaStatus, cancelarNota } from '@/modules/fiscal/nota-fiscal.service';

describe('Nota Fiscal Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('emitirNFe', () => {
    it('should throw if venda not found', async () => {
      mockVendaFindUnique.mockResolvedValueOnce(null);
      await expect(emitirNFe('t1', 'sale-999')).rejects.toThrow('Venda nao encontrada');
    });

    it('should throw if venda not CONFIRMADA', async () => {
      mockVendaFindUnique.mockResolvedValueOnce({
        id: 's1', tenantId: 't1', status: 'RASCUNHO', items: [],
      });
      await expect(emitirNFe('t1', 's1')).rejects.toThrow('Venda precisa estar confirmada');
    });

    it('should throw if config fiscal not found', async () => {
      mockVendaFindUnique.mockResolvedValueOnce({
        id: 's1', tenantId: 't1', status: 'CONFIRMADA', items: [],
        client: null, paymentMethod: { name: 'PIX' },
      });
      mockNotaFiscalFindFirst.mockResolvedValueOnce(null);
      mockConfigFiscalFindUnique.mockResolvedValueOnce(null);

      await expect(emitirNFe('t1', 's1')).rejects.toThrow('Configuracao fiscal nao encontrada');
    });

    it('should create and emit NFe successfully', async () => {
      mockVendaFindUnique.mockResolvedValueOnce({
        id: 's1', tenantId: 't1', status: 'CONFIRMADA',
        items: [{ productId: 'p1', name: 'Produto', quantity: 1, unitPrice: 5000, total: 5000 }],
        subtotal: 5000, discount: 0, total: 5000,
        client: { name: 'Joao', document: '12345678900' },
        paymentMethod: { name: 'PIX', type: 'PIX' },
      });
      mockNotaFiscalFindFirst.mockResolvedValueOnce(null);
      mockConfigFiscalFindUnique.mockResolvedValueOnce({
        regimeTributario: 'SIMPLES_NACIONAL', serieNFe: 1, inscricaoEstadual: '123', ambiente: 'homologacao',
      });
      mockTenantFindUnique.mockResolvedValueOnce({
        id: 't1', name: 'Empresa Test', document: '00000000000100', phone: null, email: null, address: null,
      });
      mockConfigFiscalUpsert.mockResolvedValueOnce({ ultimoNumeroNFe: 1 });
      mockNotaFiscalCreate.mockResolvedValueOnce({ id: 'nf1', status: 'PROCESSANDO' });
      mockNotaFiscalUpdate.mockResolvedValueOnce({
        id: 'nf1', status: 'AUTORIZADA', chaveAcesso: 'chave123',
      });

      const result = await emitirNFe('t1', 's1');
      expect(result.status).toBe('AUTORIZADA');
      expect(mockNotaFiscalCreate).toHaveBeenCalled();
      expect(mockNotaFiscalUpdate).toHaveBeenCalled();
    });

    it('should throw if NFe already exists for sale', async () => {
      mockVendaFindUnique.mockResolvedValueOnce({
        id: 's1', tenantId: 't1', status: 'CONFIRMADA', items: [],
        client: null, paymentMethod: { name: 'PIX' },
      });
      mockNotaFiscalFindFirst.mockResolvedValueOnce({ id: 'nf-existing' });

      await expect(emitirNFe('t1', 's1')).rejects.toThrow('Ja existe uma NFe para esta venda');
    });
  });

  describe('emitirNFSe', () => {
    it('should create and emit NFSe successfully', async () => {
      mockVendaFindUnique.mockResolvedValueOnce({
        id: 's1', tenantId: 't1', status: 'CONFIRMADA',
        items: [{ productId: 'p1', name: 'Servico Consultoria', quantity: 1, unitPrice: 10000, total: 10000 }],
        subtotal: 10000, discount: 0, total: 10000,
        client: { name: 'Maria', document: '98765432100', email: 'maria@test.com' },
        paymentMethod: { name: 'PIX', type: 'PIX' },
      });
      mockNotaFiscalFindFirst.mockResolvedValueOnce(null);
      mockConfigFiscalFindUnique.mockResolvedValueOnce({
        regimeTributario: 'SIMPLES_NACIONAL', serieNFSe: 1, inscricaoMunicipal: '456', ambiente: 'homologacao',
      });
      mockTenantFindUnique.mockResolvedValueOnce({
        id: 't1', name: 'Empresa Test', document: '00000000000100', phone: null, email: null,
      });
      mockConfigFiscalUpsert.mockResolvedValueOnce({ ultimoNumeroNFSe: 1 });
      mockNotaFiscalCreate.mockResolvedValueOnce({ id: 'nf1', status: 'PROCESSANDO', type: 'NFSE' });
      mockNotaFiscalUpdate.mockResolvedValueOnce({ id: 'nf1', status: 'AUTORIZADA', type: 'NFSE' });

      const result = await emitirNFSe('t1', 's1');
      expect(result.status).toBe('AUTORIZADA');
      expect(result.type).toBe('NFSE');
      expect(mockNotaFiscalCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'NFSE' }),
        }),
      );
    });

    it('should throw if NFSe already exists for sale', async () => {
      mockVendaFindUnique.mockResolvedValueOnce({
        id: 's1', tenantId: 't1', status: 'CONFIRMADA', items: [],
        client: null, paymentMethod: { name: 'PIX' },
      });
      mockNotaFiscalFindFirst.mockResolvedValueOnce({ id: 'nf-existing' });

      await expect(emitirNFSe('t1', 's1')).rejects.toThrow('Ja existe uma NFSe para esta venda');
    });
  });

  describe('listNotasFiscais', () => {
    it('should return paginated results', async () => {
      mockNotaFiscalFindMany.mockResolvedValueOnce([{ id: 'nf1' }]);
      mockNotaFiscalCount.mockResolvedValueOnce(1);

      const result = await listNotasFiscais('t1', { page: 1, pageSize: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by type', async () => {
      mockNotaFiscalFindMany.mockResolvedValueOnce([]);
      mockNotaFiscalCount.mockResolvedValueOnce(0);

      await listNotasFiscais('t1', { page: 1, pageSize: 20, type: 'NFE' });
      expect(mockNotaFiscalFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 't1', type: 'NFE' }),
        }),
      );
    });
  });

  describe('checkNotaStatus', () => {
    it('should return nota if not PROCESSANDO', async () => {
      mockNotaFiscalFindUnique.mockResolvedValueOnce({
        id: 'nf1', status: 'AUTORIZADA', focusNfeId: 'ref-1',
      });

      const result = await checkNotaStatus('nf1');
      expect(result.status).toBe('AUTORIZADA');
    });

    it('should check and update status', async () => {
      mockNotaFiscalFindUnique.mockResolvedValueOnce({
        id: 'nf1', status: 'PROCESSANDO', focusNfeId: 'ref-1', tenantId: 't1',
      });
      mockConfigFiscalFindUnique.mockResolvedValueOnce({ ambiente: 'homologacao' });
      mockNotaFiscalUpdate.mockResolvedValueOnce({ id: 'nf1', status: 'AUTORIZADA' });

      const result = await checkNotaStatus('nf1');
      expect(result.status).toBe('AUTORIZADA');
    });
  });

  describe('cancelarNota', () => {
    it('should throw if nota not AUTORIZADA', async () => {
      mockNotaFiscalFindUnique.mockResolvedValueOnce({
        id: 'nf1', status: 'PROCESSANDO',
      });

      await expect(cancelarNota('nf1', 'motivo cancelamento aqui com mais texto')).rejects.toThrow(
        'Apenas notas autorizadas podem ser canceladas',
      );
    });

    it('should cancel authorized nota', async () => {
      mockNotaFiscalFindUnique.mockResolvedValueOnce({
        id: 'nf1', status: 'AUTORIZADA', focusNfeId: 'ref-1', tenantId: 't1',
      });
      mockConfigFiscalFindUnique.mockResolvedValueOnce({ ambiente: 'homologacao' });
      mockNotaFiscalUpdate.mockResolvedValueOnce({
        id: 'nf1', status: 'CANCELADA', motivoCancelamento: 'motivo',
      });

      const result = await cancelarNota('nf1', 'Cancelamento por erro no valor da nota fiscal');
      expect(result.status).toBe('CANCELADA');
    });
  });
});
