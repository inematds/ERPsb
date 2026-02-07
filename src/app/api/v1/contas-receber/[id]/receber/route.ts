import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { markAsReceived } from '@/modules/financeiro/conta-receber.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const conta = await markAsReceived(id);
    return NextResponse.json({ data: conta });
  });
}
