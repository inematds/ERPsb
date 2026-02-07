import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { cancelPixCharge } from '@/integrations/pix/pix.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withTenantApi(request, async () => {
    const { id } = await params;
    const charge = await cancelPixCharge(id);
    return NextResponse.json({ data: charge });
  });
}
