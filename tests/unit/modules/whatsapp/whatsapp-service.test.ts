import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    WHATSAPP_API_TOKEN: undefined,
    WHATSAPP_API_URL: undefined,
  },
}));

const mockWhatsAppMessageCreate = vi.fn();
const mockWhatsAppMessageUpdate = vi.fn();
const mockWhatsAppMessageFindMany = vi.fn();
const mockWhatsAppMessageCount = vi.fn();
const mockWhatsAppMessageFindFirst = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    whatsAppMessage: {
      create: (...args: unknown[]) => mockWhatsAppMessageCreate(...args),
      update: (...args: unknown[]) => mockWhatsAppMessageUpdate(...args),
      findMany: (...args: unknown[]) => mockWhatsAppMessageFindMany(...args),
      count: (...args: unknown[]) => mockWhatsAppMessageCount(...args),
      findFirst: (...args: unknown[]) => mockWhatsAppMessageFindFirst(...args),
    },
  },
}));

vi.mock('@/integrations/whatsapp/whatsapp.client', () => ({
  sendWhatsAppMessage: vi.fn().mockResolvedValue({
    success: true,
    externalId: 'mock-ext-123',
    mock: true,
  }),
}));

import { sendWhatsApp, sendCobrancaPix, listMessages, updateMessageStatus } from '@/modules/whatsapp/whatsapp.service';

describe('WhatsApp Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendWhatsApp', () => {
    it('should create message and send successfully', async () => {
      mockWhatsAppMessageCreate.mockResolvedValueOnce({
        id: 'msg-1', status: 'QUEUED', phone: '5511999999999',
      });
      mockWhatsAppMessageUpdate.mockResolvedValueOnce({
        id: 'msg-1', status: 'SENT', externalId: 'mock-ext-123',
      });

      const result = await sendWhatsApp('t1', '5511999999999', 'cobranca_pix', {
        nome: 'Joao', valor: 'R$ 50,00', link_pix: 'https://pix.test/123',
      });

      expect(result.status).toBe('SENT');
      expect(mockWhatsAppMessageCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 't1',
            phone: '5511999999999',
            type: 'cobranca',
            templateId: 'cobranca_pix',
            status: 'QUEUED',
          }),
        }),
      );
    });

    it('should throw for unknown template', async () => {
      await expect(
        sendWhatsApp('t1', '5511999999999', 'unknown', {}),
      ).rejects.toThrow('Template "unknown" nao encontrado');
    });
  });

  describe('sendCobrancaPix', () => {
    it('should send cobranca PIX message', async () => {
      mockWhatsAppMessageCreate.mockResolvedValueOnce({
        id: 'msg-2', status: 'QUEUED',
      });
      mockWhatsAppMessageUpdate.mockResolvedValueOnce({
        id: 'msg-2', status: 'SENT',
      });

      const result = await sendCobrancaPix(
        't1', 'client-1', 'Maria', '5511888888888', 5000, 'https://pix.test/456',
      );

      expect(result.status).toBe('SENT');
      expect(mockWhatsAppMessageCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'cobranca',
            clientId: 'client-1',
          }),
        }),
      );
    });
  });

  describe('listMessages', () => {
    it('should return paginated results', async () => {
      mockWhatsAppMessageFindMany.mockResolvedValueOnce([{ id: 'msg-1' }]);
      mockWhatsAppMessageCount.mockResolvedValueOnce(1);

      const result = await listMessages('t1', { page: 1, pageSize: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by type', async () => {
      mockWhatsAppMessageFindMany.mockResolvedValueOnce([]);
      mockWhatsAppMessageCount.mockResolvedValueOnce(0);

      await listMessages('t1', { page: 1, pageSize: 20, type: 'cobranca' });
      expect(mockWhatsAppMessageFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 't1', type: 'cobranca' }),
        }),
      );
    });
  });

  describe('updateMessageStatus', () => {
    it('should update message status by externalId', async () => {
      mockWhatsAppMessageFindFirst.mockResolvedValueOnce({ id: 'msg-1', externalId: 'ext-1' });
      mockWhatsAppMessageUpdate.mockResolvedValueOnce({ id: 'msg-1', status: 'DELIVERED' });

      const result = await updateMessageStatus('ext-1', 'DELIVERED', new Date());
      expect(result?.status).toBe('DELIVERED');
    });

    it('should return null if message not found', async () => {
      mockWhatsAppMessageFindFirst.mockResolvedValueOnce(null);

      const result = await updateMessageStatus('unknown-ext', 'DELIVERED');
      expect(result).toBeNull();
    });
  });
});
