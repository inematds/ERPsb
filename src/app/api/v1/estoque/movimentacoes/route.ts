import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { listMovimentacoesQuerySchema } from '@/modules/estoque/estoque.schema';
import { listarMovimentacoes } from '@/modules/estoque/estoque.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = listMovimentacoesQuerySchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await listarMovimentacoes(tenantId, parsed.data);
    return NextResponse.json({
      data: result.data,
      meta: { total: result.total, page: result.page, pageSize: result.pageSize },
    }, { headers: { 'Cache-Control': 'private, max-age=10' } });
  });
}
