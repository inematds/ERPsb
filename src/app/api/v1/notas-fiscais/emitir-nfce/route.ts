import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { emitirNFCeSchema } from '@/modules/fiscal/nota-fiscal.schema';
import { emitirNFCe } from '@/modules/fiscal/nota-fiscal.service';

export async function POST(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const body = await request.json();
    const parsed = emitirNFCeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    try {
      const nota = await emitirNFCe(tenantId, parsed.data.saleId);
      return NextResponse.json({ data: nota }, { status: 201 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao emitir NFCe';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
