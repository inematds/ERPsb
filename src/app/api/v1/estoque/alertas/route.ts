import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getAlertasEstoque } from '@/modules/estoque/estoque.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const alertas = await getAlertasEstoque(tenantId);
    return NextResponse.json({ data: alertas }, { headers: { 'Cache-Control': 'private, max-age=30' } });
  });
}
