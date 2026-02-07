'use client';

import { Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';

interface WithdrawalCardProps {
  amount: number;
  saldo: number;
}

export function WithdrawalCard({ amount, saldo }: WithdrawalCardProps) {
  const isZero = amount === 0;
  const isLow = !isZero && saldo > 0 && amount < saldo * 0.1;

  const bg = isZero ? 'bg-red-50' : isLow ? 'bg-yellow-50' : 'bg-green-50';
  const ring = isZero ? 'ring-red-200' : isLow ? 'ring-yellow-200' : 'ring-green-200';
  const iconColor = isZero ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-green-600';
  const valueColor = isZero ? 'text-red-700' : isLow ? 'text-yellow-700' : 'text-green-700';

  return (
    <Card className={`${bg} ring-1 ${ring} border-0`}>
      <CardContent className="flex items-center gap-4 py-4">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Wallet className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          {isZero ? (
            <>
              <p className="text-sm font-semibold text-red-800">
                Retirada nao recomendada
              </p>
              <p className="text-sm text-red-700 opacity-80">
                No momento, seu caixa esta comprometido com despesas previstas.
              </p>
            </>
          ) : (
            <>
              <p className={`text-sm font-semibold ${valueColor}`}>
                Voce pode retirar ate {formatCurrency(amount)}
              </p>
              <p className={`text-sm ${valueColor} opacity-80`}>
                Depois disso, seu caixa fica apertado para os proximos 30 dias.
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
