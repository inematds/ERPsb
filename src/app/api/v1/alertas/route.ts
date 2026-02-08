import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getAlertasData } from '@/modules/financeiro/alerta.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async (_tenantId, _userId) => {
    try {
      const data = await getAlertasData();
      return NextResponse.json({ data });
    } catch (error) {
      console.error('[Alertas API] Error:', error);
      return NextResponse.json(
        { error: 'Failed to load alertas', detail: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      );
    }
  });
}
