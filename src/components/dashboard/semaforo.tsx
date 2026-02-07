'use client';

import type { SemaforoLevel } from '@/modules/financeiro/dashboard.service';

interface SemaforoProps {
  level: SemaforoLevel;
  diasCobertura: number;
}

const config: Record<SemaforoLevel, { color: string; bg: string; ring: string; label: string; description: string }> = {
  VERDE: {
    color: 'bg-green-500',
    bg: 'bg-green-50',
    ring: 'ring-green-200',
    label: 'Saudavel',
    description: 'Seu caixa esta saudavel',
  },
  AMARELO: {
    color: 'bg-yellow-500',
    bg: 'bg-yellow-50',
    ring: 'ring-yellow-200',
    label: 'Atencao',
    description: 'Atencao com o caixa',
  },
  VERMELHO: {
    color: 'bg-red-500',
    bg: 'bg-red-50',
    ring: 'ring-red-200',
    label: 'Risco',
    description: 'Caixa em risco',
  },
};

export function Semaforo({ level, diasCobertura }: SemaforoProps) {
  const { color, bg, ring, label, description } = config[level];

  const coberturaText =
    diasCobertura === Infinity
      ? 'Sem despesas no periodo'
      : diasCobertura <= 0
        ? 'Saldo insuficiente'
        : `~${diasCobertura} dias de cobertura`;

  return (
    <div className={`flex items-center gap-4 rounded-lg p-4 ring-1 ${bg} ${ring}`}>
      <div className="relative flex-shrink-0">
        <div className={`h-12 w-12 rounded-full ${color} animate-pulse`} />
        <div className={`absolute inset-0 h-12 w-12 rounded-full ${color} opacity-30 blur-sm`} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{coberturaText}</p>
      </div>
    </div>
  );
}
