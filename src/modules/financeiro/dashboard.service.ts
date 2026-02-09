import { prisma } from '@/lib/prisma';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  getDaysInMonth,
  format,
} from 'date-fns';

/** Convert BigInt/null from Prisma aggregate to number */
function toNum(val: bigint | number | null | undefined): number {
  if (val == null) return 0;
  return Number(val);
}

export type SemaforoLevel = 'VERDE' | 'AMARELO' | 'VERMELHO';

export interface SemaforoStatus {
  level: SemaforoLevel;
  diasCobertura: number;
  despesaMediaDiaria: number;
}

export interface DashboardData {
  saldo: number;
  semaforo: SemaforoStatus;
  receitasHoje: number;
  despesasHoje: number;
  receitasSemana: number;
  despesasSemana: number;
  receitasMes: number;
  despesasMes: number;
  pendentes: {
    totalPagar: number;
    totalReceber: number;
  };
  upcoming: {
    contasPagar: UpcomingConta[];
    contasReceber: UpcomingConta[];
  };
  chartData: ChartDataPoint[];
}

export interface UpcomingConta {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: string;
  entityName: string | null;
}

export interface ChartDataPoint {
  date: string;
  receitas: number;
  despesas: number;
}

export interface DashboardSaldoData {
  saldo: number;
  semaforo: SemaforoStatus;
}

export interface DashboardResumoData {
  receitasHoje: number;
  despesasHoje: number;
  receitasSemana: number;
  despesasSemana: number;
  receitasMes: number;
  despesasMes: number;
}

export interface DashboardPendentesData {
  pendentes: { totalPagar: number; totalReceber: number };
  upcoming: { contasPagar: UpcomingConta[]; contasReceber: UpcomingConta[] };
}

/** Saldo + semaforo (2 queries - fastest) */
export async function getDashboardSaldo(): Promise<DashboardSaldoData> {
  const now = new Date();
  const mes = { gte: startOfMonth(now), lte: endOfMonth(now) };

  const [totalRecebido, totalPago, despesasMes] = await Promise.all([
    prisma.contaReceber.aggregate({ where: { status: 'RECEBIDO' }, _sum: { amount: true } }),
    prisma.contaPagar.aggregate({ where: { status: 'PAGO' }, _sum: { amount: true } }),
    prisma.contaPagar.aggregate({ where: { status: 'PAGO', paidDate: mes }, _sum: { amount: true } }),
  ]);

  const saldo = toNum(totalRecebido._sum.amount) - toNum(totalPago._sum.amount);
  const semaforo = getSemaforoStatus(saldo, toNum(despesasMes._sum.amount));

  return { saldo, semaforo };
}

/** Resumo hoje/semana/mes (6 queries) */
export async function getDashboardResumo(): Promise<DashboardResumoData> {
  const now = new Date();
  const hoje = { gte: startOfDay(now), lte: endOfDay(now) };
  const semana = { gte: startOfWeek(now, { weekStartsOn: 1 }), lte: endOfWeek(now, { weekStartsOn: 1 }) };
  const mes = { gte: startOfMonth(now), lte: endOfMonth(now) };

  const [receitasHoje, despesasHoje, receitasSemana, despesasSemana, receitasMes, despesasMes] =
    await Promise.all([
      prisma.contaReceber.aggregate({ where: { status: 'RECEBIDO', receivedDate: hoje }, _sum: { amount: true } }),
      prisma.contaPagar.aggregate({ where: { status: 'PAGO', paidDate: hoje }, _sum: { amount: true } }),
      prisma.contaReceber.aggregate({ where: { status: 'RECEBIDO', receivedDate: semana }, _sum: { amount: true } }),
      prisma.contaPagar.aggregate({ where: { status: 'PAGO', paidDate: semana }, _sum: { amount: true } }),
      prisma.contaReceber.aggregate({ where: { status: 'RECEBIDO', receivedDate: mes }, _sum: { amount: true } }),
      prisma.contaPagar.aggregate({ where: { status: 'PAGO', paidDate: mes }, _sum: { amount: true } }),
    ]);

  return {
    receitasHoje: toNum(receitasHoje._sum.amount),
    despesasHoje: toNum(despesasHoje._sum.amount),
    receitasSemana: toNum(receitasSemana._sum.amount),
    despesasSemana: toNum(despesasSemana._sum.amount),
    receitasMes: toNum(receitasMes._sum.amount),
    despesasMes: toNum(despesasMes._sum.amount),
  };
}

/** Pendentes + upcoming (4 queries) */
export async function getDashboardPendentes(): Promise<DashboardPendentesData> {
  const [pendentePagar, pendenteReceber, upcomingPagar, upcomingReceber] = await Promise.all([
    prisma.contaPagar.aggregate({ where: { status: { in: ['PENDENTE', 'VENCIDO'] } }, _sum: { amount: true } }),
    prisma.contaReceber.aggregate({ where: { status: { in: ['PENDENTE', 'VENCIDO'] } }, _sum: { amount: true } }),
    prisma.contaPagar.findMany({
      where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { supplier: { select: { name: true } } },
    }),
    prisma.contaReceber.findMany({
      where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
  ]);

  return {
    pendentes: {
      totalPagar: toNum(pendentePagar._sum.amount),
      totalReceber: toNum(pendenteReceber._sum.amount),
    },
    upcoming: {
      contasPagar: upcomingPagar.map((c) => ({
        id: c.id, description: c.description, amount: c.amount,
        dueDate: c.dueDate, status: c.status, entityName: c.supplier?.name ?? null,
      })),
      contasReceber: upcomingReceber.map((c) => ({
        id: c.id, description: c.description, amount: c.amount,
        dueDate: c.dueDate, status: c.status, entityName: c.client?.name ?? null,
      })),
    },
  };
}

/** Full dashboard data (legacy - used by old endpoint) */
export async function getDashboardData(): Promise<DashboardData> {
  const [saldoData, resumoData, pendentesData, chartData] = await Promise.all([
    getDashboardSaldo(),
    getDashboardResumo(),
    getDashboardPendentes(),
    getCashFlowChart(30),
  ]);

  return {
    ...saldoData,
    ...resumoData,
    ...pendentesData,
    chartData,
  };
}

export function getSemaforoStatus(saldo: number, despesasMes: number): SemaforoStatus {
  // Se nao houver despesas no mes, considerar VERDE
  if (despesasMes === 0) {
    return {
      level: 'VERDE',
      diasCobertura: saldo <= 0 ? 0 : 999,
      despesaMediaDiaria: 0,
    };
  }

  const diasNoMes = getDaysInMonth(new Date());
  const despesaMediaDiaria = despesasMes / diasNoMes;
  const diasCobertura = saldo / despesaMediaDiaria;

  let level: SemaforoLevel;
  if (saldo < 0 || diasCobertura < 7) {
    level = 'VERMELHO';
  } else if (diasCobertura < 30) {
    level = 'AMARELO';
  } else {
    level = 'VERDE';
  }

  return {
    level,
    diasCobertura: Math.floor(diasCobertura),
    despesaMediaDiaria,
  };
}

export async function getUpcomingContas() {
  const [contasPagar, contasReceber] = await Promise.all([
    prisma.contaPagar.findMany({
      where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { supplier: { select: { name: true } } },
    }),
    prisma.contaReceber.findMany({
      where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
  ]);

  return {
    contasPagar: contasPagar.map((c) => ({
      id: c.id,
      description: c.description,
      amount: c.amount,
      dueDate: c.dueDate,
      status: c.status,
      entityName: c.supplier?.name ?? null,
    })),
    contasReceber: contasReceber.map((c) => ({
      id: c.id,
      description: c.description,
      amount: c.amount,
      dueDate: c.dueDate,
      status: c.status,
      entityName: c.client?.name ?? null,
    })),
  };
}

export async function getPendingTotals() {
  const [totalPagar, totalReceber] = await Promise.all([
    prisma.contaPagar.aggregate({
      where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
      _sum: { amount: true },
    }),
    prisma.contaReceber.aggregate({
      where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalPagar: toNum(totalPagar._sum.amount),
    totalReceber: toNum(totalReceber._sum.amount),
  };
}

export async function getCashFlowChart(days: number): Promise<ChartDataPoint[]> {
  const now = new Date();
  const startDate = startOfDay(subDays(now, days - 1));

  const [receitas, despesas] = await Promise.all([
    prisma.contaReceber.findMany({
      where: {
        status: 'RECEBIDO',
        receivedDate: { gte: startDate, lte: endOfDay(now) },
      },
      select: { amount: true, receivedDate: true },
    }),
    prisma.contaPagar.findMany({
      where: {
        status: 'PAGO',
        paidDate: { gte: startDate, lte: endOfDay(now) },
      },
      select: { amount: true, paidDate: true },
    }),
  ]);

  // Build day-by-day map
  const dayMap = new Map<string, ChartDataPoint>();
  for (let i = 0; i < days; i++) {
    const day = subDays(now, days - 1 - i);
    const key = format(day, 'yyyy-MM-dd');
    dayMap.set(key, { date: key, receitas: 0, despesas: 0 });
  }

  for (const r of receitas) {
    if (r.receivedDate) {
      const key = format(r.receivedDate, 'yyyy-MM-dd');
      const entry = dayMap.get(key);
      if (entry) entry.receitas += r.amount;
    }
  }

  for (const d of despesas) {
    if (d.paidDate) {
      const key = format(d.paidDate, 'yyyy-MM-dd');
      const entry = dayMap.get(key);
      if (entry) entry.despesas += d.amount;
    }
  }

  return Array.from(dayMap.values());
}
