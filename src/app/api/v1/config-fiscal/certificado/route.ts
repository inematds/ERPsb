import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { uploadCertificateSchema } from '@/modules/fiscal/config-fiscal.schema';
import { uploadCertificate, removeCertificate } from '@/modules/fiscal/config-fiscal.service';

export async function POST(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const body = await request.json();
    const parsed = uploadCertificateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    try {
      const result = await uploadCertificate(tenantId, parsed.data.certificateData, parsed.data.certificatePassword);
      return NextResponse.json({ data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar certificado';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}

export async function DELETE(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    await removeCertificate(tenantId);
    return NextResponse.json({ message: 'Certificado removido' });
  });
}
