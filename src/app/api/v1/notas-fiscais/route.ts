import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { emitirNFeSchema, listNotasFiscaisQuerySchema } from '@/modules/fiscal/nota-fiscal.schema';
import { emitirNFe, listNotasFiscais } from '@/modules/fiscal/nota-fiscal.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const { searchParams } = new URL(request.url);
    const parsed = listNotasFiscaisQuerySchema.safeParse({
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      saleId: searchParams.get('saleId') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await listNotasFiscais(tenantId, parsed.data);
    return NextResponse.json({
      data: result.data,
      meta: { total: result.total, page: result.page, pageSize: result.pageSize },
    });
  });
}

export async function POST(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const body = await request.json();
    const parsed = emitirNFeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    try {
      const nota = await emitirNFe(tenantId, parsed.data.saleId);
      return NextResponse.json({ data: nota }, { status: 201 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao emitir NFe';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
