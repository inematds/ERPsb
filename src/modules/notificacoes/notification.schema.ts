import { z } from 'zod';

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  read: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
