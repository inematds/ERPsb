import { z } from 'zod';

export const createProdutoSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  type: z.enum(['PRODUTO', 'SERVICO']),
  sellPrice: z.number().int().positive('Preco deve ser positivo'),
  costPrice: z.number().int().positive('Preco deve ser positivo').optional().nullable(),
  unit: z.enum(['un', 'kg', 'hr', 'srv']).default('un'),
  barcode: z.string().optional().or(z.literal('')),
  ncm: z
    .string()
    .regex(/^\d{8}$/, 'NCM deve ter 8 digitos')
    .optional()
    .or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  stockMin: z.number().int().min(0).optional().nullable(),
  trackStock: z.boolean().optional(),
});

export const updateProdutoSchema = createProdutoSchema.partial();

export const listProdutoQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['PRODUTO', 'SERVICO']).optional(),
  active: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
});

export type CreateProdutoInput = z.infer<typeof createProdutoSchema>;
export type UpdateProdutoInput = z.infer<typeof updateProdutoSchema>;
export type ListProdutoQuery = z.infer<typeof listProdutoQuerySchema>;
