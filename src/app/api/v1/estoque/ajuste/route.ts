import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { registrarAjusteSchema } from '@/modules/estoque/estoque.schema';
import { registrarAjuste } from '@/modules/estoque/estoque.service';

export async function POST(request: NextRequest) {
  return withTenantApi(request, async (tenantId) => {
    const body = await request.json();
    const parsed = registrarAjusteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const mov = await registrarAjuste(tenantId, parsed.data);
    return NextResponse.json({ data: mov }, { status: 201 });
  });
}
