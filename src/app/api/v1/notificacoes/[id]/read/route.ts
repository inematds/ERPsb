import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { markAsRead } from '@/modules/notificacoes/notification.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const notification = await markAsRead(id);
    return NextResponse.json({ data: notification });
  });
}
