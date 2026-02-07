import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { markAllAsRead } from '@/modules/notificacoes/notification.service';

export async function POST(request: NextRequest) {
  return withTenantApi(request, async () => {
    const result = await markAllAsRead();
    return NextResponse.json({ data: { updated: result.count } });
  });
}
