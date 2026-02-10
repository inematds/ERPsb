'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Semaforo } from '@/components/dashboard/semaforo';
import { CashFlowChart } from '@/components/dashboard/cash-flow-chart';
import { AlertCards } from '@/components/dashboard/alert-cards';
import { WithdrawalCard } from '@/components/dashboard/withdrawal-card';
import { MonthlySummary } from '@/components/dashboard/monthly-summary';
import { formatCurrency } from '@/lib/formatters';
import { PageHelp } from '@/components/shared/page-help';
import type {
  DashboardSaldoData,
  DashboardResumoData,
  DashboardPendentesData,
  ChartDataPoint,
} from '@/modules/financeiro/dashboard.service';
import type { AlertasData } from '@/modules/financeiro/alerta.service';

const SWR_OPTS = { dedupingInterval: 30_000, revalidateOnFocus: false };

export default function DashboardPage() {
  const { data: saldo } = useSWR<DashboardSaldoData>('/api/v1/dashboard/saldo', SWR_OPTS);
  const { data: resumo } = useSWR<DashboardResumoData>('/api/v1/dashboard/resumo', SWR_OPTS);
  const { data: pendentes } = useSWR<DashboardPendentesData>('/api/v1/dashboard/pendentes', SWR_OPTS);
  const { data: chartData } = useSWR<ChartDataPoint[]>('/api/v1/dashboard/chart', { dedupingInterval: 60_000, revalidateOnFocus: false });
  const { data: alertasData } = useSWR<AlertasData>('/api/v1/alertas', SWR_OPTS);

  return (
    <div className="space-y-6">
      {/* Header com versao */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <PageHelp
            title="Dashboard"
            description="Visao geral da saude financeira do seu negocio. O semaforo indica se suas financas estao no verde, amarelo ou vermelho."
            helpHref="/ajuda/dashboard"
          />
        </div>
        <span className="text-xs text-muted-foreground">ERPsb v1.3.0</span>
      </div>

      {/* Alertas proativos */}
      {alertasData && alertasData.alertas.length > 0 && (
        <AlertCards alertas={alertasData.alertas} />
      )}

      {/* Semaforo + Saldo — carrega primeiro */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {saldo ? (
          <>
            <Semaforo level={saldo.semaforo.level} diasCobertura={saldo.semaforo.diasCobertura} />
            <Card>
              <CardContent className="flex flex-col justify-center py-4">
                <p className="text-sm text-muted-foreground">Saldo atual</p>
                <p className={`text-2xl font-bold ${saldo.saldo < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(saldo.saldo)}
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card><CardContent className="py-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            <Card><CardContent className="py-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          </>
        )}
      </div>

      {/* Quanto posso retirar + Resumo mensal */}
      {alertasData && saldo && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <WithdrawalCard amount={alertasData.quantoPossoRetirar} saldo={saldo.saldo} />
          <MonthlySummary
            receitas={alertasData.resumoMensal.receitas}
            despesas={alertasData.resumoMensal.despesas}
          />
        </div>
      )}

      {/* Resumo: Hoje / Semana / Mes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {resumo ? (
          <>
            <SummaryCard title="Hoje" receitas={resumo.receitasHoje} despesas={resumo.despesasHoje} />
            <SummaryCard title="Semana" receitas={resumo.receitasSemana} despesas={resumo.despesasSemana} />
            <SummaryCard title="Mes" receitas={resumo.receitasMes} despesas={resumo.despesasMes} />
          </>
        ) : (
          <>
            <Card><CardContent className="py-4 space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-24" /></CardContent></Card>
            <Card><CardContent className="py-4 space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-24" /></CardContent></Card>
            <Card><CardContent className="py-4 space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-24" /></CardContent></Card>
          </>
        )}
      </div>

      {/* Totais pendentes */}
      <div className="grid grid-cols-2 gap-4">
        {pendentes ? (
          <>
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">A pagar</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(pendentes.pendentes.totalPagar)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">A receber</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(pendentes.pendentes.totalReceber)}
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card><CardContent className="py-4"><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-6 w-28" /></CardContent></Card>
            <Card><CardContent className="py-4"><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-6 w-28" /></CardContent></Card>
          </>
        )}
      </div>

      {/* Grafico — carrega por ultimo */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa - Ultimos 30 dias</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData ? (
            <CashFlowChart data={chartData} />
          ) : (
            <Skeleton className="h-48 w-full" />
          )}
        </CardContent>
      </Card>

      {/* Proximas contas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {pendentes ? (
          <>
            <UpcomingSection
              title="Proximas Contas a Pagar"
              contas={pendentes.upcoming.contasPagar}
              href="/financeiro/contas-pagar"
              variant="pagar"
            />
            <UpcomingSection
              title="Proximos Recebimentos"
              contas={pendentes.upcoming.contasReceber}
              href="/financeiro/contas-receber"
              variant="receber"
            />
          </>
        ) : (
          <>
            <Card><CardHeader><Skeleton className="h-5 w-40" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-40" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
          </>
        )}
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
