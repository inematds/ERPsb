import { prisma } from '@/lib/prisma';
import { createPixPayment, getPaymentStatus, cancelPayment } from './mercadopago.client';
import type { CreatePixChargeInput, ListPixChargesQuery } from './pix.schema';

export async function createPixCharge(data: CreatePixChargeInput) {
  const contaReceber = await prisma.contaReceber.findUnique({
    where: { id: data.contaReceberId },
    include: { client: { select: { name: true } } },
  });

  if (!contaReceber) throw new Error('Conta a receber nao encontrada');
  if (contaReceber.status !== 'PENDENTE') throw new Error('Conta a receber nao esta pendente');

  const description = contaReceber.client
    ? `${contaReceber.description} - ${contaReceber.client.name}`
    : contaReceber.description;

  const expirationMinutes = data.expirationMinutes ?? 1440;
  const payment = await createPixPayment(contaReceber.amount, description, expirationMinutes);

  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  return prisma.pixCharge.create({
    data: {
      tenantId: contaReceber.tenantId,
      contaReceberId: data.contaReceberId,
      externalId: payment.externalId,
      amount: contaReceber.amount,
      qrCode: payment.qrCode,
      qrCodeText: payment.qrCodeText,
      paymentLink: payment.paymentLink,
      status: 'PENDING',
      expiresAt,
    },
    include: {
      contaReceber: {
        select: { id: true, description: true, amount: true, status: true },
      },
    },
  });
}

export async function getPixCharge(id: string) {
  return prisma.pixCharge.findUnique({
    where: { id },
    include: {
      contaReceber: {
        select: {
          id: true,
          description: true,
          amount: true,
          status: true,
          client: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function listPixCharges(query: ListPixChargesQuery) {
  const { page, pageSize, status, contaReceberId } = query;

  // Mark expired before listing
  await markExpiredCharges();

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (contaReceberId) where.contaReceberId = contaReceberId;

  const [data, total] = await Promise.all([
    prisma.pixCharge.findMany({
      where,
      include: {
        contaReceber: {
          select: {
            id: true,
            description: true,
            amount: true,
            status: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.pixCharge.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function checkPixStatus(id: string) {
  const charge = await prisma.pixCharge.findUnique({ where: { id } });

  if (!charge) throw new Error('Cobranca PIX nao encontrada');
  if (charge.status !== 'PENDING') return charge;
  if (!charge.externalId) throw new Error('Cobranca sem ID externo');

  const paymentStatus = await getPaymentStatus(charge.externalId);

  if (paymentStatus.status === charge.status) return charge;

  const updateData: Record<string, unknown> = { status: paymentStatus.status };
  if (paymentStatus.status === 'PAID' && paymentStatus.paidAt) {
    updateData.paidAt = new Date(paymentStatus.paidAt);
  }

  const updated = await prisma.pixCharge.update({
    where: { id },
    data: updateData,
    include: {
      contaReceber: {
        select: { id: true, description: true, amount: true, status: true },
      },
    },
  });

  // If paid, mark ContaReceber as received
  if (paymentStatus.status === 'PAID') {
    await prisma.contaReceber.update({
      where: { id: charge.contaReceberId },
      data: {
        status: 'RECEBIDO',
        receivedDate: paymentStatus.paidAt ? new Date(paymentStatus.paidAt) : new Date(),
      },
    });
  }

  return updated;
}

export async function cancelPixCharge(id: string) {
  const charge = await prisma.pixCharge.findUnique({ where: { id } });

  if (!charge) throw new Error('Cobranca PIX nao encontrada');
  if (charge.status !== 'PENDING') throw new Error('Somente cobranças pendentes podem ser canceladas');

  if (charge.externalId) {
    await cancelPayment(charge.externalId);
  }

  return prisma.pixCharge.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: {
      contaReceber: {
        select: { id: true, description: true, amount: true, status: true },
      },
    },
  });
}

export async function markExpiredCharges() {
  await prisma.pixCharge.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });
}
