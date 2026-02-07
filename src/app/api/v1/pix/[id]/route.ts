import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { getPixCharge } from '@/integrations/pix/pix.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const charge = await getPixCharge(id);

    if (!charge) {
      return NextResponse.json({ error: 'Cobranca PIX nao encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: charge });
  });
}
