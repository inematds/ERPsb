import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getNotaFiscal } from '@/modules/fiscal/nota-fiscal.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const nota = await getNotaFiscal(id);

    if (!nota) {
      return NextResponse.json({ error: 'Nota fiscal nao encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: nota }, { headers: { 'Cache-Control': 'private, max-age=10' } });
  });
}
