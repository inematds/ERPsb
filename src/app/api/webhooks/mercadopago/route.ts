import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { processWebhookNotification } from '@/integrations/pix/pix.webhook';

function validateSignature(request: NextRequest, body: string): boolean {
  const secret = env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return true; // Skip validation in dev mode

  const signature = request.headers.get('x-signature');
  const requestId = request.headers.get('x-request-id');

  if (!signature || !requestId) return false;

  // Parse x-signature: ts=TIMESTAMP,v1=HASH
  const parts: Record<string, string> = {};
  for (const part of signature.split(',')) {
    const [key, value] = part.split('=');
    if (key && value) parts[key] = value;
  }

  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  // Parse body for data.id
  let dataId = '';
  try {
    const parsed = JSON.parse(body);
    dataId = parsed?.data?.id ? String(parsed.data.id) : '';
  } catch {
    return false;
  }

  // Build template: id:{data.id};request-id:{x-request-id};ts:{ts};
  const template = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hmac = createHmac('sha256', secret).update(template).digest('hex');

  return hmac === v1;
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Validate signature
  if (!validateSignature(request, body)) {
    // Log failed validation attempt
    await prisma.webhookLog.create({
      data: {
        source: 'mercadopago',
        eventType: 'INVALID_SIGNATURE',
        payload: {},
        status: 'FAILED',
        error: 'Invalid webhook signature',
      },
    }).catch(() => {}); // Don't fail on log error

    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const externalId = payload?.data?.id ? String(payload.data.id) : null;
  const eventType = payload?.action || payload?.type || 'unknown';

  // Log the webhook
  const log = await prisma.webhookLog.create({
    data: {
      source: 'mercadopago',
      eventType,
      externalId,
      payload,
      status: 'RECEIVED',
    },
  }).catch(() => null);

  // Process the notification
  try {
    const result = await processWebhookNotification(payload);

    // Update log with result
    if (log) {
      await prisma.webhookLog.update({
        where: { id: log.id },
        data: {
          status: result.processed ? 'PROCESSED' : 'RECEIVED',
          tenantId: result.processed ? undefined : null,
        },
      }).catch(() => {});
    }
  } catch (error) {
    // Update log with error but still return 200
    if (log) {
      await prisma.webhookLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }).catch(() => {});
    }
  }

  // Always return 200 to Mercado Pago
  return NextResponse.json({ received: true });
}
