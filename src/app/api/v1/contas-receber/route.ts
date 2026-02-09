import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { createContaReceberSchema, listContaReceberQuerySchema } from '@/modules/financeiro/conta-receber.schema';
import { createContaReceber, listContasReceber } from '@/modules/financeiro/conta-receber.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async () => {
    const { searchParams } = new URL(request.url);
    const parsed = listContaReceberQuerySchema.safeParse({
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

    const result = await listContasReceber(parsed.data);
    return NextResponse.json({
      data: result.data,
      meta: { total: result.total, page: result.page, pageSize: result.pageSize },
    }, { headers: { 'Cache-Control': 'private, max-age=10' } });
  });
}

export async function POST(request: NextRequest) {
  return withTenantApi(request, async () => {
    const body = await request.json();
    const parsed = createContaReceberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const conta = await createContaReceber(parsed.data);
    return NextResponse.json({ data: conta }, { status: 201 });
  });
}
