import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getSaldosTodos } from '@/modules/estoque/estoque.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const saldos = await getSaldosTodos(tenantId);
    return NextResponse.json({ data: saldos });
  });
}
