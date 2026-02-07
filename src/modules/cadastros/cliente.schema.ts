import { z } from 'zod';

export const createClienteSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(8, 'Telefone deve ter pelo menos 8 digitos'),
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

export const updateClienteSchema = createClienteSchema.partial();

export const listClienteQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;
export type ListClienteQuery = z.infer<typeof listClienteQuerySchema>;
