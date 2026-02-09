import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getCliente, updateCliente, deleteCliente } from '@/modules/cadastros/cliente.service';
import { updateClienteSchema } from '@/modules/cadastros/cliente.schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const cliente = await getCliente(id);

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente not found' }, { status: 404 });
    }

    return NextResponse.json({ data: cliente }, { headers: { 'Cache-Control': 'private, max-age=10' } });
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateClienteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    try {
      const cliente = await updateCliente(id, parsed.data);
      return NextResponse.json({ data: cliente });
    } catch {
      return NextResponse.json({ error: 'Cliente not found' }, { status: 404 });
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
      await deleteCliente(id);
      return NextResponse.json({ data: { deleted: true } });
    } catch {
      return NextResponse.json({ error: 'Cliente not found' }, { status: 404 });
    }
  });
}
