'use client';

import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePwaInstall } from '@/hooks/use-pwa-install';

export function InstallBanner() {
  const { canInstall, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <Download className="h-4 w-4" />
        Instale o ERPsb no seu celular!
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => promptInstall()}
          className="text-xs h-7"
        >
          Instalar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDismissed(true)}
          className="h-7 w-7 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
