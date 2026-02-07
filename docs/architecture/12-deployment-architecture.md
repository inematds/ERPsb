# 12. Deployment Architecture

### 12.1 Deployment Strategy

**Frontend + Backend Deployment:**
- **Platform:** Vercel
- **Build Command:** `pnpm build`
- **Output:** `.next/` (automatic)
- **CDN/Edge:** Vercel Edge Network (global CDN, edge middleware em GRU)
- **Deploy trigger:** Push para `main` (producao), PR branch (preview)

**Database:**
- **Platform:** Supabase (managed PostgreSQL 16)
- **Region:** South America (GRU)
- **Backups:** Automatico a cada 6h (Supabase Pro) ou diario (Free)
- **Migrations:** `pnpm prisma migrate deploy` no build step

### 12.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yaml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test --coverage
      - run: pnpm build
```

### 12.3 Environments

| Environment | URL | Purpose |
|------------|-----|---------|
| Development | http://localhost:3000 | Local development |
| Preview | https://erpsb-*-vercel.app | PR preview deploys |
| Production | https://erpsb.vercel.app | Live (depois dominio custom) |

---
