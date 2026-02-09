import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { createCliente, listClientes } from '@/modules/cadastros/cliente.service';
import { createClienteSchema, listClienteQuerySchema } from '@/modules/cadastros/cliente.schema';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async () => {
    const { searchParams } = new URL(request.url);
    const parsed = listClienteQuerySchema.safeParse({
      search: searchParams.get('search') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await listClientes(parsed.data);
    return NextResponse.json(
      { data: result.data, meta: { total: result.total, page: result.page, pageSize: result.pageSize } },
      { headers: { 'Cache-Control': 'private, max-age=10' } },
    );
  });
}

export async function POST(request: NextRequest) {
  return withTenantApi(request, async () => {
    const body = await request.json();
    const parsed = createClienteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const cliente = await createCliente(parsed.data);
    return NextResponse.json({ data: cliente }, { status: 201 });
  });
}
