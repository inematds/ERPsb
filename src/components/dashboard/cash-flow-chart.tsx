'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint } from '@/modules/financeiro/dashboard.service';
import { formatCurrency } from '@/lib/formatters';

interface CashFlowChartProps {
  data: ChartDataPoint[];
}

function formatDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${day}/${month}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground mb-1">
        {label ? formatDateLabel(label) : ''}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
          {entry.dataKey === 'receitas' ? 'Receitas' : 'Despesas'}:{' '}
          {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

function formatYAxis(value: number): string {
  if (value >= 100000) return `${(value / 100000).toFixed(0)}k`;
  if (value >= 10000) return `${(value / 100).toFixed(0)}`;
  return `${(value / 100).toFixed(0)}`;
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <div className="h-[250px] w-full sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillReceitas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillDespesas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11 }}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="receitas"
            stroke="#22c55e"
            fill="url(#fillReceitas)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="despesas"
            stroke="#ef4444"
            fill="url(#fillDespesas)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
