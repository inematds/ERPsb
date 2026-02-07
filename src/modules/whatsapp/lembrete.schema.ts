import { z } from 'zod';

export const updateLembreteConfigSchema = z.object({
  ativo: z.boolean(),
  diasAntes: z.number().int().min(0).max(30).default(3),
  noDia: z.boolean().default(true),
  diasDepois: z.number().int().min(0).max(30).default(1),
});

export type UpdateLembreteConfigInput = z.infer<typeof updateLembreteConfigSchema>;
