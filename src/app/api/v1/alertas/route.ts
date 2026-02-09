import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getAlertasData } from '@/modules/financeiro/alerta.service';
import { cached } from '@/lib/server-cache';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async (tenantId, _userId) => {
    try {
      const data = await cached(
        `alertas:${tenantId}`,
        30_000, // 30 seconds TTL
        () => getAlertasData(),
      );
      return NextResponse.json({ data }, {
        headers: { 'Cache-Control': 'private, max-age=30' },
      });
    } catch (error) {
      console.error('[Alertas API] Error:', error);
      return NextResponse.json(
        { error: 'Failed to load alertas', detail: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      );
    }
  });
}
