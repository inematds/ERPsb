import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getDashboardData } from '@/modules/financeiro/dashboard.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async () => {
    const data = await getDashboardData();
    return NextResponse.json({ data });
  });
}
