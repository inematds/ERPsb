'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { TrendingUp, TrendingDown, ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Semaforo } from '@/components/dashboard/semaforo';
import { CashFlowChart } from '@/components/dashboard/cash-flow-chart';
import { AlertCards } from '@/components/dashboard/alert-cards';
import { WithdrawalCard } from '@/components/dashboard/withdrawal-card';
import { MonthlySummary } from '@/components/dashboard/monthly-summary';
import { DashboardSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCurrency } from '@/lib/formatters';
import type { DashboardData } from '@/modules/financeiro/dashboard.service';
import type { AlertasData } from '@/modules/financeiro/alerta.service';

export default function DashboardPage() {
  const { data, isLoading: loadingDash } = useSWR<DashboardData>(
    '/api/v1/dashboard',
    { dedupingInterval: 30_000, revalidateOnFocus: false },
  );
  const { data: alertasData } = useSWR<AlertasData>(
    '/api/v1/alertas',
    { dedupingInterval: 30_000, revalidateOnFocus: false },
  );

  if (loadingDash) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <EmptyState
          icon={AlertCircle}
          title="Erro ao carregar dados"
          description="Nao foi possivel carregar o dashboard. Tente recarregar a pagina."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Alertas proativos */}
      {alertasData && alertasData.alertas.length > 0 && (
        <AlertCards alertas={alertasData.alertas} />
      )}

      {/* Semaforo + Saldo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Semaforo level={data.semaforo.level} diasCobertura={data.semaforo.diasCobertura} />
        <Card>
          <CardContent className="flex flex-col justify-center py-4">
            <p className="text-sm text-muted-foreground">Saldo atual</p>
            <p className={`text-2xl font-bold ${data.saldo < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(data.saldo)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quanto posso retirar + Resumo mensal */}
      {alertasData && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <WithdrawalCard amount={alertasData.quantoPossoRetirar} saldo={data.saldo} />
          <MonthlySummary
            receitas={alertasData.resumoMensal.receitas}
            despesas={alertasData.resumoMensal.despesas}
          />
        </div>
      )}

      {/* Resumo: Hoje / Semana / Mes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Hoje"
          receitas={data.receitasHoje}
          despesas={data.despesasHoje}
        />
        <SummaryCard
          title="Semana"
          receitas={data.receitasSemana}
          despesas={data.despesasSemana}
        />
        <SummaryCard
          title="Mes"
          receitas={data.receitasMes}
          despesas={data.despesasMes}
        />
      </div>

      {/* Totais pendentes */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">A pagar</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(data.pendentes.totalPagar)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">A receber</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(data.pendentes.totalReceber)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafico */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa - Ultimos 30 dias</CardTitle>
        </CardHeader>
        <CardContent>
          <CashFlowChart data={data.chartData} />
        </CardContent>
      </Card>

      {/* Proximas contas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UpcomingSection
          title="Proximas Contas a Pagar"
          contas={data.upcoming.contasPagar}
          href="/financeiro/contas-pagar"
          variant="pagar"
        />
        <UpcomingSection
          title="Proximos Recebimentos"
          contas={data.upcoming.contasReceber}
          href="/financeiro/contas-receber"
          variant="receber"
        />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  receitas,
  despesas,
}: {
  title: string;
  receitas: number;
  despesas: number;
}) {
  return (
    <Card>
      <CardContent className="py-4 space-y-2">
        <p className="text-sm font-medium">{title}</p>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600">{formatCurrency(receitas)}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-600">{formatCurrency(despesas)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface UpcomingConta {
  id: string;
  description: string;
  amount: number;
  dueDate: string | Date;
  status: string;
  entityName: string | null;
}

function UpcomingSection({
  title,
  contas,
  href,
  variant,
}: {
  title: string;
  contas: UpcomingConta[];
  href: string;
  variant: 'pagar' | 'receber';
}) {
  const isOverdue = (status: string) => status === 'VENCIDO';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {contas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma conta pendente</p>
        ) : (
          contas.map((conta) => {
            const dueDate = new Date(conta.dueDate);
            const dateStr = dueDate.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            });

            return (
              <div key={conta.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{conta.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {conta.entityName ? `${conta.entityName} · ` : ''}
                    {dateStr}
                    {isOverdue(conta.status) && (
                      <Badge variant="destructive" className="ml-1 text-[10px] px-1 py-0">
                        Vencida
                      </Badge>
                    )}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap ${
                    variant === 'pagar' ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {formatCurrency(conta.amount)}
                </span>
              </div>
            );
          })
        )}
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-primary hover:underline pt-1"
        >
          Ver todas <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
