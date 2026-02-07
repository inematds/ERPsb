import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/core/auth/auth';
import { createTenant, listUserTenants, switchActiveTenant } from '@/core/tenant/tenant.service';

const createTenantSchema = z.object({
  name: z.string().min(1).max(255),
  document: z.string().optional(),
  type: z.enum(['MEI', 'ME', 'EPP', 'INFORMAL']).optional(),
  businessType: z.string().optional(),
  monthlyRevenue: z.string().optional(),
  plan: z.enum(['FREE', 'STARTER', 'GROWTH', 'PRO']).optional(),
});

const switchTenantSchema = z.object({
  tenantId: z.string().min(1),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenants = await listUserTenants(user.id);
  return NextResponse.json({ data: tenants });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createTenantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenant = await createTenant(user.id, parsed.data);
  return NextResponse.json({ data: tenant }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = switchTenantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const result = await switchActiveTenant(user.id, parsed.data.tenantId);
    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json({ error: 'Tenant not found or access denied' }, { status: 403 });
  }
}
