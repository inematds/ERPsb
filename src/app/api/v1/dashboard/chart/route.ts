import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getCashFlowChart } from '@/modules/financeiro/dashboard.service';
import { cached } from '@/lib/server-cache';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    try {
      const data = await cached(
        `dashboard:chart:${tenantId}`,
        60_000,
        () => getCashFlowChart(30),
      );
      return NextResponse.json({ data }, {
        headers: { 'Cache-Control': 'private, max-age=60' },
      });
    } catch (error) {
      console.error('[Dashboard Chart] Error:', error);
      return NextResponse.json(
        { error: 'Failed to load chart', detail: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      );
    }
  });
}
