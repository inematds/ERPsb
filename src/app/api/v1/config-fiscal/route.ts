import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { updateConfigFiscalSchema } from '@/modules/fiscal/config-fiscal.schema';
import { getConfigFiscal, upsertConfigFiscal, checkCertificateExpiry } from '@/modules/fiscal/config-fiscal.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const config = await getConfigFiscal(tenantId);
    const certStatus = await checkCertificateExpiry(tenantId);

    return NextResponse.json({
      data: config,
      certificateStatus: certStatus,
    });
  });
}

export async function PUT(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const body = await request.json();
    const parsed = updateConfigFiscalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const config = await upsertConfigFiscal(tenantId, parsed.data);
    return NextResponse.json({ data: config });
  });
}
