'use client';

import { SWRConfig } from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    // No active tenant — redirect to onboarding
    if (res.status === 403) {
      window.location.href = '/onboarding';
      return;
    }
    const error = new Error('Erro ao carregar dados') as Error & { status: number };
    error.status = res.status;
    throw error;
  }
  const json = await res.json();
  return json.data ?? json;
};

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        dedupingInterval: 5000,
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  );
}
