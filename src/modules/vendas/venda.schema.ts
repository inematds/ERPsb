import { z } from 'zod';

export const vendaItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const createVendaSchema = z.object({
  clientId: z.string().optional(),
  items: z.array(vendaItemSchema).min(1, 'Adicione pelo menos 1 item'),
  discount: z.number().int().nonnegative().default(0),
  paymentMethodId: z.string().min(1, 'Selecione uma forma de pagamento'),
  notes: z.string().optional(),
});

export const listVendasQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['RASCUNHO', 'CONFIRMADA', 'CANCELADA']).optional(),
  clientId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type VendaItem = z.infer<typeof vendaItemSchema>;
export type CreateVendaInput = z.infer<typeof createVendaSchema>;
export type ListVendasQuery = z.infer<typeof listVendasQuerySchema>;
