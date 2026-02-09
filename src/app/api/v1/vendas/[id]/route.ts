import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getVenda } from '@/modules/vendas/venda.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const venda = await getVenda(id);

    if (!venda) {
      return NextResponse.json({ error: 'Venda nao encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: venda }, { headers: { 'Cache-Control': 'private, max-age=10' } });
  });
}
