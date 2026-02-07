import { z } from 'zod';

export const pixChargeStatuses = ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'] as const;

export const createPixChargeSchema = z.object({
  contaReceberId: z.string().min(1, 'Conta a receber e obrigatoria'),
  expirationMinutes: z.number().int().min(15, 'Minimo 15 minutos').max(43200, 'Maximo 30 dias').default(1440),
});

export const listPixChargesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(pixChargeStatuses).optional(),
  contaReceberId: z.string().optional(),
});

export type CreatePixChargeInput = z.infer<typeof createPixChargeSchema>;
export type ListPixChargesQuery = z.infer<typeof listPixChargesQuerySchema>;
