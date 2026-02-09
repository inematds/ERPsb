import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { listNotificationsQuerySchema } from '@/modules/notificacoes/notification.schema';
import { listNotifications } from '@/modules/notificacoes/notification.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async () => {
    const { searchParams } = new URL(request.url);
    const parsed = listNotificationsQuerySchema.safeParse({
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
      read: searchParams.get('read') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await listNotifications(parsed.data);
    return NextResponse.json({
      data: result.data,
      meta: { total: result.total, page: result.page, pageSize: result.pageSize },
    }, { headers: { 'Cache-Control': 'private, max-age=10' } });
  });
}
