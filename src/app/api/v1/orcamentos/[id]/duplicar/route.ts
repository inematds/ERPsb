import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { duplicateOrcamento } from '@/modules/vendas/orcamento.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;

    try {
      const orcamento = await duplicateOrcamento(id);
      return NextResponse.json({ data: orcamento }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao duplicar orcamento';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
