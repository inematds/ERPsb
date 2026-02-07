import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { updateOrcamentoSchema } from '@/modules/vendas/orcamento.schema';
import { getOrcamento, updateOrcamento } from '@/modules/vendas/orcamento.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const orcamento = await getOrcamento(id);

    if (!orcamento) {
      return NextResponse.json({ error: 'Orcamento nao encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: orcamento });
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateOrcamentoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    try {
      const orcamento = await updateOrcamento(id, parsed.data);
      return NextResponse.json({ data: orcamento });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar orcamento';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
