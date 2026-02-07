import { z } from 'zod';

export const createFornecedorSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  document: z.string().optional().or(z.literal('')),
  address: z
    .object({
      street: z.string().optional(),
      number: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional()
    .nullable(),
  notes: z.string().optional().or(z.literal('')),
});

export const updateFornecedorSchema = createFornecedorSchema.partial();

export const listFornecedorQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateFornecedorInput = z.infer<typeof createFornecedorSchema>;
export type UpdateFornecedorInput = z.infer<typeof updateFornecedorSchema>;
export type ListFornecedorQuery = z.infer<typeof listFornecedorQuerySchema>;
