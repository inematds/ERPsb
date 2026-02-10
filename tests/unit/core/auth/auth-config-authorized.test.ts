import { describe, it, expect } from 'vitest';
import { authConfig } from '@/core/auth/auth.config';

// Helper to call the authorized callback
function callAuthorized(
  auth: { user?: { id: string }; activeTenantId?: string | null } | null,
  pathname: string,
) {
  const nextUrl = new URL(`http://localhost:3000${pathname}`);
  const callback = authConfig.callbacks!.authorized!;
  return callback({
    auth: auth as Parameters<typeof callback>[0]['auth'],
    request: { nextUrl } as Parameters<typeof callback>[0]['request'],
  } as Parameters<typeof callback>[0]);
}

describe('auth.config authorized callback', () => {
  describe('public routes', () => {
    it('should allow unauthenticated access to /login', () => {
      const result = callAuthorized(null, '/login');
      expect(result).toBe(true);
    });

    it('should allow unauthenticated access to /api/auth paths', () => {
      const result = callAuthorized(null, '/api/auth/callback/google');
      expect(result).toBe(true);
    });

    it('should allow unauthenticated access to /api/health', () => {
      const result = callAuthorized(null, '/api/health');
      expect(result).toBe(true);
    });

    it('should allow unauthenticated access to /api/webhooks', () => {
      const result = callAuthorized(null, '/api/webhooks/mercadopago');
      expect(result).toBe(true);
    });

    it('should redirect logged-in users away from /login to /', () => {
      const result = callAuthorized(
        { user: { id: 'u1' }, activeTenantId: 'tenant_1' },
        '/login',
      );
      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/');
    });
  });

  describe('authenticated users WITH tenant', () => {
    const authWithTenant = { user: { id: 'u1' }, activeTenantId: 'tenant_1' };

    it('should allow access to dashboard /', () => {
      const result = callAuthorized(authWithTenant, '/');
      expect(result).toBe(true);
    });

    it('should allow access to /financeiro', () => {
      const result = callAuthorized(authWithTenant, '/financeiro');
      expect(result).toBe(true);
    });

    it('should allow access to API routes', () => {
      const result = callAuthorized(authWithTenant, '/api/v1/dashboard/saldo');
      expect(result).toBe(true);
    });
  });

  describe('authenticated users WITHOUT tenant', () => {
    const authNoTenant = { user: { id: 'u1' }, activeTenantId: null };

    it('should redirect from / to /onboarding', () => {
      const result = callAuthorized(authNoTenant, '/');
      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.headers.get('location')).toContain('/onboarding');
    });

    it('should redirect from /financeiro to /onboarding', () => {
      const result = callAuthorized(authNoTenant, '/financeiro/contas-pagar');
      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.headers.get('location')).toContain('/onboarding');
    });

    it('should redirect from /api/v1/dashboard to /onboarding', () => {
      const result = callAuthorized(authNoTenant, '/api/v1/dashboard/saldo');
      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.headers.get('location')).toContain('/onboarding');
    });

    it('should allow access to /onboarding', () => {
      const result = callAuthorized(authNoTenant, '/onboarding');
      expect(result).toBe(true);
    });

    it('should allow access to /api/v1/onboarding', () => {
      const result = callAuthorized(authNoTenant, '/api/v1/onboarding');
      expect(result).toBe(true);
    });

    it('should allow access to /api/v1/tenants', () => {
      const result = callAuthorized(authNoTenant, '/api/v1/tenants');
      expect(result).toBe(true);
    });

    it('should redirect when activeTenantId is undefined', () => {
      const authUndefined = { user: { id: 'u1' } };
      const result = callAuthorized(authUndefined, '/');
      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.headers.get('location')).toContain('/onboarding');
    });
  });

  describe('unauthenticated users on protected routes', () => {
    it('should return 401 JSON for API routes', () => {
      const result = callAuthorized(null, '/api/v1/dashboard/saldo');
      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(401);
    });

    it('should return false for page routes (triggers login redirect)', () => {
      const result = callAuthorized(null, '/financeiro');
      expect(result).toBe(false);
    });
  });
});
