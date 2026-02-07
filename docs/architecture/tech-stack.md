# 3. Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.x | Type safety fullstack | Inferencia de tipos com Zod/Prisma, previne erros em runtime |
| Frontend Framework | Next.js | 15 (App Router) | SSR/SSG/API fullstack | Unifica frontend + backend, RSC para performance, deploy Vercel |
| UI Component Library | shadcn/ui + Radix UI | latest | Componentes acessiveis | Customizavel, sem vendor lock-in, WCAG AA, Tailwind nativo |
| State Management | React Server Components + Zustand | RSC + 5.x | Server state + minimal client state | RSC elimina 90% do state management, Zustand para o restante |
| CSS Framework | Tailwind CSS | 4.x | Utility-first styling | Mobile-first, performance (purge), design system consistente |
| Backend Language | TypeScript | 5.x | Logica de negocio | Mesmo language frontend/backend, type sharing |
| Backend Framework | Next.js API Routes | 15 | REST API serverless | Deploy automatico Vercel, edge middleware, zero config |
| API Style | REST | OpenAPI 3.0 | API publica e interna | Simplicidade, tooling maduro, facil debug, OpenAPI auto-gerado |
| Database | PostgreSQL | 16 | Banco relacional principal | RLS nativo para multi-tenant, JSONB para dados flexiveis, Supabase managed |
| ORM | Prisma | 6.x | Data access layer | Type-safe queries, migrations, schema-first, Supabase compatible |
| Cache/Queue | Upstash Redis | Serverless | BullMQ queues + rate limiting + cache | Serverless-compatible, pay-per-use, sem Redis managed |
| Queue | BullMQ | 5.x | Job processing assincrono | NFe emission, WhatsApp send, webhook retry |
| File Storage | Supabase Storage | - | XMLs fiscais, certificados, logos | Integrado com Supabase, RLS por bucket, CDN built-in |
| Authentication | NextAuth.js (Auth.js) | 5.x | OAuth + session management | Open-source, zero custo, Google OAuth, JWT sessions |
| Validation | Zod | 3.x | Schema validation | TypeScript inference, runtime validation, form validation |
| Frontend Testing | Vitest + Testing Library | latest | Unit + component tests | Fast, Vite-native, RTL para testes de componentes |
| Backend Testing | Vitest | latest | Unit + integration tests | Mesmo runner frontend/backend, Prisma test utils |
| E2E Testing | Playwright | latest | End-to-end tests | Multi-browser, mobile emulation, reliable |
| Build Tool | Next.js (Turbopack) | 15 | Build + dev server | Built-in, turbopack para dev rapido |
| Bundler | Next.js (Webpack/Turbopack) | 15 | Production bundling | Automatic code splitting, tree shaking |
| CI/CD | GitHub Actions | - | Pipeline de CI/CD | Integrado com GitHub, free tier generoso |
| Monitoring (Errors) | Sentry | latest | Error tracking | Source maps, performance tracing, Vercel integration |
| Monitoring (Analytics) | PostHog | latest | Product analytics | Self-hostable, event tracking, funnels, free tier |
| Logging | Pino | 9.x | Structured logging | JSON output, fast, Vercel Logs compatible |
| HTTP Client | fetch (native) | Node.js 20 | External API calls | Built-in, no extra deps, works in Edge Runtime |
| PWA | next-pwa / Serwist | latest | Service worker + manifest | Cache strategies, offline, installable PWA |
| Icons | Lucide React | latest | Icon library | Tree-shakeable, consistent style, shadcn/ui default |
| Charts | Recharts | latest | Dashboard graphs | React-native, responsive, lightweight |
| Date/Time | date-fns | latest | Date manipulation | Tree-shakeable, locale pt-BR, immutable |
| Currency | Custom (centavos) | - | Monetary values | Inteiros em centavos, formatacao via Intl.NumberFormat |

---
