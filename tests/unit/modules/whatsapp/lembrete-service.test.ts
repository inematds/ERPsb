import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    WHATSAPP_API_TOKEN: undefined,
    WHATSAPP_API_URL: undefined,
  },
}));

const mockLembreteConfigFindUnique = vi.fn();
const mockLembreteConfigUpsert = vi.fn();
const mockContaReceberFindMany = vi.fn();
const mockWhatsAppMessageFindFirst = vi.fn();
const mockWhatsAppMessageCreate = vi.fn();
const mockWhatsAppMessageUpdate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    lembreteConfig: {
      findUnique: (...args: unknown[]) => mockLembreteConfigFindUnique(...args),
      upsert: (...args: unknown[]) => mockLembreteConfigUpsert(...args),
    },
    contaReceber: {
      findMany: (...args: unknown[]) => mockContaReceberFindMany(...args),
    },
    whatsAppMessage: {
      findFirst: (...args: unknown[]) => mockWhatsAppMessageFindFirst(...args),
      create: (...args: unknown[]) => mockWhatsAppMessageCreate(...args),
      update: (...args: unknown[]) => mockWhatsAppMessageUpdate(...args),
    },
  },
}));

vi.mock('@/integrations/whatsapp/whatsapp.client', () => ({
  sendWhatsAppMessage: vi.fn().mockResolvedValue({
    success: true,
    externalId: 'mock-lembrete-123',
    mock: true,
  }),
}));

import { getLembreteConfig, upsertLembreteConfig, processLembretes } from '@/modules/whatsapp/lembrete.service';

describe('Lembrete Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLembreteConfig', () => {
    it('should return config when exists', async () => {
      mockLembreteConfigFindUnique.mockResolvedValueOnce({
        ativo: true, diasAntes: 5, noDia: true, diasDepois: 2,
      });
      const result = await getLembreteConfig('t1');
      expect(result.ativo).toBe(true);
      expect(result.diasAntes).toBe(5);
    });

    it('should return defaults when not configured', async () => {
      mockLembreteConfigFindUnique.mockResolvedValueOnce(null);
      const result = await getLembreteConfig('t1');
      expect(result.ativo).toBe(false);
      expect(result.diasAntes).toBe(3);
      expect(result.noDia).toBe(true);
      expect(result.diasDepois).toBe(1);
    });
  });

  describe('upsertLembreteConfig', () => {
    it('should upsert config', async () => {
      mockLembreteConfigUpsert.mockResolvedValueOnce({
        tenantId: 't1', ativo: true, diasAntes: 3, noDia: true, diasDepois: 1,
      });
      const result = await upsertLembreteConfig('t1', {
        ativo: true, diasAntes: 3, noDia: true, diasDepois: 1,
      });
      expect(result.ativo).toBe(true);
    });
  });

  describe('processLembretes', () => {
    it('should return 0 when config not found', async () => {
      mockLembreteConfigFindUnique.mockResolvedValueOnce(null);
      const result = await processLembretes('t1');
      expect(result.sent).toBe(0);
      expect(result.skipped).toBe(0);
    });

    it('should return 0 when lembretes not ativo', async () => {
      mockLembreteConfigFindUnique.mockResolvedValueOnce({
        ativo: false, diasAntes: 3, noDia: true, diasDepois: 1,
      });
      const result = await processLembretes('t1');
      expect(result.sent).toBe(0);
    });

    it('should process and send lembretes', async () => {
      mockLembreteConfigFindUnique.mockResolvedValueOnce({
        ativo: true, diasAntes: 3, noDia: true, diasDepois: 1,
      });
      mockContaReceberFindMany.mockResolvedValueOnce([
        {
          id: 'cr-1',
          tenantId: 't1',
          clientId: 'c-1',
          amount: 5000,
          dueDate: new Date(),
          status: 'PENDENTE',
          client: { id: 'c-1', name: 'Joao', phone: '5511999999999' },
          pixCharges: [],
        },
      ]);
      mockWhatsAppMessageFindFirst.mockResolvedValueOnce(null); // not sent today
      mockWhatsAppMessageCreate.mockResolvedValueOnce({ id: 'msg-1', status: 'QUEUED' });
      mockWhatsAppMessageUpdate.mockResolvedValueOnce({ id: 'msg-1', status: 'SENT' });

      const result = await processLembretes('t1');
      expect(result.sent).toBe(1);
      expect(result.skipped).toBe(0);
    });

    it('should skip when already sent today (deduplication)', async () => {
      mockLembreteConfigFindUnique.mockResolvedValueOnce({
        ativo: true, diasAntes: 0, noDia: true, diasDepois: 0,
      });
      mockContaReceberFindMany.mockResolvedValueOnce([
        {
          id: 'cr-1',
          tenantId: 't1',
          clientId: 'c-1',
          amount: 5000,
          dueDate: new Date(),
          client: { id: 'c-1', name: 'Joao', phone: '5511999999999' },
          pixCharges: [],
        },
      ]);
      mockWhatsAppMessageFindFirst.mockResolvedValueOnce({ id: 'msg-existing' }); // already sent

      const result = await processLembretes('t1');
      expect(result.sent).toBe(0);
      expect(result.skipped).toBe(1);
    });

    it('should skip when client has no phone', async () => {
      mockLembreteConfigFindUnique.mockResolvedValueOnce({
        ativo: true, diasAntes: 0, noDia: true, diasDepois: 0,
      });
      mockContaReceberFindMany.mockResolvedValueOnce([
        {
          id: 'cr-1',
          tenantId: 't1',
          clientId: 'c-1',
          amount: 5000,
          dueDate: new Date(),
          client: { id: 'c-1', name: 'Joao', phone: null },
          pixCharges: [],
        },
      ]);

      const result = await processLembretes('t1');
      expect(result.sent).toBe(0);
      expect(result.skipped).toBe(1);
    });
  });
});
