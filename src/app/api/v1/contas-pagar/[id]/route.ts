import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { updateContaPagarSchema } from '@/modules/financeiro/conta-pagar.schema';
import { getContaPagar, updateContaPagar, cancelContaPagar } from '@/modules/financeiro/conta-pagar.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const conta = await getContaPagar(id);

    if (!conta) {
      return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: conta });
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateContaPagarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const conta = await updateContaPagar(id, parsed.data);
    return NextResponse.json({ data: conta });
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const conta = await cancelContaPagar(id);
    return NextResponse.json({ data: conta });
  });
}
