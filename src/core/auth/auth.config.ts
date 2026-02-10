import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

const providers: NextAuthConfig['providers'] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authConfig: NextAuthConfig = {
  providers,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      session.activeTenantId = (token.activeTenantId as string) ?? null;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPath = nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/api/auth') ||
        nextUrl.pathname.startsWith('/api/health') ||
        nextUrl.pathname.startsWith('/api/webhooks') ||
        nextUrl.pathname.startsWith('/api/debug');

      if (isPublicPath) {
        // Redirect logged-in users away from login page
        if (isLoggedIn && nextUrl.pathname.startsWith('/login')) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      // Protected routes
      if (isLoggedIn) {
        // Check if user has a tenant (from JWT); redirect to onboarding if not
        const hasTenant = !!(auth as { activeTenantId?: string | null })?.activeTenantId;
        if (!hasTenant) {
          // Allow access to onboarding and tenant/onboarding API routes without tenant
          const noTenantAllowed =
            nextUrl.pathname.startsWith('/onboarding') ||
            nextUrl.pathname.startsWith('/api/v1/onboarding') ||
            nextUrl.pathname.startsWith('/api/v1/tenants');
          if (!noTenantAllowed) {
            return Response.redirect(new URL('/onboarding', nextUrl));
          }
        }
        return true;
      }

      // API routes: return JSON 401 instead of HTML redirect
      if (nextUrl.pathname.startsWith('/api/')) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      return false; // Redirect pages to login
    },
  },
};
