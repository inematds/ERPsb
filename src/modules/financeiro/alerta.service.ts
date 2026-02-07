import { prisma } from '@/lib/prisma';
import {
  startOfDay,
  endOfDay,
  addDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  type: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  amount?: number;
}

export interface AlertasData {
  alertas: Alert[];
  quantoPossoRetirar: number;
  resumoMensal: {
    receitas: number;
    despesas: number;
  };
}

export async function getAlertasData(): Promise<AlertasData> {
  const [alertas, quantoPossoRetirar, resumoMensal] = await Promise.all([
    getAlertas(),
    calcularQuantoPossoRetirar(),
    getResumoMensal(),
  ]);

  return { alertas, quantoPossoRetirar, resumoMensal };
}

export async function getAlertas(): Promise<Alert[]> {
  const now = new Date();
  const hoje = startOfDay(now);
  const em7dias = endOfDay(addDays(now, 7));

  const [contasVencidas, contasProximas7d, saldoData] = await Promise.all([
    // Contas vencidas (PENDENTE com dueDate < hoje)
    prisma.contaPagar.aggregate({
      where: {
        status: 'PENDENTE',
        dueDate: { lt: hoje },
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
    // Contas proximos 7 dias
    prisma.contaPagar.aggregate({
      where: {
        status: { in: ['PENDENTE', 'VENCIDO'] },
        dueDate: { gte: hoje, lte: em7dias },
      },
      _sum: { amount: true },
    }),
    // Saldo atual para comparacao
    Promise.all([
      prisma.contaReceber.aggregate({
        where: { status: 'RECEBIDO' },
        _sum: { amount: true },
      }),
      prisma.contaPagar.aggregate({
        where: { status: 'PAGO' },
        _sum: { amount: true },
      }),
    ]),
  ]);

  const saldo = (saldoData[0]._sum.amount ?? 0) - (saldoData[1]._sum.amount ?? 0);
  const alertas: Alert[] = [];

  // Alerta 1: Contas vencidas
  const qtdVencidas = contasVencidas._count.id ?? 0;
  const totalVencidas = contasVencidas._sum.amount ?? 0;
  if (qtdVencidas > 0) {
    alertas.push({
      type: 'contas_vencidas',
      severity: 'critical',
      title: `${qtdVencidas} conta${qtdVencidas > 1 ? 's' : ''} vencida${qtdVencidas > 1 ? 's' : ''}`,
      message: `Voce tem contas vencidas que precisam de atencao.`,
      amount: totalVencidas,
    });
  }

  // Alerta 2: Contas proximos 7 dias vs saldo (so se > 50% do saldo)
  const totalProximas7d = contasProximas7d._sum.amount ?? 0;
  if (totalProximas7d > 0 && saldo > 0 && totalProximas7d > saldo * 0.5) {
    alertas.push({
      type: 'contas_proximos_7_dias',
      severity: 'warning',
      title: 'Contas vencem em breve',
      message: `Nos proximos 7 dias voce tem contas que representam mais da metade do seu saldo.`,
      amount: totalProximas7d,
    });
  }

  // Alerta 3: Caixa apertado 30 dias
  const em30dias = endOfDay(addDays(now, 30));
  const [despesasPrevistas30d, receitasPrevistas30d] = await Promise.all([
    prisma.contaPagar.aggregate({
      where: {
        status: { in: ['PENDENTE', 'VENCIDO'] },
        dueDate: { gte: hoje, lte: em30dias },
      },
      _sum: { amount: true },
    }),
    prisma.contaReceber.aggregate({
      where: {
        status: { in: ['PENDENTE', 'VENCIDO'] },
        dueDate: { gte: hoje, lte: em30dias },
      },
      _sum: { amount: true },
    }),
  ]);

  const despPrev = despesasPrevistas30d._sum.amount ?? 0;
  const recPrev = receitasPrevistas30d._sum.amount ?? 0;
  if (despPrev > recPrev && despPrev > 0) {
    alertas.push({
      type: 'caixa_apertado_30_dias',
      severity: 'warning',
      title: 'Caixa apertado nos proximos 30 dias',
      message: 'Suas despesas previstas superam suas receitas para o proximo mes.',
    });
  }

  return alertas;
}

export async function calcularQuantoPossoRetirar(): Promise<number> {
  const now = new Date();
  const hoje = startOfDay(now);
  const em30dias = endOfDay(addDays(now, 30));

  const [saldoRecebido, saldoPago, contasPagar30d, receitaMedia] = await Promise.all([
    // Saldo: total recebido
    prisma.contaReceber.aggregate({
      where: { status: 'RECEBIDO' },
      _sum: { amount: true },
    }),
    // Saldo: total pago
    prisma.contaPagar.aggregate({
      where: { status: 'PAGO' },
      _sum: { amount: true },
    }),
    // Contas a pagar nos proximos 30 dias
    prisma.contaPagar.aggregate({
      where: {
        status: { in: ['PENDENTE', 'VENCIDO'] },
        dueDate: { gte: hoje, lte: em30dias },
      },
      _sum: { amount: true },
    }),
    // Receita media mensal (ultimos 3 meses)
    getReceitaMediaMensal(),
  ]);

  const saldoAtual = (saldoRecebido._sum.amount ?? 0) - (saldoPago._sum.amount ?? 0);
  const pendente30d = contasPagar30d._sum.amount ?? 0;
  const reservaSeguranca = Math.round(receitaMedia * 0.10);

  const retiravel = saldoAtual - pendente30d - reservaSeguranca;
  return Math.max(retiravel, 0);
}

async function getReceitaMediaMensal(): Promise<number> {
  const now = new Date();
  const meses: number[] = [];

  for (let i = 1; i <= 3; i++) {
    const mesRef = subMonths(now, i);
    const inicio = startOfMonth(mesRef);
    const fim = endOfMonth(mesRef);

    const result = await prisma.contaReceber.aggregate({
      where: {
        status: 'RECEBIDO',
        receivedDate: { gte: inicio, lte: fim },
      },
      _sum: { amount: true },
    });

    meses.push(result._sum.amount ?? 0);
  }

  const total = meses.reduce((sum, v) => sum + v, 0);
  const mesesComDados = meses.filter((v) => v > 0).length;

  if (mesesComDados === 0) return 0;
  return Math.round(total / mesesComDados);
}

export async function getResumoMensal(): Promise<{ receitas: number; despesas: number }> {
  const now = new Date();
  const inicio = startOfMonth(now);
  const fim = endOfMonth(now);

  const [receitas, despesas] = await Promise.all([
    prisma.contaReceber.aggregate({
      where: {
        status: 'RECEBIDO',
        receivedDate: { gte: inicio, lte: fim },
      },
      _sum: { amount: true },
    }),
    prisma.contaPagar.aggregate({
      where: {
        status: 'PAGO',
        paidDate: { gte: inicio, lte: fim },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    receitas: receitas._sum.amount ?? 0,
    despesas: despesas._sum.amount ?? 0,
  };
}
