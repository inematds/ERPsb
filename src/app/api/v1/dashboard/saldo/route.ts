import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getDashboardSaldo } from '@/modules/financeiro/dashboard.service';
import { cached } from '@/lib/server-cache';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    try {
      const data = await cached(
        `dashboard:saldo:${tenantId}`,
        30_000,
        () => getDashboardSaldo(),
      );
      return NextResponse.json({ data }, {
        headers: { 'Cache-Control': 'private, max-age=30' },
      });
    } catch (error) {
      console.error('[Dashboard Saldo] Error:', error);
      return NextResponse.json(
        { error: 'Failed to load saldo', detail: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      );
    }
  });
}
