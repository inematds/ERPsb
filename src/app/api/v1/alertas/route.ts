import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getAlertasData } from '@/modules/financeiro/alerta.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async () => {
    const data = await getAlertasData();
    return NextResponse.json({ data });
  });
}
