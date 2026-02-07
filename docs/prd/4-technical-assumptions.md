# 4. Technical Assumptions

### 4.1 Repository Structure: Monorepo

- Repositorio unico contendo frontend + backend via Next.js App Router
- Estrutura de modulos DDD dentro do mesmo repositorio
- Gerenciador de pacotes: pnpm (performance e disk space)
- Monorepo simples (sem Turborepo no MVP - complexidade desnecessaria)

### 4.2 Service Architecture

**Monolito Modular (DDD)** - Decisao critica justificada:
- Time pequeno (2-3 devs) - microservicos seria over-engineering
- Next.js permite API Routes + frontend no mesmo deploy
- Modulos isolados por dominio permitem extrair para servicos no futuro se necessario
- Dominio compartilhado via eventos internos (event emitter) para desacoplamento

**Modulos de dominio:**
- `core/auth` - Autenticacao, sessoes, multi-tenant
- `core/tenant` - Gestao de tenants, planos, limites
- `modules/cadastros` - Clientes, Fornecedores, Produtos, Formas de Pagamento
- `modules/financeiro` - Contas, Fluxo de Caixa, Dashboard, Alertas
- `modules/vendas` - Orcamentos, Vendas, PDV rapido
- `modules/fiscal` - NFe, NFSe, NFCe, CBS/IBS
- `modules/estoque` - Entradas, Saidas, Saldos, Alertas minimo
- `integrations/pix` - Mercado Pago API, webhooks PIX
- `integrations/whatsapp` - WhatsApp Business API, templates de mensagem
- `integrations/fiscal-api` - Focus NFe API adapter

**Stack detalhada:**
- **Runtime:** Node.js 20 LTS
- **Framework:** Next.js 15 (App Router) + TypeScript 5
- **UI:** Tailwind CSS 4 + shadcn/ui + Radix UI primitives
- **Database:** PostgreSQL 16 (via Supabase) + Prisma ORM 6
- **Auth:** NextAuth.js v5 (Auth.js) - escolha sobre Clerk por: open-source, sem vendor lock-in, custo zero, controle total
- **Queue:** BullMQ + Redis (Upstash Redis para serverless) - jobs assincronos (NFe, WhatsApp, webhooks)
- **Validacao:** Zod (schemas de validacao + TypeScript inference)
- **State Management:** React Server Components + Zustand (minimal client state)
- **HTTP Client:** fetch nativo (Node.js 20) para APIs externas
- **Hosting:** Vercel (frontend + API) + Supabase (PostgreSQL + Auth + Storage)
- **Monitoramento:** Sentry (erros) + PostHog (analytics de produto)

**Integracoes externas:**
- Focus NFe - API fiscal (NFe, NFSe Nacional, NFCe)
- Mercado Pago - PIX (cobranca, QR code, webhooks, conciliacao)
- WhatsApp Business API (via provedor a definir: Wati ou Evolution API)

### 4.3 Testing Requirements

**Full Testing Pyramid:**

- **Unit Tests:** Vitest - logica de negocio dos modulos, validacoes, calculos financeiros/fiscais
- **Integration Tests:** Vitest + Prisma (test database) - fluxos entre modulos, API routes, webhooks
- **E2E Tests:** Playwright - fluxos criticos do usuario (onboarding, venda, cobranca PIX, emissao NFe)
- **Cobertura minima:** 80% para modulos `core/` e `modules/financeiro`, 70% para demais modulos
- **CI:** Testes executados automaticamente em cada PR via GitHub Actions

### 4.4 Additional Technical Assumptions and Requests

- **Database migrations:** Gerenciadas via Prisma Migrate com versionamento no repositorio
- **API Design:** REST com OpenAPI spec auto-gerada via route handlers tipados
- **Internacionalizacao:** Nao necessaria no MVP - apenas pt-BR
- **Timezone:** America/Sao_Paulo como default, armazenar em UTC no banco
- **Moeda:** Apenas BRL no MVP, valores armazenados em centavos (inteiros) para evitar erros de ponto flutuante
- **Certificado Digital:** Suporte a certificado A1 (arquivo .pfx) para emissao NFe - armazenado criptografado no Supabase Storage
- **Feature Flags:** Baseadas no plano do tenant (freemium limits) - sem sistema de feature flags externo
- **Rate Limiting:** Implementado via middleware com Redis (Upstash) - 100 req/min por tenant default
- **Logging:** Structured JSON logs via pino - integrado com Vercel Logs
- **Secrets:** Variáveis de ambiente via Vercel Environment Variables - nunca em codigo
- **PWA:** next-pwa para manifest + service worker + cache strategies (stale-while-revalidate para dados, cache-first para assets)

---
