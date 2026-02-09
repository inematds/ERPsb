'use client';

import { useCallback } from 'react';
import useSWR from 'swr';

interface TenantInfo {
  tenantId: string;
  name: string;
  type: string;
  plan: string;
  role: string;
  isActive: boolean;
  onboardingCompleted: boolean;
}

export function useTenant() {
  const { data: tenants = [], isLoading, mutate } = useSWR<TenantInfo[]>(
    '/api/v1/tenants',
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60_000, // 1 minute dedup
    },
  );

  const activeTenant = tenants.find((t) => t.isActive) ?? null;

  const switchTenant = useCallback(
    async (tenantId: string) => {
      const res = await fetch('/api/v1/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });

      if (res.ok) {
        await mutate();
        window.location.reload();
      }
    },
    [mutate],
  );

  return {
    activeTenantId: activeTenant?.tenantId ?? null,
    activeTenantName: activeTenant?.name ?? null,
    tenants,
    isLoading,
    switchTenant,
  };
}
