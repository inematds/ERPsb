import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/core/auth/auth';
import { basePrisma } from '@/lib/prisma';
import { runWithTenant } from './tenant.context';

/**
 * Resolve tenantId from session JWT (fast) or fallback to DB query.
 */
async function resolveTenantId(session: { user: { id: string }; activeTenantId?: string | null }): Promise<string | null> {
  if (session.activeTenantId) {
    return session.activeTenantId;
  }
  // Fallback: query DB (only happens if JWT doesn't have tenantId yet)
  const userTenant = await basePrisma.userTenant.findFirst({
    where: { userId: session.user.id, isActive: true },
    select: { tenantId: true },
  });
  return userTenant?.tenantId ?? null;
}

/**
 * Server-side middleware to extract and inject tenant context.
 * Use this in API routes and server actions.
 */
export async function withTenantContext<T>(fn: () => Promise<T>): Promise<T> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }

  const tenantId = await resolveTenantId(session);

  if (!tenantId) {
    throw new Error('No active tenant');
  }

  return runWithTenant(tenantId, fn);
}

/**
 * API route wrapper that ensures tenant context.
 * Returns 401 if not authenticated, 403 if no active tenant.
 */
export async function withTenantApi(
  _request: NextRequest,
  handler: (tenantId: string, userId: string) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      console.warn('[withTenantApi] No session or user.id. Session:', JSON.stringify(session));
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = await resolveTenantId(session);

    if (!tenantId) {
      console.warn('[withTenantApi] No active tenant for user:', session.user.id);
      return NextResponse.json({ error: 'No active tenant' }, { status: 403 });
    }

    return runWithTenant(tenantId, () =>
      handler(tenantId, session.user.id),
    );
  } catch (error) {
    console.error('[withTenantApi] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
