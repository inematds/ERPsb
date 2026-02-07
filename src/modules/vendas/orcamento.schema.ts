import { z } from 'zod';
import { vendaItemSchema } from './venda.schema';

export const createOrcamentoSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  items: z.array(vendaItemSchema).min(1, 'Adicione pelo menos 1 item'),
  discount: z.number().int().nonnegative().default(0),
  validUntil: z.string().min(1, 'Informe a data de validade'),
  notes: z.string().optional(),
});

export const updateOrcamentoSchema = z.object({
  clientId: z.string().min(1).optional(),
  items: z.array(vendaItemSchema).min(1).optional(),
  discount: z.number().int().nonnegative().optional(),
  validUntil: z.string().min(1).optional(),
  notes: z.string().optional(),
  status: z.enum(['PENDENTE', 'APROVADO', 'RECUSADO']).optional(),
});

export const listOrcamentosQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['PENDENTE', 'APROVADO', 'RECUSADO', 'CONVERTIDO', 'EXPIRADO']).optional(),
  clientId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateOrcamentoInput = z.infer<typeof createOrcamentoSchema>;
export type UpdateOrcamentoInput = z.infer<typeof updateOrcamentoSchema>;
export type ListOrcamentosQuery = z.infer<typeof listOrcamentosQuerySchema>;
