import { prisma } from '@/lib/prisma';
import { checkPixStatus } from './pix.service';
import { createNotification } from '@/modules/notificacoes/notification.service';
import { formatCurrency } from '@/lib/formatters';

interface MercadoPagoWebhookPayload {
  id?: number;
  action?: string;
  type?: string;
  data?: { id?: string };
}

export async function processWebhookNotification(payload: MercadoPagoWebhookPayload) {
  // Only process payment notifications
  if (payload.type !== 'payment' && payload.action !== 'payment.updated') {
    return { processed: false, reason: 'Not a payment event' };
  }

  const externalId = payload.data?.id ? String(payload.data.id) : null;
  if (!externalId) {
    return { processed: false, reason: 'No external ID in payload' };
  }

  // Find PixCharge by externalId
  const pixCharge = await prisma.pixCharge.findFirst({
    where: { externalId },
    include: {
      contaReceber: {
        select: {
          description: true,
          client: { select: { name: true } },
        },
      },
    },
  });

  if (!pixCharge) {
    return { processed: false, reason: `PixCharge not found for externalId: ${externalId}` };
  }

  if (pixCharge.status !== 'PENDING') {
    return { processed: false, reason: `PixCharge already ${pixCharge.status}` };
  }

  // Use existing checkPixStatus to update PixCharge + ContaReceber
  const updated = await checkPixStatus(pixCharge.id);

  // Create notification if status changed to PAID
  if (updated && 'status' in updated && updated.status === 'PAID') {
    const clientName = pixCharge.contaReceber.client?.name ?? 'Cliente';
    const description = pixCharge.contaReceber.description;

    await createNotification({
      tenantId: pixCharge.tenantId,
      type: 'PIX_PAID',
      title: 'Pagamento PIX recebido',
      message: `${description} - ${formatCurrency(pixCharge.amount)} de ${clientName}`,
      metadata: { pixChargeId: pixCharge.id, amount: pixCharge.amount },
    });
  }

  return { processed: true, pixChargeId: pixCharge.id, newStatus: (updated as { status: string }).status };
}
