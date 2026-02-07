import { z } from 'zod';

export const emitirNFeSchema = z.object({
  saleId: z.string().min(1, 'ID da venda e obrigatorio'),
});

export type EmitirNFeInput = z.infer<typeof emitirNFeSchema>;

export const listNotasFiscaisQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['NFE', 'NFSE', 'NFCE']).optional(),
  status: z.enum(['PROCESSANDO', 'AUTORIZADA', 'REJEITADA', 'CANCELADA']).optional(),
  saleId: z.string().optional(),
});

export type ListNotasFiscaisQuery = z.infer<typeof listNotasFiscaisQuerySchema>;

export const cancelarNotaSchema = z.object({
  motivo: z.string().min(15, 'Motivo deve ter pelo menos 15 caracteres'),
});

export type CancelarNotaInput = z.infer<typeof cancelarNotaSchema>;
