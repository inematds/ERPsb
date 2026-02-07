# 13. Security and Performance

### 13.1 Security Requirements

**Frontend Security:**
- CSP Headers: strict CSP via `next.config.ts` (script-src 'self', style-src 'self' 'unsafe-inline')
- XSS Prevention: React auto-escaping + DOMPurify para conteudo dinamico
- Secure Storage: Tokens em httpOnly cookies (NextAuth.js default)

**Backend Security:**
- Input Validation: Zod schemas em TODAS as API routes (rejeita input nao validado)
- Rate Limiting: Upstash Redis ratelimiter - 100 req/min por tenant, 10 req/min em auth endpoints
- CORS Policy: Same-origin default, webhooks com validacao de assinatura

**Authentication Security:**
- Token Storage: JWT em httpOnly secure cookie (SameSite=Lax)
- Session Management: JWT 24h expiry, refresh token 30 dias
- Password Policy: Minimo 8 caracteres, bcrypt cost 12

**Data Security (LGPD):**
- RLS: Isolamento total entre tenants no nivel do banco
- Audit Logs: Todas as operacoes criticas logadas com userId, tenantId, timestamp, changes
- Encryption: TLS 1.3 em transito, AES-256 em repouso (Supabase default)
- Certificado Digital: Armazenado criptografado no Supabase Storage, senha em env var criptografada
- Direito ao esquecimento: Endpoint de exportacao e exclusao de dados pessoais

### 13.2 Performance Optimization

**Frontend Performance:**
- Bundle Size Target: < 150KB JS (initial load), code splitting automatico por rota
- Loading Strategy: RSC por default (zero JS para componentes server), streaming SSR, suspense boundaries
- Caching Strategy: ISR para paginas estaticas, stale-while-revalidate para dados de API, cache-first para assets

**Backend Performance:**
- Response Time Target: < 200ms para CRUD, < 500ms para dashboard agregado
- Database Optimization: Indexes em tenant_id + campos de busca/filtro, connection pooling via Supabase
- Caching Strategy: Upstash Redis para dashboard data (TTL 30s), rate limit counters, session cache

---
