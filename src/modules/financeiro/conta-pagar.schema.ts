import { z } from 'zod';

export const contaPagarCategories = [
  'ALUGUEL',
  'FUNCIONARIOS',
  'FORNECEDORES',
  'IMPOSTOS',
  'MARKETING',
  'SERVICOS',
  'OUTROS',
] as const;

export const contaPagarStatuses = ['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO'] as const;

export const recurrenceTypes = ['MENSAL', 'SEMANAL'] as const;

export const createContaPagarSchema = z
  .object({
    description: z.string().min(2, 'Descricao deve ter pelo menos 2 caracteres'),
    amount: z.number().int().positive('Valor deve ser positivo'),
    dueDate: z.string().min(1, 'Data de vencimento e obrigatoria'),
    category: z.enum(contaPagarCategories),
    supplierId: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    recurrent: z.boolean().default(false),
    recurrenceType: z.enum(recurrenceTypes).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.recurrent && !data.recurrenceType) return false;
      return true;
    },
    { message: 'Tipo de recorrencia e obrigatorio para contas recorrentes', path: ['recurrenceType'] },
  );

export const updateContaPagarSchema = z.object({
  description: z.string().min(2).optional(),
  amount: z.number().int().positive().optional(),
  dueDate: z.string().optional(),
  category: z.enum(contaPagarCategories).optional(),
  supplierId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  recurrent: z.boolean().optional(),
  recurrenceType: z.enum(recurrenceTypes).optional().nullable(),
});

export const listContaPagarQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(contaPagarStatuses).optional(),
  category: z.enum(contaPagarCategories).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateContaPagarInput = z.infer<typeof createContaPagarSchema>;
export type UpdateContaPagarInput = z.infer<typeof updateContaPagarSchema>;
export type ListContaPagarQuery = z.infer<typeof listContaPagarQuerySchema>;
