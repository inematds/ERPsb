import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { markAsPaid } from '@/modules/financeiro/conta-pagar.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const conta = await markAsPaid(id);
    return NextResponse.json({ data: conta });
  });
}
