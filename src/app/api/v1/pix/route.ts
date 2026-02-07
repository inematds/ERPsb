import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { createPixChargeSchema, listPixChargesQuerySchema } from '@/integrations/pix/pix.schema';
import { createPixCharge, listPixCharges } from '@/integrations/pix/pix.service';

export async function GET(request: NextRequest) {
  return withTenantApi(request, async () => {
    const { searchParams } = new URL(request.url);
    const parsed = listPixChargesQuerySchema.safeParse({
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
      status: searchParams.get('status') || undefined,
      contaReceberId: searchParams.get('contaReceberId') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await listPixCharges(parsed.data);
    return NextResponse.json({
      data: result.data,
      meta: { total: result.total, page: result.page, pageSize: result.pageSize },
    });
  });
}

export async function POST(request: NextRequest) {
  return withTenantApi(request, async () => {
    const body = await request.json();
    const parsed = createPixChargeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const charge = await createPixCharge(parsed.data);
    return NextResponse.json({ data: charge }, { status: 201 });
  });
}
