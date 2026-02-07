import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getProduto, updateProduto, deleteProduto } from '@/modules/cadastros/produto.service';
import { updateProdutoSchema } from '@/modules/cadastros/produto.schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const produto = await getProduto(id);

    if (!produto) {
      return NextResponse.json({ error: 'Produto not found' }, { status: 404 });
    }

    return NextResponse.json({ data: produto });
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProdutoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    try {
      const produto = await updateProduto(id, parsed.data);
      return NextResponse.json({ data: produto });
    } catch {
      return NextResponse.json({ error: 'Produto not found' }, { status: 404 });
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;

    try {
      await deleteProduto(id);
      return NextResponse.json({ data: { deleted: true } });
    } catch {
      return NextResponse.json({ error: 'Produto not found' }, { status: 404 });
    }
  });
}
