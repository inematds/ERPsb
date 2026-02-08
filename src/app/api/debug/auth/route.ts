import { NextResponse } from 'next/server';
import { basePrisma } from '@/lib/prisma';
import { auth } from '@/core/auth/auth';

export async function GET() {
  const checks: Record<string, unknown> = {};

  // Check 1: ENV vars
  checks.hasEnableDevLogin = process.env.ENABLE_DEV_LOGIN;
  checks.nodeEnv = process.env.NODE_ENV;
  checks.hasDbUrl = !!process.env.DATABASE_URL;
  checks.dbUrlPort = process.env.DATABASE_URL?.match(/:(\d+)\//)?.[1] ?? 'unknown';
  checks.hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
  checks.nextAuthUrl = process.env.NEXTAUTH_URL;

  // Check 2: DB connection
  try {
    const result = await basePrisma.$queryRaw`SELECT 1 as ok`;
    checks.dbConnection = 'OK';
    checks.dbResult = result;
  } catch (e) {
    checks.dbConnection = 'FAILED';
    checks.dbError = e instanceof Error ? e.message : String(e);
  }

  // Check 3: Session
  try {
    const session = await auth();
    checks.session = session
      ? { userId: session.user?.id, email: session.user?.email, name: session.user?.name }
      : null;
  } catch (e) {
    checks.sessionError = e instanceof Error ? e.message : String(e);
  }

  // Check 4: Find seed user
  try {
    const seedUser = await basePrisma.user.findUnique({
      where: { email: 'admin@erpsb.com.br' },
      select: { id: true, email: true, name: true },
    });
    checks.seedUser = seedUser ?? 'NOT FOUND';
  } catch (e) {
    checks.seedUserError = e instanceof Error ? e.message : String(e);
  }

  // Check 5: UserTenant for seed user
  try {
    const seedUser = await basePrisma.user.findUnique({
      where: { email: 'admin@erpsb.com.br' },
    });
    if (seedUser) {
      const userTenant = await basePrisma.userTenant.findFirst({
        where: { userId: seedUser.id, isActive: true },
        select: { tenantId: true, role: true, isActive: true },
      });
      checks.seedUserTenant = userTenant ?? 'NO ACTIVE TENANT';
    }
  } catch (e) {
    checks.seedUserTenantError = e instanceof Error ? e.message : String(e);
  }

  // Check 6: If session user has tenant
  try {
    const session = await auth();
    if (session?.user?.id) {
      const userTenant = await basePrisma.userTenant.findFirst({
        where: { userId: session.user.id, isActive: true },
        select: { tenantId: true, role: true, isActive: true },
      });
      checks.sessionUserTenant = userTenant ?? 'NO ACTIVE TENANT';

      // Check if session user matches seed user
      const seedUser = await basePrisma.user.findUnique({
        where: { email: 'admin@erpsb.com.br' },
      });
      checks.sessionUserIsSeedUser = seedUser?.id === session.user.id;
    }
  } catch (e) {
    checks.sessionUserTenantError = e instanceof Error ? e.message : String(e);
  }

  // Check 7: Total counts
  try {
    checks.counts = {
      users: await basePrisma.user.count(),
      tenants: await basePrisma.tenant.count(),
      userTenants: await basePrisma.userTenant.count(),
      vendas: await basePrisma.venda.count(),
    };
  } catch (e) {
    checks.countsError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(checks);
}
