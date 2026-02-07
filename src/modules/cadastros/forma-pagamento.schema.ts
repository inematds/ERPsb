import { z } from 'zod';

export const formaPagamentoTypes = ['PIX', 'DINHEIRO', 'DEBITO', 'CREDITO', 'BOLETO', 'OUTRO'] as const;

export const createFormaPagamentoSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  type: z.enum(formaPagamentoTypes),
  installments: z.number().int().min(1).default(1),
  fee: z.number().int().min(0).default(0),
});

export const updateFormaPagamentoSchema = z.object({
  name: z.string().min(1).optional(),
  active: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  installments: z.number().int().min(1).optional(),
  fee: z.number().int().min(0).optional(),
});

export type CreateFormaPagamentoInput = z.infer<typeof createFormaPagamentoSchema>;
export type UpdateFormaPagamentoInput = z.infer<typeof updateFormaPagamentoSchema>;
