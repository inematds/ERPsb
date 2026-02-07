import { NextRequest, NextResponse } from 'next/server';
import { updateMessageStatus } from '@/modules/whatsapp/whatsapp.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const externalId = body.data?.key?.id ?? body.externalId;
    const event = body.event ?? body.status;

    if (!externalId || !event) {
      return NextResponse.json({ ok: true });
    }

    let status: string;
    let deliveredAt: Date | undefined;
    let readAt: Date | undefined;

    switch (event) {
      case 'DELIVERY_ACK':
      case 'delivered':
        status = 'DELIVERED';
        deliveredAt = new Date();
        break;
      case 'READ':
      case 'read':
        status = 'READ';
        readAt = new Date();
        break;
      case 'FAILED':
      case 'failed':
        status = 'FAILED';
        break;
      default:
        status = 'SENT';
    }

    await updateMessageStatus(externalId, status, deliveredAt, readAt);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
