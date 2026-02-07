# 10. Unified Project Structure

```
erpsb/
├── .github/
│   └── workflows/
│       ├── ci.yaml                    # Lint + type-check + tests on PR
│       └── deploy.yaml                # Auto-deploy to Vercel on main
├── prisma/
│   ├── schema.prisma                  # Database schema (single file)
│   ├── migrations/                    # Prisma migrations
│   └── seed.ts                        # Seed data (categorias, formas pagamento)
├── public/
│   ├── icons/                         # PWA icons (192, 512, maskable)
│   ├── manifest.json                  # PWA manifest
│   └── sw.js                          # Service worker (generated)
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (auth)/                    # Auth group (no layout)
│   │   │   ├── login/page.tsx
│   │   │   └── onboarding/page.tsx
│   │   ├── (dashboard)/               # Authenticated group (with layout)
│   │   │   ├── layout.tsx             # Main layout (bottom nav, header)
│   │   │   ├── page.tsx               # Dashboard home (semaforo)
│   │   │   ├── financeiro/
│   │   │   │   ├── page.tsx           # Financeiro overview
│   │   │   │   ├── contas-pagar/page.tsx
│   │   │   │   └── contas-receber/page.tsx
│   │   │   ├── vendas/
│   │   │   │   ├── page.tsx           # Historico vendas
│   │   │   │   ├── nova/page.tsx      # Quick sale
│   │   │   │   └── orcamentos/page.tsx
│   │   │   ├── fiscal/
│   │   │   │   ├── page.tsx           # Lista notas fiscais
│   │   │   │   └── config/page.tsx    # Config fiscal
│   │   │   ├── cadastros/
│   │   │   │   ├── clientes/page.tsx
│   │   │   │   ├── fornecedores/page.tsx
│   │   │   │   └── produtos/page.tsx
│   │   │   ├── estoque/page.tsx
│   │   │   ├── configuracoes/page.tsx
│   │   │   └── notificacoes/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── health/route.ts
│   │   │   ├── v1/
│   │   │   │   ├── tenants/route.ts
│   │   │   │   ├── clientes/route.ts
│   │   │   │   ├── clientes/[id]/route.ts
│   │   │   │   ├── fornecedores/route.ts
│   │   │   │   ├── produtos/route.ts
│   │   │   │   ├── formas-pagamento/route.ts
│   │   │   │   ├── contas-pagar/route.ts
│   │   │   │   ├── contas-receber/route.ts
│   │   │   │   ├── dashboard/route.ts
│   │   │   │   ├── vendas/route.ts
│   │   │   │   ├── orcamentos/route.ts
│   │   │   │   ├── pix/route.ts
│   │   │   │   ├── notas-fiscais/route.ts
│   │   │   │   ├── config-fiscal/route.ts
│   │   │   │   ├── estoque/route.ts
│   │   │   │   ├── whatsapp/route.ts
│   │   │   │   └── settings/route.ts
│   │   │   └── webhooks/
│   │   │       ├── mercadopago/route.ts
│   │   │       ├── whatsapp/route.ts
│   │   │       └── focusnfe/route.ts
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Tailwind imports
│   ├── core/
│   │   ├── auth/
│   │   │   ├── auth.config.ts         # NextAuth config
│   │   │   ├── auth.ts                # Auth helpers (getCurrentUser, etc)
│   │   │   └── middleware.ts          # Auth middleware
│   │   ├── tenant/
│   │   │   ├── tenant.service.ts      # Tenant CRUD
│   │   │   ├── tenant.context.ts      # Tenant context provider
│   │   │   ├── tenant.middleware.ts   # Tenant injection middleware
│   │   │   └── plan-limits.ts         # Plan feature limits
│   │   └── events/
│   │       ├── event-bus.ts           # EventEmitter singleton
│   │       └── events.ts             # Event type definitions
│   ├── modules/
│   │   ├── cadastros/
│   │   │   ├── cliente.service.ts
│   │   │   ├── fornecedor.service.ts
│   │   │   ├── produto.service.ts
│   │   │   ├── forma-pagamento.service.ts
│   │   │   └── schemas.ts            # Zod validation schemas
│   │   ├── financeiro/
│   │   │   ├── conta-pagar.service.ts
│   │   │   ├── conta-receber.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   ├── alerta.service.ts
│   │   │   └── schemas.ts
│   │   ├── vendas/
│   │   │   ├── venda.service.ts
│   │   │   ├── orcamento.service.ts
│   │   │   └── schemas.ts
│   │   ├── fiscal/
│   │   │   ├── nota-fiscal.service.ts
│   │   │   ├── config-fiscal.service.ts
│   │   │   ├── fiscal.helpers.ts      # CFOP, CST, aliquota lookups
│   │   │   └── schemas.ts
│   │   └── estoque/
│   │       ├── estoque.service.ts
│   │       └── schemas.ts
│   ├── integrations/
│   │   ├── pix/
│   │   │   ├── mercadopago.client.ts  # Mercado Pago API client
│   │   │   ├── pix.service.ts         # Business logic
│   │   │   └── pix.webhook.ts         # Webhook handler
│   │   ├── whatsapp/
│   │   │   ├── whatsapp.client.ts     # WhatsApp API client (adapter)
│   │   │   ├── whatsapp.service.ts
│   │   │   ├── whatsapp.webhook.ts
│   │   │   ├── reminder.job.ts        # BullMQ cron job
│   │   │   └── templates.ts           # Message templates
│   │   └── fiscal-api/
│   │       ├── focusnfe.client.ts     # Focus NFe API client
│   │       ├── fiscal-api.service.ts
│   │       └── fiscal-api.webhook.ts
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components (auto-generated)
│   │   ├── layout/
│   │   │   ├── bottom-nav.tsx
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── fab.tsx
│   │   ├── forms/
│   │   │   ├── progressive-form.tsx
│   │   │   └── search-input.tsx
│   │   ├── dashboard/
│   │   │   ├── semaforo.tsx
│   │   │   ├── cash-flow-chart.tsx
│   │   │   └── alert-cards.tsx
│   │   └── shared/
│   │       ├── empty-state.tsx
│   │       ├── loading-skeleton.tsx
│   │       ├── currency-display.tsx
│   │       └── status-badge.tsx
│   ├── hooks/
│   │   ├── use-tenant.ts
│   │   ├── use-toast.ts
│   │   └── use-pwa-install.ts
│   ├── lib/
│   │   ├── prisma.ts                  # Prisma client singleton + tenant extension
│   │   ├── redis.ts                   # Upstash Redis client
│   │   ├── queue.ts                   # BullMQ setup
│   │   ├── logger.ts                  # Pino logger
│   │   ├── api-response.ts            # Standard API response helpers
│   │   ├── errors.ts                  # Custom error classes
│   │   ├── audit.ts                   # Audit log helper
│   │   ├── currency.ts               # Centavos formatting (BRL)
│   │   ├── validators.ts             # CPF/CNPJ validators
│   │   └── constants.ts              # App constants (categories, etc)
│   ├── stores/
│   │   └── notification-store.ts      # Zustand store (notifications)
│   └── types/
│       ├── api.ts                     # API response types
│       ├── domain.ts                  # Domain types (shared with backend)
│       └── next-auth.d.ts             # NextAuth type augmentation
├── tests/
│   ├── unit/
│   │   ├── modules/                   # Service unit tests
│   │   └── lib/                       # Utility unit tests
│   ├── integration/
│   │   └── api/                       # API route integration tests
│   └── e2e/
│       ├── onboarding.spec.ts
│       ├── venda.spec.ts
│       ├── pix.spec.ts
│       ├── financeiro.spec.ts
│       └── dashboard.spec.ts
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
├── pnpm-lock.yaml
├── CLAUDE.md
└── README.md
```

---
