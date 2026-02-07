import { z } from 'zod';

export const sendWhatsAppSchema = z.object({
  phone: z.string().min(10, 'Telefone obrigatorio'),
  clientId: z.string().optional(),
  templateId: z.string().min(1, 'Template obrigatorio'),
  templateVars: z.record(z.string()).default({}),
});

export type SendWhatsAppInput = z.infer<typeof sendWhatsAppSchema>;

export const listMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['cobranca', 'nfe', 'lembrete', 'orcamento']).optional(),
  status: z.enum(['QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED']).optional(),
});

export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
