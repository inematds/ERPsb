import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import {
  getFornecedor,
  updateFornecedor,
  deleteFornecedor,
} from '@/modules/cadastros/fornecedor.service';
import { updateFornecedorSchema } from '@/modules/cadastros/fornecedor.schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const fornecedor = await getFornecedor(id);

    if (!fornecedor) {
      return NextResponse.json({ error: 'Fornecedor not found' }, { status: 404 });
    }

    return NextResponse.json({ data: fornecedor }, { headers: { 'Cache-Control': 'private, max-age=10' } });
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateFornecedorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    try {
      const fornecedor = await updateFornecedor(id, parsed.data);
      return NextResponse.json({ data: fornecedor });
    } catch {
      return NextResponse.json({ error: 'Fornecedor not found' }, { status: 404 });
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
      await deleteFornecedor(id);
      return NextResponse.json({ data: { deleted: true } });
    } catch {
      return NextResponse.json({ error: 'Fornecedor not found' }, { status: 404 });
    }
  });
}
