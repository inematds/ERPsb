import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { createFormaPagamentoSchema } from '@/modules/cadastros/forma-pagamento.schema';
import { createFormaPagamento, listFormasPagamento } from '@/modules/cadastros/forma-pagamento.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async () => {
    const data = await listFormasPagamento();
    return NextResponse.json({ data });
  });
}

export async function POST(request: NextRequest) {
  return withTenantApi(request, async () => {
    const body = await request.json();
    const parsed = createFormaPagamentoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const forma = await createFormaPagamento(parsed.data);
    return NextResponse.json({ data: forma }, { status: 201 });
  });
}
