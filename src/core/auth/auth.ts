import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.userId = user.id;
      }

      // Fetch active tenant on sign in or update
      if (trigger === 'signIn' || trigger === 'update') {
        if (token.userId) {
          const userTenant = await prisma.userTenant.findFirst({
            where: { userId: token.userId as string, isActive: true },
            select: { tenantId: true },
          });
          token.activeTenantId = userTenant?.tenantId ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If url is relative, prepend baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If url is on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.id) {
        // New users will be redirected to onboarding via middleware
        // No tenant exists yet
      }
    },
  },
});

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? '',
    image: session.user.image,
  };
}

export async function getActiveTenantId(userId: string): Promise<string | null> {
  const userTenant = await prisma.userTenant.findFirst({
    where: { userId, isActive: true },
    select: { tenantId: true },
  });
  return userTenant?.tenantId ?? null;
}
