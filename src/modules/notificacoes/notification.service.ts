import { prisma } from '@/lib/prisma';
import type { ListNotificationsQuery } from './notification.schema';

interface CreateNotificationInput {
  tenantId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
}

export async function createNotification(data: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      tenantId: data.tenantId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata ?? undefined,
    },
  });
}

export async function listNotifications(query: ListNotificationsQuery) {
  const { page, pageSize, read } = query;

  const where: Record<string, unknown> = {};
  if (read !== undefined) where.read = read;

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function markAsRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllAsRead() {
  return prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });
}

export async function getUnreadCount() {
  return prisma.notification.count({
    where: { read: false },
  });
}
