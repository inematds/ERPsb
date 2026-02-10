import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mockAuth = vi.fn();
const mockFindFirst = vi.fn();

vi.mock('@/core/auth/auth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/prisma', () => ({
  basePrisma: {
    userTenant: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}));

vi.mock('@/core/tenant/tenant.context', () => ({
  runWithTenant: (_tenantId: string, fn: () => unknown) => fn(),
}));

import { withTenantApi } from '@/core/tenant/tenant.middleware';

function createRequest(url = 'http://localhost:3000/api/v1/test') {
  return new NextRequest(url);
}

describe('withTenantApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when no session', async () => {
    mockAuth.mockResolvedValue(null);

    const handler = vi.fn();
    const response = await withTenantApi(createRequest(), handler);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should return 401 when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} });

    const handler = vi.fn();
    const response = await withTenantApi(createRequest(), handler);

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should return 403 when user has no active tenant', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user_1' },
      activeTenantId: null,
    });
    mockFindFirst.mockResolvedValue(null);

    const handler = vi.fn();
    const response = await withTenantApi(createRequest(), handler);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('No active tenant');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should call handler with tenantId from session JWT', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user_1' },
      activeTenantId: 'tenant_1',
    });

    const handler = vi.fn().mockResolvedValue(
      NextResponse.json({ data: 'ok' }),
    );
    const response = await withTenantApi(createRequest(), handler);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledWith('tenant_1', 'user_1');
    // Should not query DB when JWT has tenantId
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it('should fallback to DB query when JWT has no tenantId', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user_1' },
      activeTenantId: null,
    });
    mockFindFirst.mockResolvedValue({ tenantId: 'tenant_from_db' });

    const handler = vi.fn().mockResolvedValue(
      NextResponse.json({ data: 'ok' }),
    );
    const response = await withTenantApi(createRequest(), handler);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledWith('tenant_from_db', 'user_1');
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { userId: 'user_1', isActive: true },
      select: { tenantId: true },
    });
  });

  it('should return 500 when handler throws synchronously', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user_1' },
      activeTenantId: 'tenant_1',
    });

    const handler = vi.fn().mockImplementation(() => {
      throw new Error('DB connection lost');
    });
    const response = await withTenantApi(createRequest(), handler);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('Internal server error');
    expect(body.detail).toBe('DB connection lost');
  });
});
