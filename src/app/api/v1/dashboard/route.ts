import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getDashboardData } from '@/modules/financeiro/dashboard.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async (_tenantId, _userId) => {
    try {
      const data = await getDashboardData();
      return NextResponse.json({ data });
    } catch (error) {
      console.error('[Dashboard API] Error:', error);
      return NextResponse.json(
        { error: 'Failed to load dashboard', detail: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      );
    }
  });
}
