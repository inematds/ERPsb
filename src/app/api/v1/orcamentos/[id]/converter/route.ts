import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { convertToVenda } from '@/modules/vendas/orcamento.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;

    try {
      const venda = await convertToVenda(id);
      return NextResponse.json({ data: venda });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao converter orcamento';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
