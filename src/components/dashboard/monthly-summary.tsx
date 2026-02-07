'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';

interface MonthlySummaryProps {
  receitas: number;
  despesas: number;
}

export function MonthlySummary({ receitas, despesas }: MonthlySummaryProps) {
  const diferenca = receitas - despesas;
  const positivo = diferenca >= 0;

  return (
    <Card>
      <CardContent className="py-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          Esse mes voce recebeu{' '}
          <span className="font-semibold text-green-600">{formatCurrency(receitas)}</span>
          {' '}e gastou{' '}
          <span className="font-semibold text-red-600">{formatCurrency(despesas)}</span>
        </p>
        <div className="flex items-center gap-2">
          {positivo ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-sm font-semibold ${positivo ? 'text-green-600' : 'text-red-600'}`}>
            Resultado: {positivo ? '+' : ''}{formatCurrency(diferenca)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {positivo
            ? 'Otimo! Voce esta no positivo.'
            : 'Atencao: suas despesas estao maiores que receitas.'}
        </p>
      </CardContent>
    </Card>
  );
}
