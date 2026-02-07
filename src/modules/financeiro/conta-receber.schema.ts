import { z } from 'zod';

export const contaReceberCategories = ['VENDAS', 'SERVICOS', 'OUTROS'] as const;

export const contaReceberStatuses = ['PENDENTE', 'RECEBIDO', 'VENCIDO', 'CANCELADO'] as const;

export const createContaReceberSchema = z.object({
  description: z.string().min(2, 'Descricao deve ter pelo menos 2 caracteres'),
  amount: z.number().int().positive('Valor deve ser positivo'),
  dueDate: z.string().min(1, 'Data de vencimento e obrigatoria'),
  category: z.enum(contaReceberCategories),
  clientId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateContaReceberSchema = z.object({
  description: z.string().min(2).optional(),
  amount: z.number().int().positive().optional(),
  dueDate: z.string().optional(),
  category: z.enum(contaReceberCategories).optional(),
  clientId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const listContaReceberQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(contaReceberStatuses).optional(),
  clientId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateContaReceberInput = z.infer<typeof createContaReceberSchema>;
export type UpdateContaReceberInput = z.infer<typeof updateContaReceberSchema>;
export type ListContaReceberQuery = z.infer<typeof listContaReceberQuerySchema>;
