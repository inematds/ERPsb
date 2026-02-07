import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    WHATSAPP_API_TOKEN: undefined,
    WHATSAPP_API_URL: undefined,
  },
}));

import { sendWhatsAppMessage, getWhatsAppMessageStatus } from '@/integrations/whatsapp/whatsapp.client';

describe('WhatsApp Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendWhatsAppMessage (mock mode)', () => {
    it('should return mock success when no token', async () => {
      const result = await sendWhatsAppMessage('5511999999999', 'Ola mundo');
      expect(result.success).toBe(true);
      expect(result.mock).toBe(true);
      expect(result.externalId).toBeTruthy();
    });

    it('should generate unique externalId each time', async () => {
      const r1 = await sendWhatsAppMessage('5511999999999', 'msg1');
      const r2 = await sendWhatsAppMessage('5511999999999', 'msg2');
      expect(r1.externalId).not.toBe(r2.externalId);
    });
  });

  describe('getWhatsAppMessageStatus (mock mode)', () => {
    it('should return DELIVERED status when no token', async () => {
      const result = await getWhatsAppMessageStatus('mock-123');
      expect(result.status).toBe('DELIVERED');
      expect(result.mock).toBe(true);
    });
  });
});
