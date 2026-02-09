import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { updateLembreteConfigSchema } from '@/modules/whatsapp/lembrete.schema';
import { getLembreteConfig, upsertLembreteConfig } from '@/modules/whatsapp/lembrete.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const config = await getLembreteConfig(tenantId);
    return NextResponse.json({ data: config }, { headers: { 'Cache-Control': 'private, max-age=60' } });
  });
}

export async function PUT(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const body = await request.json();
    const parsed = updateLembreteConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const config = await upsertLembreteConfig(tenantId, parsed.data);
    return NextResponse.json({ data: config });
  });
}
