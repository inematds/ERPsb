import { AsyncLocalStorage } from 'async_hooks';

interface TenantStore {
  tenantId: string;
}

export const tenantContext = new AsyncLocalStorage<TenantStore>();

export function getTenantIdFromContext(): string | undefined {
  return tenantContext.getStore()?.tenantId;
}

export function runWithTenant<T>(tenantId: string, fn: () => T): T {
  return tenantContext.run({ tenantId }, fn);
}
