import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { createVendaSchema, listVendasQuerySchema } from '@/modules/vendas/venda.schema';
import { createVenda, listVendas } from '@/modules/vendas/venda.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async () => {
    const { searchParams } = new URL(request.url);
    const parsed = listVendasQuerySchema.safeParse({
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
      status: searchParams.get('status') || undefined,
      clientId: searchParams.get('clientId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await listVendas(parsed.data);
    return NextResponse.json({
      data: result.data,
      meta: { total: result.total, page: result.page, pageSize: result.pageSize },
    });
  });
}

export async function POST(request: NextRequest) {
  return withTenantApi(request, async () => {
    const body = await request.json();
    const parsed = createVendaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const venda = await createVenda(parsed.data);
    return NextResponse.json({ data: venda }, { status: 201 });
  });
}
