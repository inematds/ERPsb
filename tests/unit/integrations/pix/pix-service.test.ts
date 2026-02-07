import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPixChargeCreate = vi.fn();
const mockPixChargeFindUnique = vi.fn();
const mockPixChargeFindMany = vi.fn();
const mockPixChargeCount = vi.fn();
const mockPixChargeUpdate = vi.fn();
const mockPixChargeUpdateMany = vi.fn();
const mockContaReceberFindUnique = vi.fn();
const mockContaReceberUpdate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pixCharge: {
      create: (...args: unknown[]) => mockPixChargeCreate(...args),
      findUnique: (...args: unknown[]) => mockPixChargeFindUnique(...args),
      findMany: (...args: unknown[]) => mockPixChargeFindMany(...args),
      count: (...args: unknown[]) => mockPixChargeCount(...args),
      update: (...args: unknown[]) => mockPixChargeUpdate(...args),
      updateMany: (...args: unknown[]) => mockPixChargeUpdateMany(...args),
    },
    contaReceber: {
      findUnique: (...args: unknown[]) => mockContaReceberFindUnique(...args),
      update: (...args: unknown[]) => mockContaReceberUpdate(...args),
    },
  },
}));

vi.mock('@/integrations/pix/mercadopago.client', () => ({
  createPixPayment: vi.fn().mockResolvedValue({
    externalId: 'MOCK-123',
    qrCode: 'base64-qr',
    qrCodeText: 'pix-code',
    paymentLink: 'https://mp.com/pay',
  }),
  getPaymentStatus: vi.fn().mockResolvedValue({
    status: 'PAID',
    paidAt: '2026-02-07T12:00:00Z',
  }),
  cancelPayment: vi.fn().mockResolvedValue(undefined),
}));

import {
  createPixCharge,
  checkPixStatus,
  cancelPixCharge,
  markExpiredCharges,
  listPixCharges,
} from '@/integrations/pix/pix.service';

describe('PIX Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPixChargeUpdateMany.mockResolvedValue({ count: 0 });
  });

  describe('createPixCharge', () => {
    it('should create charge and save to database', async () => {
      mockContaReceberFindUnique.mockResolvedValueOnce({
        id: 'cr-1',
        tenantId: 't1',
        description: 'Venda #1',
        amount: 5000,
        status: 'PENDENTE',
        client: { name: 'Joao' },
      });
      mockPixChargeCreate.mockResolvedValueOnce({
        id: 'pix-1',
        status: 'PENDING',
        amount: 5000,
      });

      const result = await createPixCharge({ contaReceberId: 'cr-1', expirationMinutes: 1440 });

      expect(result.id).toBe('pix-1');
      expect(mockPixChargeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 't1',
            contaReceberId: 'cr-1',
            amount: 5000,
            status: 'PENDING',
            externalId: 'MOCK-123',
            qrCode: 'base64-qr',
            qrCodeText: 'pix-code',
          }),
        }),
      );
    });

    it('should reject if ContaReceber is not PENDENTE', async () => {
      mockContaReceberFindUnique.mockResolvedValueOnce({
        id: 'cr-1',
        tenantId: 't1',
        description: 'Venda #1',
        amount: 5000,
        status: 'RECEBIDO',
        client: null,
      });

      await expect(
        createPixCharge({ contaReceberId: 'cr-1', expirationMinutes: 1440 }),
      ).rejects.toThrow('Conta a receber nao esta pendente');
    });

    it('should reject if ContaReceber not found', async () => {
      mockContaReceberFindUnique.mockResolvedValueOnce(null);

      await expect(
        createPixCharge({ contaReceberId: 'invalid', expirationMinutes: 1440 }),
      ).rejects.toThrow('Conta a receber nao encontrada');
    });
  });

  describe('checkPixStatus', () => {
    it('should update PixCharge and ContaReceber when PAID', async () => {
      mockPixChargeFindUnique.mockResolvedValueOnce({
        id: 'pix-1',
        contaReceberId: 'cr-1',
        externalId: 'EXT-123',
        status: 'PENDING',
      });
      mockPixChargeUpdate.mockResolvedValueOnce({
        id: 'pix-1',
        status: 'PAID',
        contaReceber: { id: 'cr-1', description: 'Venda', amount: 5000, status: 'PENDENTE' },
      });
      mockContaReceberUpdate.mockResolvedValueOnce({ id: 'cr-1', status: 'RECEBIDO' });

      const result = await checkPixStatus('pix-1');

      expect(result.status).toBe('PAID');
      expect(mockContaReceberUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cr-1' },
          data: expect.objectContaining({ status: 'RECEBIDO' }),
        }),
      );
    });

    it('should return charge as-is if not PENDING', async () => {
      const charge = { id: 'pix-1', status: 'PAID', externalId: 'EXT-1' };
      mockPixChargeFindUnique.mockResolvedValueOnce(charge);

      const result = await checkPixStatus('pix-1');

      expect(result).toEqual(charge);
      expect(mockPixChargeUpdate).not.toHaveBeenCalled();
    });
  });

  describe('cancelPixCharge', () => {
    it('should update status to CANCELLED', async () => {
      mockPixChargeFindUnique.mockResolvedValueOnce({
        id: 'pix-1',
        externalId: 'EXT-123',
        status: 'PENDING',
      });
      mockPixChargeUpdate.mockResolvedValueOnce({ id: 'pix-1', status: 'CANCELLED' });

      const result = await cancelPixCharge('pix-1');

      expect(result.status).toBe('CANCELLED');
    });

    it('should reject if not PENDING', async () => {
      mockPixChargeFindUnique.mockResolvedValueOnce({
        id: 'pix-1',
        status: 'PAID',
      });

      await expect(cancelPixCharge('pix-1')).rejects.toThrow(
        'Somente cobranças pendentes podem ser canceladas',
      );
    });
  });

  describe('markExpiredCharges', () => {
    it('should update PENDING charges past expiresAt to EXPIRED', async () => {
      mockPixChargeUpdateMany.mockResolvedValueOnce({ count: 3 });

      await markExpiredCharges();

      expect(mockPixChargeUpdateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
            expiresAt: expect.objectContaining({ lt: expect.any(Date) }),
          }),
          data: { status: 'EXPIRED' },
        }),
      );
    });
  });

  describe('listPixCharges', () => {
    it('should filter by status and return paginated results', async () => {
      mockPixChargeFindMany.mockResolvedValueOnce([{ id: 'pix-1' }]);
      mockPixChargeCount.mockResolvedValueOnce(1);

      const result = await listPixCharges({ page: 1, pageSize: 20, status: 'PENDING' });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPixChargeFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });
  });
});
