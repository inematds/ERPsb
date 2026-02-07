import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { updateFormaPagamentoSchema } from '@/modules/cadastros/forma-pagamento.schema';
import { updateFormaPagamento } from '@/modules/cadastros/forma-pagamento.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateFormaPagamentoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const forma = await updateFormaPagamento(id, parsed.data);
    return NextResponse.json({ data: forma });
  });
}
