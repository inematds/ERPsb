import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getDashboardData } from '@/modules/financeiro/dashboard.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async (_tenantId, _userId) => {
    const data = await getDashboardData();
    return NextResponse.json({ data });
  });
}
