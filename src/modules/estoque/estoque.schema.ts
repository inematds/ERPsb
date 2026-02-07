import { z } from 'zod';

export const registrarEntradaSchema = z.object({
  productId: z.string().min(1, 'Produto obrigatorio'),
  quantity: z.number().int().min(1, 'Quantidade deve ser pelo menos 1'),
  notes: z.string().optional(),
});

export type RegistrarEntradaInput = z.infer<typeof registrarEntradaSchema>;

export const registrarAjusteSchema = z.object({
  productId: z.string().min(1, 'Produto obrigatorio'),
  quantity: z.number().int(),
  notes: z.string().min(1, 'Motivo obrigatorio para ajuste'),
});

export type RegistrarAjusteInput = z.infer<typeof registrarAjusteSchema>;

export const listMovimentacoesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  productId: z.string().optional(),
  type: z.enum(['ENTRADA', 'SAIDA', 'AJUSTE']).optional(),
});

export type ListMovimentacoesQuery = z.infer<typeof listMovimentacoesQuerySchema>;
