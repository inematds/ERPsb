import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/core/auth/auth';
import { createTenant } from '@/core/tenant/tenant.service';
import { determineTenantType, suggestPlan } from '@/lib/constants';
import { validateCNPJ } from '@/lib/validators';

const onboardingSchema = z
  .object({
    businessName: z.string().min(1).max(255),
    businessType: z.string().min(1),
    monthlyRevenue: z.enum(['ATE_5K', '5K_20K', '20K_100K', 'ACIMA_100K']),
    hasCnpj: z.boolean(),
    cnpj: z.string().optional(),
    paymentMethods: z.array(z.string()).min(1),
  })
  .refine(
    (data) => {
      if (data.hasCnpj && data.cnpj) {
        return validateCNPJ(data.cnpj);
      }
      return true;
    },
    { message: 'CNPJ invalido', path: ['cnpj'] },
  );

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { businessName, businessType, monthlyRevenue, hasCnpj, cnpj, paymentMethods } =
    parsed.data;

  const tenantType = determineTenantType(hasCnpj, monthlyRevenue);
  const plan = suggestPlan(monthlyRevenue);

  const tenant = await createTenant(user.id, {
    name: businessName,
    document: hasCnpj && cnpj ? cnpj.replace(/\D/g, '') : undefined,
    type: tenantType,
    businessType,
    monthlyRevenue,
    plan,
  });

  // Mark onboarding as completed
  const { basePrisma } = await import('@/lib/prisma');
  await basePrisma.tenant.update({
    where: { id: tenant.id },
    data: {
      onboardingCompleted: true,
    },
  });

  return NextResponse.json(
    {
      data: {
        tenantId: tenant.id,
        name: tenant.name,
        type: tenantType,
        plan,
        paymentMethods,
      },
    },
    { status: 201 },
  );
}
