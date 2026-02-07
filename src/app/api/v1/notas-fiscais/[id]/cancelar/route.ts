import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { cancelarNotaSchema } from '@/modules/fiscal/nota-fiscal.schema';
import { cancelarNota } from '@/modules/fiscal/nota-fiscal.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const body = await request.json();
    const parsed = cancelarNotaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    try {
      const nota = await cancelarNota(id, parsed.data.motivo);
      return NextResponse.json({ data: nota });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar nota';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
