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

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const hoje = {
    gte: startOfDay(now),
    lte: endOfDay(now),
  };
  const semana = {
    gte: startOfWeek(now, { weekStartsOn: 1 }),
    lte: endOfWeek(now, { weekStartsOn: 1 }),
  };
  const mes = {
    gte: startOfMonth(now),
    lte: endOfMonth(now),
  };

  const [
    totalRecebido,
    totalPago,
    receitasHoje,
    despesasHoje,
    receitasSemana,
    despesasSemana,
    receitasMes,
    despesasMes,
    pendentePagar,
    pendenteReceber,
    upcomingPagar,
    upcomingReceber,
    chartData,
  ] = await Promise.all([
    // Saldo: total recebido historico
    prisma.contaReceber.aggregate({
      where: { status: 'RECEBIDO' },
      _sum: { amount: true },
    }),
    // Saldo: total pago historico
    prisma.contaPagar.aggregate({
      where: { status: 'PAGO' },
      _sum: { amount: true },
    }),
    // Receitas hoje
    prisma.contaReceber.aggregate({
      where: { status: 'RECEBIDO', receivedDate: hoje },
      _sum: { amount: true },
    }),
    // Despesas hoje
    prisma.contaPagar.aggregate({
      where: { status: 'PAGO', paidDate: hoje },
      _sum: { amount: true },
    }),
    // Receitas semana
    prisma.contaReceber.aggregate({
      where: { status: 'RECEBIDO', receivedDate: semana },
      _sum: { amount: true },
    }),
    // Despesas semana
    prisma.contaPagar.aggregate({
      where: { status: 'PAGO', paidDate: semana },
      _sum: { amount: true },
    }),
    // Receitas mes
    prisma.contaReceber.aggregate({
      where: { status: 'RECEBIDO', receivedDate: mes },
      _sum: { amount: true },
    }),
    // Despesas mes
    prisma.contaPagar.aggregate({
      where: { status: 'PAGO', paidDate: mes },
      _sum: { amount: true },
    }),
    // Total pendente a pagar
    prisma.contaPagar.aggregate({
      where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
      _sum: { amount: true },
    }),
    // Total pendente a receber
    prisma.contaReceber.aggregate({
      where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
      _sum: { amount: true },
    }),
    // Top 5 proximas a pagar
    prisma.contaPagar.findMany({
      where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { supplier: { select: { name: true } } },
    }),
    // Top 5 proximas a receber
    prisma.contaReceber.findMany({
      where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    // Chart data
    getCashFlowChart(30),
  ]);

  const saldo = (totalRecebido._sum.amount ?? 0) - (totalPago._sum.amount ?? 0);
  const despesasMesValue = despesasMes._sum.amount ?? 0;
  const semaforo = getSemaforoStatus(saldo, despesasMesValue);

  return {
    saldo,
    semaforo,
    receitasHoje: receitasHoje._sum.amount ?? 0,
    despesasHoje: despesasHoje._sum.amount ?? 0,
    receitasSemana: receitasSemana._sum.amount ?? 0,
    despesasSemana: despesasSemana._sum.amount ?? 0,
    receitasMes: receitasMes._sum.amount ?? 0,
    despesasMes: despesasMesValue,
    pendentes: {
      totalPagar: pendentePagar._sum.amount ?? 0,
      totalReceber: pendenteReceber._sum.amount ?? 0,
    },
    upcoming: {
      contasPagar: upcomingPagar.map((c) => ({
        id: c.id,
        description: c.description,
        amount: c.amount,
        dueDate: c.dueDate,
        status: c.status,
        entityName: c.supplier?.name ?? null,
      })),
      contasReceber: upcomingReceber.map((c) => ({
        id: c.id,
        description: c.description,
        amount: c.amount,
        dueDate: c.dueDate,
        status: c.status,
        entityName: c.client?.name ?? null,
      })),
    },
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
    totalPagar: totalPagar._sum.amount ?? 0,
    totalReceber: totalReceber._sum.amount ?? 0,
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
