import { prisma } from '@/lib/prisma';
import { sendLembreteVencimento } from './whatsapp.service';

import type { UpdateLembreteConfigInput } from './lembrete.schema';

export async function getLembreteConfig(tenantId: string) {
  const config = await prisma.lembreteConfig.findUnique({ where: { tenantId } });
  return config ?? { ativo: false, diasAntes: 3, noDia: true, diasDepois: 1 };
}

export async function upsertLembreteConfig(tenantId: string, data: UpdateLembreteConfigInput) {
  return prisma.lembreteConfig.upsert({
    where: { tenantId },
    update: data,
    create: { tenantId, ...data },
  });
}

export async function processLembretes(tenantId: string) {
  const config = await prisma.lembreteConfig.findUnique({ where: { tenantId } });
  if (!config || !config.ativo) return { sent: 0, skipped: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const dates: Date[] = [];

  // Dias antes do vencimento
  if (config.diasAntes > 0) {
    const beforeDate = new Date(today);
    beforeDate.setDate(beforeDate.getDate() + config.diasAntes);
    dates.push(beforeDate);
  }

  // No dia do vencimento
  if (config.noDia) {
    dates.push(today);
  }

  // Dias depois do vencimento
  if (config.diasDepois > 0) {
    const afterDate = new Date(today);
    afterDate.setDate(afterDate.getDate() - config.diasDepois);
    dates.push(afterDate);
  }

  if (dates.length === 0) return { sent: 0, skipped: 0 };

  // Find contas a receber PENDENTE with dueDate matching any of our target dates
  const contasReceber = await prisma.contaReceber.findMany({
    where: {
      tenantId,
      status: 'PENDENTE',
      dueDate: {
        gte: new Date(Math.min(...dates.map(d => d.getTime()))),
        lte: new Date(Math.max(...dates.map(d => {
          const end = new Date(d);
          end.setHours(23, 59, 59, 999);
          return end.getTime();
        }))),
      },
      clientId: { not: null },
    },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      pixCharges: {
        where: { status: 'PENDING' },
        select: { paymentLink: true },
        take: 1,
      },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const conta of contasReceber) {
    if (!conta.client?.phone) {
      skipped++;
      continue;
    }

    // Check deduplication: don't resend if already sent today for this conta
    const alreadySent = await prisma.whatsAppMessage.findFirst({
      where: {
        tenantId,
        clientId: conta.clientId,
        type: 'lembrete',
        createdAt: { gte: today, lte: todayEnd },
        templateVars: {
          path: ['conta_id'],
          equals: conta.id,
        },
      },
    });

    if (alreadySent) {
      skipped++;
      continue;
    }

    const dataVenc = new Date(conta.dueDate).toLocaleDateString('pt-BR');
    const pixLink = conta.pixCharges?.[0]?.paymentLink ?? '';

    try {
      await sendLembreteVencimento(
        tenantId,
        conta.client.id,
        conta.client.name,
        conta.client.phone,
        conta.amount,
        dataVenc,
        pixLink || undefined,
      );
      sent++;
    } catch {
      skipped++;
    }
  }

  return { sent, skipped };
}
