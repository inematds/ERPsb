import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { processLembretes } from '@/modules/whatsapp/lembrete.service';

export async function POST(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    try {
      const result = await processLembretes(tenantId);
      return NextResponse.json({ data: result });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar lembretes';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  });
}
