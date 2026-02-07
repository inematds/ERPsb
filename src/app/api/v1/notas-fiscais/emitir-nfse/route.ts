import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { emitirNFSeSchema } from '@/modules/fiscal/nota-fiscal.schema';
import { emitirNFSe } from '@/modules/fiscal/nota-fiscal.service';

export async function POST(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const body = await request.json();
    const parsed = emitirNFSeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    try {
      const nota = await emitirNFSe(tenantId, parsed.data.saleId);
      return NextResponse.json({ data: nota }, { status: 201 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao emitir NFSe';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
