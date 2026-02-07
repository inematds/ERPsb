import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/integrations/whatsapp/whatsapp.client';
import { renderTemplate, WHATSAPP_TEMPLATES } from '@/integrations/whatsapp/templates';
import { formatCurrency } from '@/lib/formatters';
import type { ListMessagesQuery } from './whatsapp.schema';

export async function sendWhatsApp(
  tenantId: string,
  phone: string,
  templateId: string,
  templateVars: Record<string, string>,
  clientId?: string,
) {
  const template = WHATSAPP_TEMPLATES[templateId];
  if (!template) throw new Error(`Template "${templateId}" nao encontrado`);

  const messageText = renderTemplate(templateId, templateVars);

  const message = await prisma.whatsAppMessage.create({
    data: {
      tenantId,
      clientId: clientId ?? null,
      phone,
      type: template.type,
      templateId,
      templateVars: templateVars as Record<string, unknown>,
      messageText,
      status: 'QUEUED',
    },
  });

  const result = await sendWhatsAppMessage(phone, messageText);

  if (result.success) {
    return prisma.whatsAppMessage.update({
      where: { id: message.id },
      data: {
        status: 'SENT',
        externalId: result.externalId,
        sentAt: new Date(),
      },
    });
  } else {
    return prisma.whatsAppMessage.update({
      where: { id: message.id },
      data: {
        status: 'FAILED',
        errorMessage: result.error,
      },
    });
  }
}

export async function sendCobrancaPix(
  tenantId: string,
  clientId: string,
  clientName: string,
  phone: string,
  valor: number,
  pixLink: string,
) {
  return sendWhatsApp(tenantId, phone, 'cobranca_pix', {
    nome: clientName,
    valor: formatCurrency(valor),
    link_pix: pixLink,
  }, clientId);
}

export async function sendNFeEmitida(
  tenantId: string,
  clientId: string,
  clientName: string,
  phone: string,
  nfeNumero: string,
  pdfUrl: string,
) {
  return sendWhatsApp(tenantId, phone, 'nfe_emitida', {
    nome: clientName,
    numero: nfeNumero,
    link_pdf: pdfUrl,
  }, clientId);
}

export async function sendLembreteVencimento(
  tenantId: string,
  clientId: string,
  clientName: string,
  phone: string,
  valor: number,
  dataVenc: string,
  pixLink?: string,
) {
  return sendWhatsApp(tenantId, phone, 'lembrete_vencimento', {
    nome: clientName,
    valor: formatCurrency(valor),
    data: dataVenc,
    link_pix: pixLink ?? '',
  }, clientId);
}

export async function sendOrcamento(
  tenantId: string,
  clientId: string,
  clientName: string,
  phone: string,
  valor: number,
  link: string,
) {
  return sendWhatsApp(tenantId, phone, 'orcamento', {
    nome: clientName,
    valor: formatCurrency(valor),
    link,
  }, clientId);
}

export async function listMessages(tenantId: string, query: ListMessagesQuery) {
  const where: Record<string, unknown> = { tenantId };
  if (query.type) where.type = query.type;
  if (query.status) where.status = query.status;

  const [data, total] = await Promise.all([
    prisma.whatsAppMessage.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.whatsAppMessage.count({ where }),
  ]);

  return { data, total, page: query.page, pageSize: query.pageSize };
}

export async function updateMessageStatus(
  externalId: string,
  status: string,
  deliveredAt?: Date,
  readAt?: Date,
) {
  const message = await prisma.whatsAppMessage.findFirst({
    where: { externalId },
  });
  if (!message) return null;

  const updateData: Record<string, unknown> = { status };
  if (deliveredAt) updateData.deliveredAt = deliveredAt;
  if (readAt) updateData.readAt = readAt;

  return prisma.whatsAppMessage.update({
    where: { id: message.id },
    data: updateData,
  });
}
