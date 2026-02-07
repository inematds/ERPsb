'use client';

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-yellow-500 text-yellow-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4" />
      Voce esta offline. Dados podem estar desatualizados.
    </div>
  );
}
