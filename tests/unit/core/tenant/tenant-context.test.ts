import { describe, it, expect } from 'vitest';
import { getTenantIdFromContext, runWithTenant } from '@/core/tenant/tenant.context';

describe('Tenant Context', () => {
  it('should return undefined outside of tenant context', () => {
    const tenantId = getTenantIdFromContext();
    expect(tenantId).toBeUndefined();
  });

  it('should return tenantId inside runWithTenant', () => {
    const result = runWithTenant('tenant_123', () => {
      return getTenantIdFromContext();
    });
    expect(result).toBe('tenant_123');
  });

  it('should isolate different tenant contexts', async () => {
    const results: (string | undefined)[] = [];

    await Promise.all([
      new Promise<void>((resolve) => {
        runWithTenant('tenant_A', () => {
          results.push(getTenantIdFromContext());
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        runWithTenant('tenant_B', () => {
          results.push(getTenantIdFromContext());
          resolve();
        });
      }),
    ]);

    expect(results).toContain('tenant_A');
    expect(results).toContain('tenant_B');
    expect(results).toHaveLength(2);
  });

  it('should return undefined after runWithTenant completes', () => {
    runWithTenant('tenant_123', () => {
      // inside context
    });

    const tenantId = getTenantIdFromContext();
    expect(tenantId).toBeUndefined();
  });
});
