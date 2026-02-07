import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/core/auth/auth';
import { basePrisma } from '@/lib/prisma';
import { runWithTenant } from './tenant.context';

/**
 * Server-side middleware to extract and inject tenant context.
 * Use this in API routes and server actions.
 */
export async function withTenantContext<T>(fn: () => Promise<T>): Promise<T> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }

  const userTenant = await basePrisma.userTenant.findFirst({
    where: { userId: session.user.id, isActive: true },
    select: { tenantId: true },
  });

  if (!userTenant) {
    throw new Error('No active tenant');
  }

  return runWithTenant(userTenant.tenantId, fn);
}

/**
 * API route wrapper that ensures tenant context.
 * Returns 401 if not authenticated, 403 if no active tenant.
 */
export async function withTenantApi(
  _request: NextRequest,
  handler: (tenantId: string, userId: string) => Promise<NextResponse>,
): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userTenant = await basePrisma.userTenant.findFirst({
    where: { userId: session.user.id, isActive: true },
    select: { tenantId: true },
  });

  if (!userTenant) {
    return NextResponse.json({ error: 'No active tenant' }, { status: 403 });
  }

  return runWithTenant(userTenant.tenantId, () =>
    handler(userTenant.tenantId, session.user.id),
  );
}
