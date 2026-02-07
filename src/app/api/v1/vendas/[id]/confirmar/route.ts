import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { confirmVenda } from '@/modules/vendas/venda.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;

    try {
      const venda = await confirmVenda(id);
      return NextResponse.json({ data: venda });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao confirmar venda';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
