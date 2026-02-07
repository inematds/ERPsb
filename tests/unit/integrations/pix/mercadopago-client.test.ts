import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    MERCADO_PAGO_ACCESS_TOKEN: undefined,
  },
}));

import { createPixPayment, getPaymentStatus, cancelPayment } from '@/integrations/pix/mercadopago.client';

describe('Mercado Pago Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPixPayment (mock mode - no token)', () => {
    it('should return mock data when no token configured', async () => {
      const result = await createPixPayment(5000, 'Test payment', 1440);

      expect(result.externalId).toContain('MOCK-');
      expect(result.qrCode).toBeTruthy();
      expect(result.qrCodeText).toBeTruthy();
      expect(result.paymentLink).toBeTruthy();
    });
  });

  describe('getPaymentStatus (mock mode - no token)', () => {
    it('should return PENDING when no token configured', async () => {
      const result = await getPaymentStatus('MOCK-123');

      expect(result.status).toBe('PENDING');
      expect(result.paidAt).toBeNull();
    });
  });

  describe('cancelPayment (mock mode - no token)', () => {
    it('should be a no-op when no token configured', async () => {
      await expect(cancelPayment('MOCK-123')).resolves.toBeUndefined();
    });
  });
});

describe('Mercado Pago Client (with token)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should call fetch with correct params when token is set', async () => {
    vi.doMock('@/lib/env', () => ({
      env: {
        MERCADO_PAGO_ACCESS_TOKEN: 'TEST-TOKEN-123',
      },
    }));

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 12345,
        point_of_interaction: {
          transaction_data: {
            qr_code_base64: 'base64data',
            qr_code: 'pix-code-text',
            ticket_url: 'https://mp.com/checkout',
          },
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { createPixPayment: createWithToken } = await import('@/integrations/pix/mercadopago.client');

    const result = await createWithToken(10000, 'Test', 60);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.mercadopago.com/v1/payments',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer TEST-TOKEN-123',
        }),
      }),
    );
    expect(result.externalId).toBe('12345');
    expect(result.qrCode).toBe('base64data');
    expect(result.qrCodeText).toBe('pix-code-text');

    vi.unstubAllGlobals();
  });
});
