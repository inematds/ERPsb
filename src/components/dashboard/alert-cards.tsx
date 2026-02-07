'use client';

import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import type { Alert } from '@/modules/financeiro/alerta.service';

interface AlertCardsProps {
  alertas: Alert[];
}

const iconMap = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

const styleMap = {
  critical: {
    bg: 'bg-red-50',
    ring: 'ring-red-200',
    icon: 'text-red-600',
    text: 'text-red-800',
  },
  warning: {
    bg: 'bg-yellow-50',
    ring: 'ring-yellow-200',
    icon: 'text-yellow-600',
    text: 'text-yellow-800',
  },
  info: {
    bg: 'bg-blue-50',
    ring: 'ring-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800',
  },
};

export function AlertCards({ alertas }: AlertCardsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (alertas.length === 0) return null;

  const visible = alertas.filter((a) => !dismissed.has(a.type));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((alerta) => {
        const Icon = iconMap[alerta.severity];
        const style = styleMap[alerta.severity];

        return (
          <Card key={alerta.type} className={`${style.bg} ring-1 ${style.ring} border-0`}>
            <CardContent className="flex items-start gap-3 py-3">
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${style.icon}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${style.text}`}>{alerta.title}</p>
                <p className={`text-sm ${style.text} opacity-80`}>
                  {alerta.message}
                  {alerta.amount !== undefined && (
                    <span className="font-medium"> ({formatCurrency(alerta.amount)})</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setDismissed((prev) => new Set(prev).add(alerta.type))}
                className={`flex-shrink-0 p-1 rounded-md hover:bg-black/5 ${style.text} opacity-50 hover:opacity-100`}
              >
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
