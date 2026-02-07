import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { checkNotaStatus } from '@/modules/fiscal/nota-fiscal.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;

    try {
      const nota = await checkNotaStatus(id);
      return NextResponse.json({ data: nota });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao consultar status';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
