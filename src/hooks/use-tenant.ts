'use client';

import { useState, useEffect, useCallback } from 'react';

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
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeTenant = tenants.find((t) => t.isActive) ?? null;

  const fetchTenants = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/tenants');
      if (res.ok) {
        const json = await res.json();
        setTenants(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const switchTenant = useCallback(
    async (tenantId: string) => {
      const res = await fetch('/api/v1/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });

      if (res.ok) {
        await fetchTenants();
        // Reload page to refresh server components with new tenant context
        window.location.reload();
      }
    },
    [fetchTenants],
  );

  return {
    activeTenantId: activeTenant?.tenantId ?? null,
    activeTenantName: activeTenant?.name ?? null,
    tenants,
    isLoading,
    switchTenant,
  };
}
