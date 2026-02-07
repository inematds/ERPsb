import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPixChargeFindFirst = vi.fn();
const mockNotificationCreate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pixCharge: {
      findFirst: (...args: unknown[]) => mockPixChargeFindFirst(...args),
    },
    notification: {
      create: (...args: unknown[]) => mockNotificationCreate(...args),
    },
  },
}));

const mockCheckPixStatus = vi.fn();

vi.mock('@/integrations/pix/pix.service', () => ({
  checkPixStatus: (...args: unknown[]) => mockCheckPixStatus(...args),
}));

vi.mock('@/modules/notificacoes/notification.service', () => ({
  createNotification: (...args: unknown[]) => mockNotificationCreate(...args),
}));

vi.mock('@/lib/formatters', () => ({
  formatCurrency: (v: number) => `R$ ${(v / 100).toFixed(2)}`,
}));

import { processWebhookNotification } from '@/integrations/pix/pix.webhook';

describe('PIX Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process payment.updated and create notification when PAID', async () => {
    mockPixChargeFindFirst.mockResolvedValueOnce({
      id: 'pix-1',
      tenantId: 't1',
      status: 'PENDING',
      amount: 5000,
      contaReceber: {
        description: 'Venda #1',
        client: { name: 'Joao' },
      },
    });
    mockCheckPixStatus.mockResolvedValueOnce({ id: 'pix-1', status: 'PAID' });
    mockNotificationCreate.mockResolvedValueOnce({ id: 'n1' });

    const result = await processWebhookNotification({
      action: 'payment.updated',
      type: 'payment',
      data: { id: '12345' },
    });

    expect(result.processed).toBe(true);
    expect(result.pixChargeId).toBe('pix-1');
    expect(mockCheckPixStatus).toHaveBeenCalledWith('pix-1');
    expect(mockNotificationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 't1',
        type: 'PIX_PAID',
        title: 'Pagamento PIX recebido',
      }),
    );
  });

  it('should ignore non-payment events', async () => {
    const result = await processWebhookNotification({
      type: 'test',
      action: 'test.created',
    });

    expect(result.processed).toBe(false);
    expect(result.reason).toContain('Not a payment event');
  });

  it('should handle PixCharge not found gracefully', async () => {
    mockPixChargeFindFirst.mockResolvedValueOnce(null);

    const result = await processWebhookNotification({
      type: 'payment',
      action: 'payment.updated',
      data: { id: '99999' },
    });

    expect(result.processed).toBe(false);
    expect(result.reason).toContain('not found');
  });

  it('should skip already processed PixCharge', async () => {
    mockPixChargeFindFirst.mockResolvedValueOnce({
      id: 'pix-1',
      tenantId: 't1',
      status: 'PAID',
      amount: 5000,
      contaReceber: { description: 'Venda #1', client: null },
    });

    const result = await processWebhookNotification({
      type: 'payment',
      action: 'payment.updated',
      data: { id: '12345' },
    });

    expect(result.processed).toBe(false);
    expect(result.reason).toContain('already PAID');
    expect(mockCheckPixStatus).not.toHaveBeenCalled();
  });
});
