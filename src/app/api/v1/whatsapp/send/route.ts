import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { sendWhatsAppSchema } from '@/modules/whatsapp/whatsapp.schema';
import { sendWhatsApp } from '@/modules/whatsapp/whatsapp.service';

export async function POST(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const body = await request.json();
    const parsed = sendWhatsAppSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    try {
      const message = await sendWhatsApp(
        tenantId,
        parsed.data.phone,
        parsed.data.templateId,
        parsed.data.templateVars,
        parsed.data.clientId,
      );
      return NextResponse.json({ data: message }, { status: 201 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar WhatsApp';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  });
}
