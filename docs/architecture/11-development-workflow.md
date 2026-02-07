# 11. Development Workflow

### 11.1 Prerequisites

```bash
node >= 20.0.0 (LTS)
pnpm >= 9.0.0
git >= 2.40.0
```

### 11.2 Initial Setup

```bash
git clone git@github.com:inematds/ERPsb.git
cd ERPsb
pnpm install
cp .env.example .env.local
# Editar .env.local com credenciais Supabase, Google OAuth, etc
pnpm prisma generate
pnpm prisma db push    # Aplicar schema no banco
pnpm prisma db seed    # Dados iniciais (categorias, etc)
```

### 11.3 Development Commands

```bash
pnpm dev               # Start Next.js dev server (port 3000)
pnpm build             # Production build
pnpm start             # Start production server
pnpm lint              # ESLint
pnpm type-check        # TypeScript check
pnpm test              # Run Vitest unit + integration tests
pnpm test:e2e          # Run Playwright E2E tests
pnpm test:coverage     # Vitest with coverage report
pnpm prisma studio     # Open Prisma Studio (DB GUI)
pnpm prisma migrate dev # Create new migration
```

### 11.4 Environment Variables

```bash
# .env.local (NUNCA commit - apenas .env.example)

# Database (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="your-access-token"
MERCADOPAGO_WEBHOOK_SECRET="your-webhook-secret"

# Focus NFe
FOCUSNFE_TOKEN="your-api-token"
FOCUSNFE_AMBIENTE="homologacao"  # homologacao | producao

# WhatsApp Business API
WHATSAPP_API_URL="https://your-provider-api.com"
WHATSAPP_API_TOKEN="your-token"
WHATSAPP_WEBHOOK_SECRET="your-webhook-secret"

# Sentry
SENTRY_DSN="https://your-dsn@sentry.io/project-id"
NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project-id"

# PostHog
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

---
