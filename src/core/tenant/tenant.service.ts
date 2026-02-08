import { Prisma } from '@prisma/client';
import { basePrisma } from '@/lib/prisma';

export interface CreateTenantInput {
  name: string;
  document?: string;
  type?: string;
  businessType?: string;
  monthlyRevenue?: string;
  plan?: string;
}

export async function createTenant(userId: string, input: CreateTenantInput) {
  const tenant = await basePrisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Deactivate all existing tenants for user
    await tx.userTenant.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    // Create new tenant
    const newTenant = await tx.tenant.create({
      data: {
        name: input.name,
        document: input.document,
        type: input.type ?? 'INFORMAL',
        businessType: input.businessType,
        monthlyRevenue: input.monthlyRevenue,
        plan: input.plan ?? 'FREE',
      },
    });

    // Create UserTenant with OWNER role and isActive=true
    await tx.userTenant.create({
      data: {
        userId,
        tenantId: newTenant.id,
        role: 'OWNER',
        isActive: true,
      },
    });

    return newTenant;
  });

  return tenant;
}

export async function listUserTenants(userId: string) {
  const userTenants = await basePrisma.userTenant.findMany({
    where: { userId },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          type: true,
          plan: true,
          onboardingCompleted: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return userTenants.map((ut) => ({
    tenantId: ut.tenant.id,
    name: ut.tenant.name,
    type: ut.tenant.type,
    plan: ut.tenant.plan,
    role: ut.role,
    isActive: ut.isActive,
    onboardingCompleted: ut.tenant.onboardingCompleted,
  }));
}

export async function switchActiveTenant(userId: string, tenantId: string) {
  // Verify user belongs to tenant
  const userTenant = await basePrisma.userTenant.findUnique({
    where: {
      userId_tenantId: {
        userId,
        tenantId,
      },
    },
  });

  if (!userTenant) {
    throw new Error('User does not belong to this tenant');
  }

  await basePrisma.$transaction([
    // Deactivate all
    basePrisma.userTenant.updateMany({
      where: { userId },
      data: { isActive: false },
    }),
    // Activate selected
    basePrisma.userTenant.update({
      where: {
        userId_tenantId: { userId, tenantId },
      },
      data: { isActive: true },
    }),
  ]);

  return { tenantId };
}
