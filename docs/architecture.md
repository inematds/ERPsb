# ERPsb - Fullstack Architecture Document

**Versao:** 1.0
**Data:** 2026-02-07
**Autor:** Winston (Architect) - BMad Method
**Status:** Draft
**Baseado em:** PRD v1.0 (`docs/prd.md`) + Project Brief v1.0 (`docs/brief.md`)

---

## 1. Introduction

Este documento define a arquitetura completa do ERPsb - um ERP SaaS mobile-first para micro e pequenas empresas brasileiras. Serve como fonte unica da verdade para desenvolvimento orientado por IA, garantindo consistencia em toda a stack tecnologica.

A abordagem unificada combina backend e frontend em um unico documento, refletindo a natureza monolitica modular do projeto onde Next.js serve tanto o frontend quanto a API.

### 1.1 Starter Template

N/A - Greenfield project. O projeto sera criado do zero com Next.js 15 App Router via `create-next-app` com as customizacoes de estrutura DDD definidas neste documento.

### 1.2 Change Log

| Data | Versao | Descricao | Autor |
|------|--------|-----------|-------|
| 2026-02-07 | 1.0 | Criacao inicial da arquitetura a partir do PRD v1.0 | Winston (Architect) |

---

## 2. High Level Architecture

### 2.1 Technical Summary

O ERPsb utiliza uma arquitetura **monolito modular (DDD)** deployada como uma aplicacao **Next.js 15** na **Vercel**, com **PostgreSQL 16** via **Supabase** como banco de dados. A separacao de dominios e feita em modulos isolados dentro do mesmo repositorio, comunicando-se via eventos internos. O frontend usa **React Server Components** para performance otima, com **Tailwind CSS 4** e **shadcn/ui** para UI consistente. A autenticacao via **NextAuth.js v5** com Google OAuth e multi-tenant via **Row-Level Security (RLS)** garantem isolamento total de dados. Integracoes externas (Focus NFe, Mercado Pago, WhatsApp) sao processadas de forma assincrona via **BullMQ + Upstash Redis**, garantindo resiliencia com circuit breakers e filas de retry. Esta arquitetura atinge os objetivos do PRD de simplicidade radical, performance mobile-first (FCP < 1.5s) e custo infra baixo (free tiers).

### 2.2 Platform and Infrastructure

**Platform:** Vercel + Supabase
**Key Services:**
- Vercel: Frontend SSR/SSG, API Routes (serverless functions), Edge Middleware, Preview Deploys
- Supabase: PostgreSQL 16 (database + RLS), Auth (backup), Storage (certificados digitais, XMLs fiscais), Realtime (notificacoes)
- Upstash: Redis serverless (BullMQ queues, rate limiting, cache)

**Deployment Regions:** GRU (Sao Paulo) - latencia minima para usuarios brasileiros

**Justificativa:** Vercel + Supabase oferece o melhor custo-beneficio para um MVP com time pequeno: free tiers generosos, deploy zero-config para Next.js, PostgreSQL managed com RLS nativo, e storage integrado. Escala automaticamente ate milhares de usuarios sem mudanca de arquitetura.

### 2.3 Repository Structure

**Structure:** Monorepo simples (Next.js App Router)
**Monorepo Tool:** N/A - repositorio unico sem workspace tools (sem Turborepo/Nx no MVP)
**Package Manager:** pnpm

O Next.js App Router unifica frontend e backend no mesmo projeto. A separacao ocorre via estrutura de pastas DDD, nao via packages separados. Shared types e utils vivem em `src/lib/`.

### 2.4 High Level Architecture Diagram

```mermaid
graph TB
    subgraph Users["Usuarios"]
        Mobile["📱 PWA Mobile<br/>(Android/iOS)"]
        Desktop["💻 Desktop<br/>(Chrome/Safari/Firefox)"]
    end

    subgraph Vercel["Vercel (GRU)"]
        Edge["Edge Middleware<br/>(Auth + Rate Limit + Tenant)"]
        NextApp["Next.js 15 App"]

        subgraph Frontend["Frontend (RSC + Client)"]
            Pages["App Router Pages"]
            Components["shadcn/ui Components"]
            PWA["Service Worker + Cache"]
        end

        subgraph API["API Routes"]
            AuthAPI["Auth API<br/>(NextAuth.js v5)"]
            CrudAPI["CRUD APIs<br/>(Cadastros/Financeiro/Vendas)"]
            WebhookAPI["Webhook APIs<br/>(PIX/WhatsApp)"]
        end
    end

    subgraph Supabase["Supabase (GRU)"]
        PG["PostgreSQL 16<br/>(RLS Multi-tenant)"]
        Storage["Supabase Storage<br/>(XMLs, Certificados)"]
    end

    subgraph Upstash["Upstash Redis"]
        Queue["BullMQ Queues<br/>(NFe, WhatsApp, PIX)"]
        RateLimit["Rate Limiter"]
        Cache["Cache Layer"]
    end

    subgraph External["Integracoes Externas"]
        FocusNFe["Focus NFe API<br/>(NFe/NFSe/NFCe)"]
        MercadoPago["Mercado Pago API<br/>(PIX/Pagamentos)"]
        WhatsApp["WhatsApp Business API<br/>(Mensagens)"]
        Google["Google OAuth<br/>(Autenticacao)"]
    end

    subgraph Monitoring["Observabilidade"]
        Sentry["Sentry<br/>(Erros)"]
        PostHog["PostHog<br/>(Analytics)"]
    end

    Mobile --> Edge
    Desktop --> Edge
    Edge --> NextApp
    NextApp --> Frontend
    NextApp --> API
    API --> PG
    API --> Storage
    API --> Queue
    API --> RateLimit
    Queue --> FocusNFe
    Queue --> MercadoPago
    Queue --> WhatsApp
    AuthAPI --> Google
    WebhookAPI --> Queue
    MercadoPago -.->|webhook| WebhookAPI
    WhatsApp -.->|webhook| WebhookAPI
    NextApp --> Sentry
    NextApp --> PostHog
    Edge --> Cache
```

### 2.5 Architectural Patterns

- **Monolito Modular (DDD):** Modulos isolados por dominio de negocio (cadastros, financeiro, vendas, fiscal, estoque) com interfaces claras entre si. Permite extrair modulos para microservicos no futuro sem retrabalho. _Rationale:_ Time pequeno (2-3 devs), complexidade de microservicos injustificada para MVP.

- **React Server Components (RSC):** Renderizacao server-side por padrao, client components apenas quando interatividade e necessaria. _Rationale:_ Performance superior (menor JS bundle), FCP < 1.5s, SEO built-in, data fetching simplificado.

- **Repository Pattern:** Camada de acesso a dados abstraida via Prisma com extensoes de tenant filtering. _Rationale:_ Isolamento de queries, facilita testes unitarios, centraliza logica de multi-tenant.

- **Event-Driven (interno):** Modulos comunicam-se via EventEmitter para operacoes cross-domain (ex: venda confirmada → financeiro + estoque). _Rationale:_ Desacoplamento entre modulos sem overhead de message broker externo.

- **Circuit Breaker + Queue:** Integracoes externas usam BullMQ com retry exponencial e circuit breaker. _Rationale:_ NFR15/NFR16 exigem resiliencia; Focus NFe/Mercado Pago fora do ar nao deve travar o sistema.

- **Progressive Disclosure (UI):** Formularios comecam com campos minimos e expandem sob demanda. _Rationale:_ Diferencial do ERPsb - simplicidade radical para usuarios que nunca usaram ERP.

- **Mobile-First Responsive:** Design primariamente para 320px-428px, adaptando para desktop via breakpoints. _Rationale:_ 70%+ dos usuarios-alvo acessam pelo celular.

---

## 3. Tech Stack

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

## 4. Data Models

### 4.1 Entity Relationship Overview

```mermaid
erDiagram
    User ||--o{ UserTenant : "has many"
    Tenant ||--o{ UserTenant : "has many"
    Tenant ||--o{ Cliente : "has many"
    Tenant ||--o{ Fornecedor : "has many"
    Tenant ||--o{ Produto : "has many"
    Tenant ||--o{ FormaPagamento : "has many"
    Tenant ||--o{ ContaPagar : "has many"
    Tenant ||--o{ ContaReceber : "has many"
    Tenant ||--o{ Venda : "has many"
    Tenant ||--o{ Orcamento : "has many"
    Tenant ||--o{ PixCharge : "has many"
    Tenant ||--o{ NotaFiscal : "has many"
    Tenant ||--o{ ConfigFiscal : "has one"
    Tenant ||--o{ MovimentacaoEstoque : "has many"
    Tenant ||--o{ WhatsAppMessage : "has many"
    Tenant ||--o{ AuditLog : "has many"

    Cliente ||--o{ ContaReceber : "has many"
    Cliente ||--o{ Venda : "has many"
    Cliente ||--o{ Orcamento : "has many"
    Fornecedor ||--o{ ContaPagar : "has many"
    Venda ||--o{ ContaReceber : "generates"
    Venda ||--o{ NotaFiscal : "generates"
    Venda ||--o{ MovimentacaoEstoque : "generates"
    ContaReceber ||--o{ PixCharge : "has many"
    Orcamento ||--o| Venda : "converts to"
    Produto ||--o{ MovimentacaoEstoque : "has many"
```

### 4.2 Core Models

#### User

**Purpose:** Conta de usuario do sistema (pode pertencer a multiplos tenants)

```typescript
interface User {
  id: string;              // cuid
  email: string;           // unique
  name: string;
  image?: string;          // avatar URL (Google)
  provider: 'google' | 'credentials';
  passwordHash?: string;   // only for credentials provider
  createdAt: Date;
  updatedAt: Date;
}
```

#### Tenant

**Purpose:** Empresa/negocio do usuario (unidade de isolamento multi-tenant)

```typescript
interface Tenant {
  id: string;              // cuid
  name: string;
  document?: string;       // CNPJ or CPF (optional for informal)
  type: 'MEI' | 'ME' | 'EPP' | 'INFORMAL';
  plan: 'FREE' | 'STARTER' | 'GROWTH' | 'PRO';
  businessType?: string;   // servicos, comercio, alimentacao, beleza, outro
  monthlyRevenue?: string; // faixa de faturamento
  onboardingCompleted: boolean;
  address?: JsonValue;     // {street, number, complement, neighborhood, city, state, zip}
  phone?: string;
  email?: string;
  logo?: string;           // URL Supabase Storage
  createdAt: Date;
  updatedAt: Date;
}
```

#### UserTenant

**Purpose:** Relacao N:N entre User e Tenant com role

```typescript
interface UserTenant {
  id: string;
  userId: string;
  tenantId: string;
  role: 'OWNER' | 'ADMIN' | 'USER';
  isActive: boolean;       // tenant atualmente selecionado
  createdAt: Date;
}
```

#### Cliente

**Purpose:** Cliente do negocio (cadastro progressivo)

```typescript
interface Cliente {
  id: string;
  tenantId: string;
  name: string;            // obrigatorio
  phone: string;           // obrigatorio
  email?: string;
  document?: string;       // CPF or CNPJ
  address?: JsonValue;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Fornecedor

**Purpose:** Fornecedor do negocio

```typescript
interface Fornecedor {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  document?: string;
  address?: JsonValue;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Produto

**Purpose:** Produto ou servico comercializado

```typescript
interface Produto {
  id: string;
  tenantId: string;
  type: 'PRODUTO' | 'SERVICO';
  name: string;
  sellPrice: number;       // centavos
  costPrice?: number;      // centavos
  unit: string;            // un, kg, hr, srv, m, m2, etc
  barcode?: string;
  ncm?: string;            // Nomenclatura Comum do Mercosul
  description?: string;
  stockMin?: number;
  trackStock: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### FormaPagamento

**Purpose:** Formas de pagamento configuradas pelo tenant

```typescript
interface FormaPagamento {
  id: string;
  tenantId: string;
  name: string;
  type: 'PIX' | 'DINHEIRO' | 'DEBITO' | 'CREDITO' | 'BOLETO' | 'OUTRO';
  active: boolean;
  isDefault: boolean;
  installments: number;    // max parcelas (1 = a vista)
  fee: number;             // taxa percentual (centesimos: 250 = 2.50%)
  createdAt: Date;
}
```

#### ContaPagar

**Purpose:** Registro de contas a pagar

```typescript
interface ContaPagar {
  id: string;
  tenantId: string;
  description: string;
  amount: number;          // centavos
  dueDate: Date;
  paidDate?: Date;
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';
  category: string;
  supplierId?: string;
  notes?: string;
  recurrent: boolean;
  recurrenceType?: 'MENSAL' | 'SEMANAL' | 'QUINZENAL';
  createdAt: Date;
  updatedAt: Date;
}
```

#### ContaReceber

**Purpose:** Registro de contas a receber

```typescript
interface ContaReceber {
  id: string;
  tenantId: string;
  description: string;
  amount: number;          // centavos
  dueDate: Date;
  receivedDate?: Date;
  status: 'PENDENTE' | 'RECEBIDO' | 'VENCIDO' | 'CANCELADO';
  category: string;
  clientId?: string;
  saleId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Venda

**Purpose:** Registro de vendas

```typescript
interface VendaItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;       // centavos
  total: number;           // centavos
}

interface Venda {
  id: string;
  tenantId: string;
  clientId?: string;
  items: VendaItem[];      // JSONB
  subtotal: number;        // centavos
  discount: number;        // centavos
  total: number;           // centavos
  paymentMethodId: string;
  status: 'RASCUNHO' | 'CONFIRMADA' | 'CANCELADA';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Orcamento

**Purpose:** Registro de orcamentos

```typescript
interface Orcamento {
  id: string;
  tenantId: string;
  clientId?: string;
  items: VendaItem[];      // JSONB (mesmo formato de Venda)
  subtotal: number;
  discount: number;
  total: number;
  validUntil: Date;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'CONVERTIDO' | 'EXPIRADO';
  notes?: string;
  saleId?: string;         // FK quando convertido
  createdAt: Date;
  updatedAt: Date;
}
```

#### PixCharge

**Purpose:** Cobranca PIX via Mercado Pago

```typescript
interface PixCharge {
  id: string;
  tenantId: string;
  contaReceberId: string;
  externalId: string;      // ID Mercado Pago
  amount: number;          // centavos
  qrCode: string;          // base64 da imagem
  qrCodeText: string;      // copia-e-cola
  paymentLink: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  expiresAt: Date;
  paidAt?: Date;
  createdAt: Date;
}
```

#### NotaFiscal

**Purpose:** Documento fiscal emitido

```typescript
interface NotaFiscal {
  id: string;
  tenantId: string;
  type: 'NFE' | 'NFSE' | 'NFCE';
  saleId: string;
  numero?: number;
  serie?: string;
  chaveAcesso?: string;
  xmlUrl?: string;         // Supabase Storage
  pdfUrl?: string;
  status: 'PROCESSANDO' | 'AUTORIZADA' | 'REJEITADA' | 'CANCELADA';
  focusNfeId?: string;
  errorMessage?: string;
  emitidaEm?: Date;
  createdAt: Date;
}
```

#### ConfigFiscal

**Purpose:** Configuracao fiscal do tenant

```typescript
interface ConfigFiscal {
  id: string;
  tenantId: string;        // unique
  regimeTributario: 'MEI' | 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  certificateFileUrl?: string;
  certificatePassword?: string;  // encrypted
  certificateExpiry?: Date;
  ambiente: 'HOMOLOGACAO' | 'PRODUCAO';
  serieNFe: number;
  serieNFSe: number;
  serieNFCe: number;
  ultimoNumeroNFe: number;
  ultimoNumeroNFSe: number;
  ultimoNumeroNFCe: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### MovimentacaoEstoque

**Purpose:** Movimentacao de estoque

```typescript
interface MovimentacaoEstoque {
  id: string;
  tenantId: string;
  productId: string;
  type: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantity: number;
  reason: 'COMPRA' | 'VENDA' | 'AJUSTE_MANUAL';
  referenceId?: string;    // saleId, etc
  notes?: string;
  createdAt: Date;
}
```

#### WhatsAppMessage

**Purpose:** Registro de mensagens WhatsApp enviadas

```typescript
interface WhatsAppMessage {
  id: string;
  tenantId: string;
  clientId?: string;
  phone: string;
  type: 'COBRANCA' | 'NFE' | 'LEMBRETE' | 'ORCAMENTO';
  templateId: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  externalId?: string;
  errorMessage?: string;
  sentAt?: Date;
  createdAt: Date;
}
```

#### AuditLog

**Purpose:** Log de auditoria para LGPD e seguranca

```typescript
interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;          // 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT' etc
  entity: string;          // nome da tabela
  entityId?: string;
  changes?: JsonValue;     // {field: {old, new}}
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

---

## 5. API Specification

### 5.1 REST API Design

Todas as APIs seguem o padrao REST via Next.js App Router route handlers em `src/app/api/`.

**Convencoes:**
- Base URL: `/api/v1/`
- Nomenclatura: kebab-case (`/api/v1/contas-pagar`)
- Autenticacao: Bearer token JWT via NextAuth.js (header `Authorization`)
- Tenant: Inferido da sessao (middleware injeta `tenantId`)
- Paginacao: `?page=1&limit=20` (default: page=1, limit=20)
- Filtros: Query params (`?status=PENDENTE&category=Aluguel`)
- Ordenacao: `?sort=createdAt&order=desc`
- Response format: JSON com envelope `{ data, meta?, error? }`

**Endpoints por modulo:**

```
# Auth
POST   /api/auth/[...nextauth]     # NextAuth.js handler (Google OAuth + credentials)

# Health
GET    /api/health                  # Health check

# Tenants
POST   /api/v1/tenants              # Criar tenant (onboarding)
GET    /api/v1/tenants              # Listar tenants do usuario
PATCH  /api/v1/tenants/:id          # Atualizar tenant
POST   /api/v1/tenants/:id/switch   # Alternar tenant ativo

# Clientes
GET    /api/v1/clientes             # Listar (paginado, filtros, busca)
POST   /api/v1/clientes             # Criar
GET    /api/v1/clientes/:id         # Detalhe
PATCH  /api/v1/clientes/:id         # Atualizar
DELETE /api/v1/clientes/:id         # Soft delete
POST   /api/v1/clientes/import      # Importar contatos em batch

# Fornecedores
GET    /api/v1/fornecedores         # Listar
POST   /api/v1/fornecedores         # Criar
GET    /api/v1/fornecedores/:id     # Detalhe
PATCH  /api/v1/fornecedores/:id     # Atualizar
DELETE /api/v1/fornecedores/:id     # Soft delete

# Produtos
GET    /api/v1/produtos             # Listar
POST   /api/v1/produtos             # Criar
GET    /api/v1/produtos/:id         # Detalhe
PATCH  /api/v1/produtos/:id         # Atualizar
DELETE /api/v1/produtos/:id         # Soft delete

# Formas de Pagamento
GET    /api/v1/formas-pagamento     # Listar
POST   /api/v1/formas-pagamento     # Criar
PATCH  /api/v1/formas-pagamento/:id # Atualizar

# Financeiro - Contas a Pagar
GET    /api/v1/contas-pagar         # Listar (filtros: status, periodo, categoria)
POST   /api/v1/contas-pagar         # Criar
GET    /api/v1/contas-pagar/:id     # Detalhe
PATCH  /api/v1/contas-pagar/:id     # Atualizar
POST   /api/v1/contas-pagar/:id/pay # Marcar como pago

# Financeiro - Contas a Receber
GET    /api/v1/contas-receber       # Listar
POST   /api/v1/contas-receber       # Criar
GET    /api/v1/contas-receber/:id   # Detalhe
PATCH  /api/v1/contas-receber/:id   # Atualizar
POST   /api/v1/contas-receber/:id/receive  # Marcar como recebido

# Dashboard Financeiro
GET    /api/v1/dashboard            # Dashboard semaforo (saldo, fluxo, alertas)
GET    /api/v1/dashboard/withdrawal # "Quanto posso retirar?"

# Vendas
GET    /api/v1/vendas               # Listar
POST   /api/v1/vendas               # Criar venda
GET    /api/v1/vendas/:id           # Detalhe
POST   /api/v1/vendas/:id/cancel    # Cancelar

# Orcamentos
GET    /api/v1/orcamentos           # Listar
POST   /api/v1/orcamentos           # Criar
GET    /api/v1/orcamentos/:id       # Detalhe
PATCH  /api/v1/orcamentos/:id       # Atualizar
POST   /api/v1/orcamentos/:id/convert  # Converter em venda
POST   /api/v1/orcamentos/:id/duplicate # Duplicar

# PIX
POST   /api/v1/pix/charge           # Gerar cobranca PIX
GET    /api/v1/pix/charge/:id       # Status da cobranca
POST   /api/v1/pix/charge/:id/cancel # Cancelar cobranca

# Fiscal
GET    /api/v1/notas-fiscais        # Listar notas emitidas
POST   /api/v1/notas-fiscais/nfe    # Emitir NFe
POST   /api/v1/notas-fiscais/nfse   # Emitir NFSe
POST   /api/v1/notas-fiscais/nfce   # Emitir NFCe
GET    /api/v1/notas-fiscais/:id    # Detalhe + status
POST   /api/v1/notas-fiscais/:id/cancel  # Cancelar nota
GET    /api/v1/config-fiscal        # Ler config fiscal
PUT    /api/v1/config-fiscal        # Salvar config fiscal
POST   /api/v1/config-fiscal/certificate # Upload certificado A1

# Estoque
GET    /api/v1/estoque              # Listar produtos com saldo
GET    /api/v1/estoque/:productId   # Historico movimentacoes de produto
POST   /api/v1/estoque/entrada      # Registrar entrada
POST   /api/v1/estoque/ajuste       # Ajuste manual

# WhatsApp
POST   /api/v1/whatsapp/send        # Enviar mensagem
GET    /api/v1/whatsapp/messages     # Historico de mensagens
GET    /api/v1/whatsapp/config       # Config lembretes
PUT    /api/v1/whatsapp/config       # Salvar config lembretes

# Webhooks (publicos, sem auth de sessao - validacao por assinatura)
POST   /api/webhooks/mercadopago    # Webhook Mercado Pago (PIX)
POST   /api/webhooks/whatsapp       # Webhook WhatsApp (status entrega)
POST   /api/webhooks/focusnfe       # Webhook Focus NFe (status nota)

# Configuracoes
GET    /api/v1/settings             # Configuracoes do tenant
PATCH  /api/v1/settings             # Atualizar configuracoes
```

### 5.2 Response Format

```typescript
// Sucesso (item unico)
interface ApiResponse<T> {
  data: T;
}

// Sucesso (lista paginada)
interface ApiListResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Erro
interface ApiErrorResponse {
  error: {
    code: string;          // 'VALIDATION_ERROR', 'NOT_FOUND', 'UNAUTHORIZED', etc
    message: string;       // mensagem legivel para o usuario
    details?: Record<string, string[]>; // erros por campo (validacao)
    timestamp: string;
    requestId: string;
  };
}
```

---

## 6. Components

### 6.1 Core Components

#### Auth Module (`src/core/auth/`)
**Responsibility:** Autenticacao, sessoes, middleware de protecao de rotas
**Key Interfaces:** `getCurrentUser()`, `requireAuth()`, `authMiddleware`
**Dependencies:** NextAuth.js, Prisma (User model)
**Technology:** NextAuth.js v5, JWT, Google OAuth

#### Tenant Module (`src/core/tenant/`)
**Responsibility:** Gestao multi-tenant, RLS, planos e limites
**Key Interfaces:** `getCurrentTenant()`, `tenantMiddleware`, `checkPlanLimit()`
**Dependencies:** Prisma (Tenant, UserTenant), Auth Module
**Technology:** Prisma Client Extension (auto tenant_id filter), PostgreSQL RLS

#### Event Bus (`src/core/events/`)
**Responsibility:** Comunicacao entre modulos via eventos internos
**Key Interfaces:** `emit(event, payload)`, `on(event, handler)`
**Dependencies:** Nenhuma externa
**Technology:** Node.js EventEmitter (sync para MVP, migravel para Redis Pub/Sub)

### 6.2 Domain Modules

#### Cadastros Module (`src/modules/cadastros/`)
**Responsibility:** CRUD de Clientes, Fornecedores, Produtos, Formas de Pagamento
**Key Interfaces:** `clienteService`, `fornecedorService`, `produtoService`, `formaPagamentoService`
**Dependencies:** Tenant Module, Prisma
**Events emitted:** nenhum

#### Financeiro Module (`src/modules/financeiro/`)
**Responsibility:** Contas a pagar/receber, fluxo de caixa, dashboard semaforo, alertas
**Key Interfaces:** `contaPagarService`, `contaReceberService`, `dashboardService`, `alertaService`
**Dependencies:** Tenant Module, Cadastros Module (fornecedores, clientes), Prisma
**Events consumed:** `venda.confirmada` → cria conta a receber, `pix.paid` → baixa conta a receber

#### Vendas Module (`src/modules/vendas/`)
**Responsibility:** Vendas rapidas, orcamentos, conversao orcamento→venda
**Key Interfaces:** `vendaService`, `orcamentoService`
**Dependencies:** Tenant Module, Cadastros Module (clientes, produtos), Prisma
**Events emitted:** `venda.confirmada`, `venda.cancelada`

#### Fiscal Module (`src/modules/fiscal/`)
**Responsibility:** Emissao NFe/NFSe/NFCe, config fiscal, certificado digital
**Key Interfaces:** `notaFiscalService`, `configFiscalService`
**Dependencies:** Tenant Module, Vendas Module, Focus NFe Integration, BullMQ
**Events consumed:** `venda.confirmada` (para auto-emissao NFCe quando configurado)

#### Estoque Module (`src/modules/estoque/`)
**Responsibility:** Movimentacoes de estoque, saldos, alertas de minimo
**Key Interfaces:** `estoqueService`, `movimentacaoService`
**Dependencies:** Tenant Module, Cadastros Module (produtos), Prisma
**Events consumed:** `venda.confirmada` → baixa estoque

### 6.3 Integration Components

#### PIX Integration (`src/integrations/pix/`)
**Responsibility:** Mercado Pago API - cobranca PIX, webhook, conciliacao
**Key Interfaces:** `pixService.createCharge()`, `pixService.processWebhook()`
**Dependencies:** Mercado Pago API, BullMQ, Financeiro Module
**Events emitted:** `pix.paid`, `pix.expired`

#### WhatsApp Integration (`src/integrations/whatsapp/`)
**Responsibility:** Envio de mensagens WhatsApp, lembretes automaticos
**Key Interfaces:** `whatsappService.send()`, `reminderJob`
**Dependencies:** WhatsApp Business API, BullMQ, Financeiro Module
**Events consumed:** `nfe.autorizada` → notifica cliente

#### Fiscal API Integration (`src/integrations/fiscal-api/`)
**Responsibility:** Adapter para Focus NFe API
**Key Interfaces:** `focusNfeClient.emitNFe()`, `focusNfeClient.emitNFSe()`, `focusNfeClient.emitNFCe()`
**Dependencies:** Focus NFe API, BullMQ
**Events emitted:** `nfe.autorizada`, `nfe.rejeitada`

### 6.4 Component Interaction Diagram

```mermaid
sequenceDiagram
    participant U as Usuario
    participant V as Vendas Module
    participant E as Event Bus
    participant F as Financeiro Module
    participant S as Estoque Module
    participant P as PIX Integration
    participant N as Fiscal Module
    participant W as WhatsApp Integration

    U->>V: Confirmar Venda
    V->>V: Salvar venda (status: CONFIRMADA)
    V->>E: emit('venda.confirmada', {venda})

    par Financeiro
        E->>F: on('venda.confirmada')
        F->>F: Criar ContaReceber
    and Estoque
        E->>S: on('venda.confirmada')
        S->>S: Criar MovimentacaoEstoque (SAIDA)
    end

    U->>P: Gerar PIX
    P->>P: Mercado Pago API → PixCharge
    P-->>U: QR Code + Link

    Note over P: Webhook async
    P->>E: emit('pix.paid', {charge})
    E->>F: on('pix.paid')
    F->>F: Baixar ContaReceber

    U->>N: Emitir NFe
    N->>N: BullMQ → Focus NFe API
    N->>E: emit('nfe.autorizada', {nota})
    E->>W: on('nfe.autorizada')
    W->>W: BullMQ → WhatsApp API → Cliente
```

---

## 7. External APIs

### 7.1 Focus NFe API

- **Purpose:** Emissao de documentos fiscais eletronicos (NFe, NFSe Nacional, NFCe)
- **Documentation:** https://focusnfe.com.br/doc/
- **Base URL(s):** `https://homologacao.focusnfe.com.br/v2/` (homologacao) / `https://api.focusnfe.com.br/v2/` (producao)
- **Authentication:** HTTP Basic Auth (token como username, vazio como password)
- **Rate Limits:** Variam por plano Focus NFe (tipicamente 60 req/min)

**Key Endpoints Used:**
- `POST /nfe` - Emitir NFe (produto)
- `GET /nfe/{ref}` - Consultar status NFe
- `DELETE /nfe/{ref}` - Cancelar NFe
- `POST /nfse` - Emitir NFSe Nacional
- `GET /nfse/{ref}` - Consultar status NFSe
- `POST /nfce` - Emitir NFCe (consumidor)
- `GET /nfce/{ref}` - Consultar status NFCe

**Integration Notes:** Emissao sempre assincrona via BullMQ. Circuit breaker com 3 falhas consecutivas. Retry com backoff exponencial (1s, 5s, 30s). Webhook configuravel para receber status de autorizacao/rejeicao.

### 7.2 Mercado Pago API

- **Purpose:** Geracao de cobrancas PIX, QR codes, e recebimento de webhooks de pagamento
- **Documentation:** https://www.mercadopago.com.br/developers/pt/reference
- **Base URL(s):** `https://api.mercadopago.com`
- **Authentication:** Bearer token (Access Token em env var)
- **Rate Limits:** Variam; geralmente ate 1000 req/min com access token

**Key Endpoints Used:**
- `POST /v1/payments` - Criar cobranca PIX (payment_method_id: "pix")
- `GET /v1/payments/{id}` - Consultar status pagamento
- `POST /v1/payments/{id}/refunds` - Estornar pagamento

**Integration Notes:** Webhook URL registrada no dashboard Mercado Pago. Validacao de assinatura HMAC em cada webhook recebido. Cobrancas PIX com expiracao de 24h default. QR code e copia-e-cola retornados no response de criacao.

### 7.3 WhatsApp Business API

- **Purpose:** Envio de mensagens transacionais (cobranca, NFe, lembretes) para clientes
- **Documentation:** Dependente do provedor (Wati / Evolution API / Meta Cloud API)
- **Base URL(s):** Configuravel via env var
- **Authentication:** API Key ou Bearer token (dependente do provedor)
- **Rate Limits:** Meta: 1000 msgs/s (business initiated), Wati: variam por plano

**Key Endpoints Used:**
- `POST /messages` - Enviar mensagem template
- `GET /messages/{id}` - Status de entrega

**Integration Notes:** Provedor abstrato via adapter pattern - troca de provedor sem impacto no sistema. Mensagens sempre via BullMQ queue. Templates pre-aprovados pelo WhatsApp Business. Webhook para status de entrega (sent/delivered/read/failed).

---

## 8. Core Workflows

### 8.1 Fluxo de Venda Completa (Venda → PIX → NFe → WhatsApp)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant App as Next.js App
    participant DB as PostgreSQL
    participant MP as Mercado Pago
    participant FN as Focus NFe
    participant WA as WhatsApp API
    participant Q as BullMQ

    U->>App: Criar Venda (produto + cliente + PIX)
    App->>DB: INSERT Venda (status: CONFIRMADA)
    App->>DB: INSERT ContaReceber (status: PENDENTE)
    App->>DB: INSERT MovimentacaoEstoque (SAIDA)
    App->>MP: POST /v1/payments (PIX)
    MP-->>App: QR Code + copia-e-cola + link
    App->>DB: INSERT PixCharge
    App-->>U: Tela com QR Code

    U->>U: Compartilha link PIX via WhatsApp

    Note over MP: Cliente paga PIX
    MP->>App: POST /api/webhooks/mercadopago
    App->>App: Valida assinatura webhook
    App->>DB: UPDATE PixCharge (PAID)
    App->>DB: UPDATE ContaReceber (RECEBIDO)
    App-->>U: Push notification "R$ X recebido!"

    U->>App: Emitir NFe
    App->>Q: Enfileira job NFe
    Q->>FN: POST /nfe (dados da venda)
    FN-->>Q: NFe autorizada
    Q->>DB: INSERT NotaFiscal (AUTORIZADA)
    Q->>Q: Enfileira job WhatsApp
    Q->>WA: POST /messages (template NFe)
    WA-->>Q: Mensagem enviada
    Q->>DB: INSERT WhatsAppMessage
```

### 8.2 Fluxo de Autenticacao e Multi-Tenant

```mermaid
sequenceDiagram
    actor U as Usuario
    participant App as Next.js
    participant Auth as NextAuth.js
    participant Google as Google OAuth
    participant DB as PostgreSQL
    participant MW as Edge Middleware

    U->>App: Acessa /login
    U->>Auth: Click "Entrar com Google"
    Auth->>Google: Redirect OAuth
    Google-->>Auth: Token + profile
    Auth->>DB: Upsert User
    Auth->>DB: Query UserTenant
    alt Primeiro acesso (sem tenant)
        Auth-->>App: Redirect /onboarding
        U->>App: Completa wizard 5 perguntas
        App->>DB: INSERT Tenant + UserTenant (OWNER)
        App-->>U: Redirect /dashboard
    else Ja tem tenant(s)
        Auth-->>App: Redirect /dashboard
    end

    Note over MW: Toda request subsequente
    U->>MW: Request qualquer rota
    MW->>MW: Valida JWT token
    MW->>MW: Extrai tenantId da sessao
    MW->>App: Request com tenantId no context
    App->>DB: Query com RLS (tenant_id filter)
```

---

## 9. Database Schema

### 9.1 Prisma Schema

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
  extensions = [pgcrypto]
}

// ==================== AUTH ====================

model User {
  id           String       @id @default(cuid())
  email        String       @unique
  name         String
  image        String?
  provider     String       @default("google") // google | credentials
  passwordHash String?
  tenants      UserTenant[]
  auditLogs    AuditLog[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@map("users")
}

model UserTenant {
  id        String   @id @default(cuid())
  userId    String
  tenantId  String
  role      String   @default("OWNER") // OWNER | ADMIN | USER
  isActive  Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, tenantId])
  @@map("user_tenants")
}

// ==================== TENANT ====================

model Tenant {
  id                   String              @id @default(cuid())
  name                 String
  document             String?
  type                 String              @default("INFORMAL") // MEI | ME | EPP | INFORMAL
  plan                 String              @default("FREE") // FREE | STARTER | GROWTH | PRO
  businessType         String?
  monthlyRevenue       String?
  onboardingCompleted  Boolean             @default(false)
  address              Json?
  phone                String?
  email                String?
  logo                 String?
  users                UserTenant[]
  clientes             Cliente[]
  fornecedores         Fornecedor[]
  produtos             Produto[]
  formasPagamento      FormaPagamento[]
  contasPagar          ContaPagar[]
  contasReceber        ContaReceber[]
  vendas               Venda[]
  orcamentos           Orcamento[]
  pixCharges           PixCharge[]
  notasFiscais         NotaFiscal[]
  configFiscal         ConfigFiscal?
  movimentacoesEstoque MovimentacaoEstoque[]
  whatsappMessages     WhatsAppMessage[]
  auditLogs            AuditLog[]
  reminderConfig       ReminderConfig?
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt

  @@map("tenants")
}

// ==================== CADASTROS ====================

model Cliente {
  id             String         @id @default(cuid())
  tenantId       String
  name           String
  phone          String
  email          String?
  document       String?
  address        Json?
  notes          String?
  tenant         Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  contasReceber  ContaReceber[]
  vendas         Venda[]
  orcamentos     Orcamento[]
  whatsappMessages WhatsAppMessage[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([tenantId, name])
  @@index([tenantId, phone])
  @@index([tenantId, document])
  @@map("clientes")
}

model Fornecedor {
  id           String       @id @default(cuid())
  tenantId     String
  name         String
  phone        String?
  email        String?
  document     String?
  address      Json?
  notes        String?
  tenant       Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  contasPagar  ContaPagar[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([tenantId, name])
  @@map("fornecedores")
}

model Produto {
  id                   String              @id @default(cuid())
  tenantId             String
  type                 String              @default("PRODUTO") // PRODUTO | SERVICO
  name                 String
  sellPrice            Int                 // centavos
  costPrice            Int?                // centavos
  unit                 String              @default("un")
  barcode              String?
  ncm                  String?
  description          String?
  stockMin             Int?
  trackStock           Boolean             @default(true)
  active               Boolean             @default(true)
  tenant               Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  movimentacoesEstoque MovimentacaoEstoque[]
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt

  @@index([tenantId, name])
  @@index([tenantId, barcode])
  @@map("produtos")
}

model FormaPagamento {
  id           String   @id @default(cuid())
  tenantId     String
  name         String
  type         String   // PIX | DINHEIRO | DEBITO | CREDITO | BOLETO | OUTRO
  active       Boolean  @default(true)
  isDefault    Boolean  @default(false)
  installments Int      @default(1)
  fee          Int      @default(0) // centesimos (250 = 2.50%)
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())

  @@index([tenantId])
  @@map("formas_pagamento")
}

// ==================== FINANCEIRO ====================

model ContaPagar {
  id             String      @id @default(cuid())
  tenantId       String
  description    String
  amount         Int         // centavos
  dueDate        DateTime
  paidDate       DateTime?
  status         String      @default("PENDENTE") // PENDENTE | PAGO | VENCIDO | CANCELADO
  category       String
  supplierId     String?
  notes          String?
  recurrent      Boolean     @default(false)
  recurrenceType String?     // MENSAL | SEMANAL | QUINZENAL
  tenant         Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  supplier       Fornecedor? @relation(fields: [supplierId], references: [id])
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@index([tenantId, status])
  @@index([tenantId, dueDate])
  @@index([tenantId, category])
  @@map("contas_pagar")
}

model ContaReceber {
  id           String      @id @default(cuid())
  tenantId     String
  description  String
  amount       Int         // centavos
  dueDate      DateTime
  receivedDate DateTime?
  status       String      @default("PENDENTE") // PENDENTE | RECEBIDO | VENCIDO | CANCELADO
  category     String      @default("Vendas")
  clientId     String?
  saleId       String?
  notes        String?
  tenant       Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client       Cliente?    @relation(fields: [clientId], references: [id])
  sale         Venda?      @relation(fields: [saleId], references: [id])
  pixCharges   PixCharge[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([tenantId, status])
  @@index([tenantId, dueDate])
  @@map("contas_receber")
}

// ==================== VENDAS ====================

model Venda {
  id              String         @id @default(cuid())
  tenantId        String
  clientId        String?
  items           Json           // VendaItem[]
  subtotal        Int            // centavos
  discount        Int            @default(0) // centavos
  total           Int            // centavos
  paymentMethodId String
  status          String         @default("RASCUNHO") // RASCUNHO | CONFIRMADA | CANCELADA
  notes           String?
  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client          Cliente?       @relation(fields: [clientId], references: [id])
  contasReceber   ContaReceber[]
  notasFiscais    NotaFiscal[]
  orcamentoOrigem Orcamento?     @relation("OrcamentoVenda")
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([tenantId, status])
  @@index([tenantId, createdAt])
  @@map("vendas")
}

model Orcamento {
  id         String   @id @default(cuid())
  tenantId   String
  clientId   String?
  items      Json     // VendaItem[]
  subtotal   Int      // centavos
  discount   Int      @default(0)
  total      Int      // centavos
  validUntil DateTime
  status     String   @default("PENDENTE") // PENDENTE | APROVADO | RECUSADO | CONVERTIDO | EXPIRADO
  notes      String?
  saleId     String?  @unique
  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client     Cliente? @relation(fields: [clientId], references: [id])
  sale       Venda?   @relation("OrcamentoVenda", fields: [saleId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([tenantId, status])
  @@map("orcamentos")
}

// ==================== PIX ====================

model PixCharge {
  id              String       @id @default(cuid())
  tenantId        String
  contaReceberId  String
  externalId      String       // Mercado Pago ID
  amount          Int          // centavos
  qrCode          String       // base64
  qrCodeText      String       // copia-e-cola
  paymentLink     String
  status          String       @default("PENDING") // PENDING | PAID | EXPIRED | CANCELLED
  expiresAt       DateTime
  paidAt          DateTime?
  tenant          Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  contaReceber    ContaReceber @relation(fields: [contaReceberId], references: [id])
  createdAt       DateTime     @default(now())

  @@index([tenantId])
  @@index([externalId])
  @@map("pix_charges")
}

// ==================== FISCAL ====================

model NotaFiscal {
  id           String    @id @default(cuid())
  tenantId     String
  type         String    // NFE | NFSE | NFCE
  saleId       String
  numero       Int?
  serie        String?
  chaveAcesso  String?
  xmlUrl       String?
  pdfUrl       String?
  status       String    @default("PROCESSANDO") // PROCESSANDO | AUTORIZADA | REJEITADA | CANCELADA
  focusNfeId   String?
  errorMessage String?
  emitidaEm    DateTime?
  tenant       Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  sale         Venda     @relation(fields: [saleId], references: [id])
  createdAt    DateTime  @default(now())

  @@index([tenantId, type])
  @@index([tenantId, status])
  @@index([focusNfeId])
  @@map("notas_fiscais")
}

model ConfigFiscal {
  id                  String    @id @default(cuid())
  tenantId            String    @unique
  regimeTributario    String    @default("SIMPLES_NACIONAL")
  inscricaoEstadual   String?
  inscricaoMunicipal  String?
  certificateFileUrl  String?
  certificatePassword String?   // encrypted
  certificateExpiry   DateTime?
  ambiente            String    @default("HOMOLOGACAO") // HOMOLOGACAO | PRODUCAO
  serieNFe            Int       @default(1)
  serieNFSe           Int       @default(1)
  serieNFCe           Int       @default(1)
  ultimoNumeroNFe     Int       @default(0)
  ultimoNumeroNFSe    Int       @default(0)
  ultimoNumeroNFCe    Int       @default(0)
  tenant              Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@map("config_fiscal")
}

// ==================== ESTOQUE ====================

model MovimentacaoEstoque {
  id          String   @id @default(cuid())
  tenantId    String
  productId   String
  type        String   // ENTRADA | SAIDA | AJUSTE
  quantity    Int
  reason      String   // COMPRA | VENDA | AJUSTE_MANUAL
  referenceId String?
  notes       String?
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  product     Produto  @relation(fields: [productId], references: [id])
  createdAt   DateTime @default(now())

  @@index([tenantId, productId])
  @@map("movimentacoes_estoque")
}

// ==================== WHATSAPP ====================

model WhatsAppMessage {
  id           String   @id @default(cuid())
  tenantId     String
  clientId     String?
  phone        String
  type         String   // COBRANCA | NFE | LEMBRETE | ORCAMENTO
  templateId   String
  status       String   @default("QUEUED") // QUEUED | SENT | DELIVERED | READ | FAILED
  externalId   String?
  errorMessage String?
  sentAt       DateTime?
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client       Cliente? @relation(fields: [clientId], references: [id])
  createdAt    DateTime @default(now())

  @@index([tenantId, type])
  @@map("whatsapp_messages")
}

model ReminderConfig {
  id              String  @id @default(cuid())
  tenantId        String  @unique
  enabled         Boolean @default(true)
  daysBefore      Int     @default(3)
  onDueDate       Boolean @default(true)
  daysAfter       Int     @default(1)
  tenant          Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("reminder_configs")
}

// ==================== AUDIT ====================

model AuditLog {
  id        String   @id @default(cuid())
  tenantId  String
  userId    String
  action    String
  entity    String
  entityId  String?
  changes   Json?
  ipAddress String?
  userAgent String?
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

  @@index([tenantId, entity])
  @@index([tenantId, createdAt])
  @@map("audit_logs")
}
```

### 9.2 Row-Level Security (RLS)

RLS policies aplicadas via migration SQL (nao gerenciadas pelo Prisma):

```sql
-- Habilitar RLS em todas as tabelas de dados
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE formas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pix_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_fiscal ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_configs ENABLE ROW LEVEL SECURITY;

-- Policy padrao: tenant_id must match current setting
-- Set via: SET app.current_tenant_id = 'tenant_cuid';
CREATE POLICY tenant_isolation ON clientes
  USING (tenant_id = current_setting('app.current_tenant_id', true));
-- (repetir para todas as tabelas acima)
```

**Prisma Client Extension** para auto-inject tenant_id:

```typescript
// src/lib/prisma.ts
const prismaWithTenant = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query, model }) {
        // Skip models without tenantId (User, UserTenant)
        if (['User', 'UserTenant'].includes(model)) return query(args);

        const tenantId = getTenantIdFromContext();
        if (!tenantId) throw new Error('Tenant context required');

        // Inject tenantId in where clauses and create data
        // ... implementation details
        return query(args);
      },
    },
  },
});
```

---

## 10. Unified Project Structure

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

## 11. Development Workflow

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

## 12. Deployment Architecture

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

## 13. Security and Performance

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

## 14. Testing Strategy

### 14.1 Testing Pyramid

```
         E2E (Playwright)
        /        \
   Integration (Vitest + Prisma)
  /            \
Unit (Vitest)   Component (Vitest + RTL)
```

### 14.2 Coverage Targets

| Module | Unit | Integration | E2E |
|--------|------|-------------|-----|
| core/auth | 80% | Fluxo OAuth completo | Login + onboarding |
| core/tenant | 80% | RLS isolation test | Alternar empresa |
| modules/financeiro | 80% | Fluxo pagar/receber | Dashboard semaforo |
| modules/vendas | 70% | Venda → financeiro | Quick sale flow |
| modules/fiscal | 70% | Emissao NFe mock | - |
| integrations/pix | 70% | Webhook processing | Gerar PIX |
| UI components | - | - | Fluxos criticos |

### 14.3 Test Examples

**Unit Test (Service):**
```typescript
// tests/unit/modules/financeiro/dashboard.service.test.ts
import { describe, it, expect } from 'vitest';
import { calcularSemaforo } from '@/modules/financeiro/dashboard.service';

describe('calcularSemaforo', () => {
  it('retorna VERDE quando saldo cobre 30+ dias', () => {
    const result = calcularSemaforo({
      saldoAtual: 10000_00, // R$ 10.000
      mediaDespesasDiarias: 200_00, // R$ 200/dia
    });
    expect(result).toBe('VERDE'); // 10000/200 = 50 dias
  });

  it('retorna VERMELHO quando saldo negativo', () => {
    const result = calcularSemaforo({
      saldoAtual: -500_00,
      mediaDespesasDiarias: 200_00,
    });
    expect(result).toBe('VERMELHO');
  });
});
```

**Integration Test (API):**
```typescript
// tests/integration/api/clientes.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createTestContext } from '../helpers';

describe('POST /api/v1/clientes', () => {
  const ctx = createTestContext();

  it('cria cliente com campos minimos', async () => {
    const res = await ctx.api.post('/api/v1/clientes', {
      name: 'Joao Silva',
      phone: '11999998888',
    });
    expect(res.status).toBe(201);
    expect(res.data.data.name).toBe('Joao Silva');
    expect(res.data.data.tenantId).toBe(ctx.tenantId);
  });

  it('rejeita cliente sem nome', async () => {
    const res = await ctx.api.post('/api/v1/clientes', { phone: '11999998888' });
    expect(res.status).toBe(400);
    expect(res.data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

**E2E Test:**
```typescript
// tests/e2e/venda.spec.ts
import { test, expect } from '@playwright/test';

test('fluxo completo: cadastrar produto e realizar venda', async ({ page }) => {
  await page.goto('/cadastros/produtos');
  await page.click('[data-testid="novo-produto"]');
  await page.fill('[name="name"]', 'Corte de Cabelo');
  await page.fill('[name="sellPrice"]', '50,00');
  await page.click('[data-testid="salvar"]');
  await expect(page.getByText('Produto salvo')).toBeVisible();

  await page.goto('/vendas/nova');
  await page.fill('[data-testid="busca-produto"]', 'Corte');
  await page.click('[data-testid="produto-Corte de Cabelo"]');
  await page.click('[data-testid="confirmar-venda"]');
  await expect(page.getByText('Venda confirmada')).toBeVisible();
  await expect(page.getByText('R$ 50,00')).toBeVisible();
});
```

---

## 15. Coding Standards

### 15.1 Critical Fullstack Rules

- **Tenant Isolation:** NUNCA fazer query sem tenant context. Usar sempre o Prisma client com extensao de tenant. Queries manuais SQL devem incluir `WHERE tenant_id =`.
- **Monetary Values:** SEMPRE armazenar em centavos (inteiros). Nunca usar float/decimal para dinheiro. Formatar para exibicao com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- **API Validation:** TODA API route deve validar input com Zod schema antes de processar. Nunca confiar em dados do client.
- **Error Handling:** Todas as API routes devem usar o wrapper `apiHandler()` que trata erros e retorna formato padrao. Nunca expor stack traces para o client.
- **Environment Variables:** Acessar APENAS via `src/lib/env.ts` (Zod-validated). Nunca `process.env.X` diretamente no codigo.
- **Server vs Client:** Componentes sao Server Components por padrao. Usar `'use client'` SOMENTE quando necessario (interatividade, hooks de browser, event handlers).
- **Async Operations:** NFe, WhatsApp, PIX webhook processing SEMPRE via BullMQ queue. Nunca processar sync na API route.
- **Audit Trail:** Operacoes criticas (criar/editar/deletar financeiro, fiscal, vendas) devem chamar `auditLog()`.
- **TypeScript Strict:** `strict: true` no tsconfig. Nunca usar `any` - usar `unknown` com type narrowing.
- **Date/Time:** Armazenar sempre em UTC no banco. Converter para `America/Sao_Paulo` apenas na apresentacao. Usar `date-fns` com locale `pt-BR`.

### 15.2 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components (React) | PascalCase | `DashboardSemaforo.tsx` |
| Hooks | camelCase com 'use' | `useTenant.ts` |
| Services | kebab-case | `conta-pagar.service.ts` |
| API Routes | kebab-case | `/api/v1/contas-pagar` |
| Database Tables | snake_case | `contas_pagar` |
| TypeScript Types/Interfaces | PascalCase | `ContaPagar` |
| Constants | UPPER_SNAKE_CASE | `MAX_FREE_SALES` |
| Zod Schemas | camelCase + Schema | `createClienteSchema` |
| Environment Variables | UPPER_SNAKE_CASE | `DATABASE_URL` |
| CSS Classes | Tailwind utilities | `className="flex items-center"` |
| Event Names | dot.notation | `venda.confirmada` |

---

## 16. Error Handling Strategy

### 16.1 Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    timestamp: string;
    requestId: string;
  };
}
```

### 16.2 Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `VALIDATION_ERROR` | 400 | Input nao passou na validacao Zod |
| `UNAUTHORIZED` | 401 | Sem sessao valida |
| `FORBIDDEN` | 403 | Sem permissao para a operacao |
| `NOT_FOUND` | 404 | Recurso nao encontrado |
| `CONFLICT` | 409 | Conflito (ex: duplicata) |
| `PLAN_LIMIT` | 403 | Limite do plano atingido |
| `EXTERNAL_API_ERROR` | 502 | Erro na integracao externa |
| `INTERNAL_ERROR` | 500 | Erro inesperado (logado no Sentry) |

### 16.3 Backend Error Handler

```typescript
// src/lib/api-handler.ts
export function apiHandler(handler: ApiRouteHandler) {
  return async (req: NextRequest, ctx: RouteContext) => {
    const requestId = crypto.randomUUID();
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({
          error: { code: 'VALIDATION_ERROR', message: 'Dados invalidos', details: formatZodErrors(error), timestamp: new Date().toISOString(), requestId }
        }, { status: 400 });
      }
      if (error instanceof AppError) {
        return NextResponse.json({
          error: { code: error.code, message: error.message, timestamp: new Date().toISOString(), requestId }
        }, { status: error.statusCode });
      }
      logger.error({ err: error, requestId }, 'Unhandled error');
      Sentry.captureException(error);
      return NextResponse.json({
        error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor', timestamp: new Date().toISOString(), requestId }
      }, { status: 500 });
    }
  };
}
```

---

## 17. Monitoring and Observability

### 17.1 Monitoring Stack

- **Frontend Monitoring:** Sentry (errors + performance traces) + PostHog (user analytics)
- **Backend Monitoring:** Sentry (API errors) + Vercel Analytics (function metrics)
- **Error Tracking:** Sentry com alertas para erros novos e regressoes
- **Performance Monitoring:** Vercel Speed Insights (Core Web Vitals) + Sentry Performance

### 17.2 Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- FCP < 1.5s (meta)
- JavaScript errors por rota
- PWA install rate

**Backend Metrics:**
- Request rate por endpoint
- Error rate (4xx, 5xx)
- Response time p50/p95/p99
- BullMQ queue depth e job failure rate

**Business Metrics (PostHog):**
- DAU/MAU
- Time to Value (cadastro → primeira venda)
- Activation Rate (3 acoes-chave na primeira semana)
- Onboarding completion rate
- Feature adoption (PIX, NFe, WhatsApp)
- Churn indicators

---

## 18. Checklist Results Report

*A ser executado antes da aprovacao final. Executar checklist `architect-checklist.md` e documentar resultados aqui.*
