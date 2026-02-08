import { PrismaClient } from '@prisma/client';
import { getTenantIdFromContext } from '@/core/tenant/tenant.context';

const MODELS_WITHOUT_TENANT = ['User', 'Account', 'VerificationToken', 'UserTenant'];

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = basePrisma;

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (MODELS_WITHOUT_TENANT.includes(model)) {
          return query(args);
        }

        const tenantId = getTenantIdFromContext();

        // For operations that need tenantId, inject it
        if (tenantId) {
          if (operation === 'create' || operation === 'createMany') {
            const data = args as Record<string, unknown>;
            if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
              (data.data as Record<string, unknown>).tenantId = tenantId;
            }
          }

          if (
            ['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'groupBy'].includes(
              operation,
            )
          ) {
            const data = args as Record<string, unknown>;
            if (!data.where) data.where = {};
            (data.where as Record<string, unknown>).tenantId = tenantId;
          }

          if (['update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
            const data = args as Record<string, unknown>;
            if (!data.where) data.where = {};
            (data.where as Record<string, unknown>).tenantId = tenantId;
          }
        }

        return query(args);
      },
    },
  },
});

export type PrismaWithTenant = typeof prisma;
