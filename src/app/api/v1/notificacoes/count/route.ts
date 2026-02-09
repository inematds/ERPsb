import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getUnreadCount } from '@/modules/notificacoes/notification.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async () => {
    const count = await getUnreadCount();
    return NextResponse.json({ data: { count } }, { headers: { 'Cache-Control': 'private, max-age=15' } });
  });
}
