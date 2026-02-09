# ERPsb

**O ERP que cresce com voce - do primeiro PIX ao primeiro milhao.**

ERPsb e um sistema ERP SaaS **mobile-first** para **nanoempreendedores, MEIs e microempresas brasileiras** que hoje controlam seus negocios com papel, planilha e WhatsApp. Simplicidade radical: mais facil que planilha, entrega valor desde o primeiro dia.

**Producao:** [erpsb.vercel.app](https://erpsb.vercel.app) | **Versao atual:** v1.2.1

---

## Indice

- [O que e](#o-que-e)
- [Funcionalidades](#funcionalidades)
- [Stack tecnologica](#stack-tecnologica)
- [Arquitetura](#arquitetura)
- [Pre-requisitos](#pre-requisitos)
- [Instalacao local](#instalacao-local)
- [Variaveis de ambiente](#variaveis-de-ambiente)
- [Rodando o projeto](#rodando-o-projeto)
- [Banco de dados](#banco-de-dados)
- [Testes](#testes)
- [Deploy em producao (Vercel)](#deploy-em-producao-vercel)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Modulos](#modulos)
- [API](#api)
- [Licenca](#licenca)

---

## O que e

O ERPsb resolve um problema real: **29% das pequenas empresas fecham nos primeiros 5 anos por falta de gestao** (Sebrae). Donos de negocio nao sabem se estao lucrando, informacao critica esta fragmentada entre cadernos e apps, e ERPs existentes sao complexos demais.

| Diferencial | Descricao |
|-------------|-----------|
| **Setup Zero** | Login, wizard de 5 perguntas, primeira venda em 2 minutos |
| **PIX Nativo** | Cobranca PIX com QR code e conciliacao automatica (Mercado Pago) |
| **WhatsApp Integrado** | Envio de cobrancas, orcamentos e NFe pelo canal #1 do Brasil |
| **Dashboard Semaforo** | Verde/Amarelo/Vermelho - visual, sem numeros frios |
| **Mobile-First** | 100% das operacoes essenciais no celular (PWA) |
| **Multi-tenant** | Cada empresa tem seus dados isolados via Row-Level Security |

---

## Funcionalidades

- **Cadastros** - Clientes, fornecedores, produtos/servicos com campos progressivos
- **Financeiro** - Contas a pagar/receber, fluxo de caixa, saldo real, dashboard semaforo, alertas proativos, "Quanto posso retirar?"
- **Vendas** - Venda direta em 30 segundos, orcamentos com conversao em 1 clique
- **PIX** - Cobranca PIX com QR code via Mercado Pago, conciliacao automatica por webhook
- **Fiscal** - NFe, NFSe Nacional e NFCe via Focus NFe, preparado para CBS/IBS 2026
- **Estoque** - Entrada por compra, saida por venda, saldo atual, alerta de minimo
- **WhatsApp** - Cobrancas, notificacoes de NFe, lembretes automaticos de vencimento
- **Notificacoes** - Sistema interno de notificacoes com contagem de nao-lidas
- **Configuracoes** - Formas de pagamento customizaveis, lembretes, configuracao fiscal

---

## Stack tecnologica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 15 (App Router, Turbopack) + TypeScript 5 + Tailwind CSS 4 + shadcn/ui |
| **Backend** | Next.js API Routes (monolito modular) |
| **Database** | PostgreSQL 16 (Supabase) + Prisma ORM 6 |
| **Auth** | NextAuth.js v5 (Auth.js) - Google OAuth |
| **Multi-tenant** | Shared database, tenant context via middleware |
| **Pagamentos** | Mercado Pago (PIX, QR code, webhooks) |
| **Fiscal** | Focus NFe API (NFe, NFSe, NFCe) |
| **WhatsApp** | WhatsApp Business API |
| **Cache** | SWR (cliente) + in-memory cache (servidor) + HTTP Cache-Control |
| **Hosting** | Vercel (app) + Supabase (banco + storage) |
| **Monitoramento** | Sentry (erros + performance) |
| **Testes** | Vitest (unit/integration) + Playwright (E2E) |
| **Package Manager** | pnpm |

---

## Arquitetura

```
src/
├── app/                       # Next.js App Router
│   ├── (dashboard)/           #   Paginas autenticadas (layout com sidebar)
│   │   ├── page.tsx           #     Dashboard principal
│   │   ├── cadastros/         #     Clientes, Fornecedores, Produtos
│   │   ├── financeiro/        #     Contas a pagar/receber, PIX
│   │   ├── vendas/            #     Vendas, Orcamentos
│   │   ├── estoque/           #     Movimentacoes, alertas
│   │   ├── fiscal/            #     Config fiscal
│   │   ├── configuracoes/     #     Formas pagamento, lembretes
│   │   └── notificacoes/      #     Central de notificacoes
│   ├── api/
│   │   ├── v1/                #   API REST versionada (51 endpoints)
│   │   ├── webhooks/          #   Webhooks (Mercado Pago, WhatsApp)
│   │   └── auth/              #   NextAuth handlers
│   ├── login/                 #   Pagina de login
│   └── onboarding/            #   Wizard inicial
├── core/
│   ├── auth/                  # Autenticacao, sessoes, JWT
│   └── tenant/                # Multi-tenant middleware, planos
├── modules/
│   ├── cadastros/             # Services: clientes, fornecedores, produtos
│   ├── financeiro/            # Services: contas, dashboard, alertas
│   ├── vendas/                # Services: vendas, orcamentos
│   ├── fiscal/                # Services: notas fiscais
│   └── estoque/               # Services: movimentacoes
├── integrations/
│   ├── pix/                   # Mercado Pago adapter
│   ├── whatsapp/              # WhatsApp Business adapter
│   └── fiscal-api/            # Focus NFe adapter
├── components/
│   ├── ui/                    # Componentes base (shadcn/ui)
│   └── dashboard/             # Componentes do dashboard
├── hooks/                     # Custom hooks (useTenant, etc.)
└── lib/                       # Utilitarios (prisma, formatters, cache)
```

---

## Pre-requisitos

- **Node.js** >= 18
- **pnpm** >= 8 (ou npm/yarn)
- Conta no **Supabase** (banco PostgreSQL)
- Conta no **Google Cloud** (OAuth - para autenticacao)
- (Opcional) Conta **Mercado Pago** (PIX)
- (Opcional) Conta **Sentry** (monitoramento)

---

## Instalacao local

```bash
# 1. Clonar o repositorio
git clone git@github.com:inematds/ERPsb.git
cd ERPsb

# 2. Instalar dependencias
pnpm install

# 3. Copiar e configurar variaveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais (veja secao abaixo)

# 4. Gerar o Prisma Client
pnpm postinstall

# 5. Aplicar schema no banco de dados
npx prisma db push

# 6. (Opcional) Popular com dados de exemplo
env $(grep -E '^(DATABASE_URL|DIRECT_URL)=' .env.local | sed 's/"//g' | xargs) npx tsx prisma/seed.ts

# 7. Rodar o servidor de desenvolvimento
pnpm dev
```

O app estara disponivel em **http://localhost:3000**.

---

## Variaveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (nunca commite este arquivo):

```bash
# ---- Banco de dados (Supabase PostgreSQL) ----
# URL com pgbouncer (connection pooling) - usada pelo app
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true&connection_limit=5"
# URL direta (sem pooling) - usada pelo Prisma em migrations/seed
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# ---- Autenticacao (NextAuth.js) ----
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""   # Gerar com: openssl rand -base64 32

# ---- Google OAuth ----
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ---- Sentry (opcional) ----
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_ORG=""
SENTRY_PROJECT=""

# ---- Mercado Pago / PIX (opcional) ----
MERCADO_PAGO_ACCESS_TOKEN=""
MERCADO_PAGO_WEBHOOK_SECRET=""
```

### Como obter cada credencial

| Variavel | Onde obter |
|----------|-----------|
| `DATABASE_URL` / `DIRECT_URL` | [Supabase](https://supabase.com) > Projeto > Settings > Database > Connection string |
| `NEXTAUTH_SECRET` | Terminal: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID/SECRET` | [Google Cloud Console](https://console.cloud.google.com) > APIs & Services > Credentials > OAuth 2.0 |
| `SENTRY_*` | [Sentry](https://sentry.io) > Projeto > Settings |
| `MERCADO_PAGO_*` | [Mercado Pago Developers](https://www.mercadopago.com.br/developers) > Aplicacoes |

---

## Rodando o projeto

```bash
# Desenvolvimento (com Turbopack - hot reload rapido)
pnpm dev

# Build de producao
pnpm build

# Rodar build de producao localmente
pnpm start

# Type-check (sem emitir)
pnpm type-check

# Lint
pnpm lint

# Lint com auto-fix
pnpm lint:fix

# Formatar codigo
pnpm format
```

---

## Banco de dados

O projeto usa **Prisma ORM** com PostgreSQL hospedado no **Supabase**.

```bash
# Aplicar alteracoes do schema no banco
npx prisma db push

# Abrir o Prisma Studio (visualizar/editar dados no navegador)
npx prisma studio

# Gerar Prisma Client apos alteracoes no schema
npx prisma generate

# Popular banco com dados de exemplo (~982 vendas, ~160 contas, ~2600 movimentacoes)
env $(grep -E '^(DATABASE_URL|DIRECT_URL)=' .env.local | sed 's/"//g' | xargs) npx tsx prisma/seed.ts
```

### Notas importantes

- Valores monetarios sao armazenados como **inteiros em centavos** (ex: R$ 49,90 = `4990`)
- O app e **multi-tenant**: cada empresa tem seus dados isolados via `tenantId`
- Use `DATABASE_URL` (porta 6543, pgbouncer) para o app e `DIRECT_URL` (porta 5432) para migrations/seed
- O Prisma so le `.env` por padrao; para scripts, passe as variaveis via `env` conforme exemplo acima

### Modelos do banco (22 tabelas)

| Grupo | Modelos |
|-------|---------|
| **Auth** | User, Account, VerificationToken |
| **Tenant** | Tenant, UserTenant |
| **Cadastros** | Cliente, Fornecedor, Produto, FormaPagamento |
| **Financeiro** | ContaPagar, ContaReceber |
| **Vendas** | Venda, Orcamento |
| **PIX** | PixCharge |
| **Fiscal** | ConfigFiscal, NotaFiscal |
| **WhatsApp** | WhatsAppMessage, LembreteConfig |
| **Estoque** | MovimentacaoEstoque |
| **Sistema** | WebhookLog, Notification |

---

## Testes

```bash
# Rodar testes em modo watch
pnpm test

# Rodar testes uma vez (CI)
pnpm test:run
```

Testes unitarios/integracao com **Vitest** + **Testing Library**. E2E com **Playwright**.

---

## Deploy em producao (Vercel)

O ERPsb esta configurado para deploy na **Vercel** na regiao `gru1` (Sao Paulo).

### 1. Criar projeto na Vercel

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Conectar ao projeto
vercel link
```

Ou conecte via dashboard: [vercel.com/new](https://vercel.com/new) > Import Git Repository.

### 2. Configurar variaveis de ambiente

Na Vercel, va em **Settings > Environment Variables** e adicione todas as variaveis do `.env.local`:

| Variavel | Obrigatoria |
|----------|-------------|
| `DATABASE_URL` | Sim |
| `DIRECT_URL` | Sim |
| `NEXTAUTH_URL` | Sim (URL do deploy, ex: `https://erpsb.vercel.app`) |
| `NEXTAUTH_SECRET` | Sim |
| `GOOGLE_CLIENT_ID` | Sim |
| `GOOGLE_CLIENT_SECRET` | Sim |
| `NEXT_PUBLIC_SENTRY_DSN` | Nao |
| `SENTRY_ORG` | Nao |
| `SENTRY_PROJECT` | Nao |
| `MERCADO_PAGO_ACCESS_TOKEN` | Nao |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Nao |

**Importante para o `DATABASE_URL`:** inclua `&connection_limit=5` na string de conexao com pgbouncer. O padrao (`connection_limit=1`) causa timeout em paginas com multiplas queries paralelas.

### 3. Deploy

```bash
# Deploy manual
vercel --prod

# Ou: push para main (deploy automatico se conectado ao GitHub)
git push origin main
```

### 4. Configurar Google OAuth

No [Google Cloud Console](https://console.cloud.google.com), adicione a URL de producao nos **Authorized redirect URIs**:

```
https://seu-dominio.vercel.app/api/auth/callback/google
```

### 5. Configurar webhooks (opcional)

- **Mercado Pago:** configure o webhook URL como `https://seu-dominio.vercel.app/api/webhooks/mercadopago`
- **WhatsApp:** configure como `https://seu-dominio.vercel.app/api/webhooks/whatsapp`

### 6. Cron jobs

O `vercel.json` ja inclui um cron job para processar lembretes WhatsApp diariamente as 9h:

```json
{
  "crons": [
    {
      "path": "/api/v1/whatsapp/processar-lembretes",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Dicas de producao

- O build roda `prisma generate && next build` automaticamente (`pnpm build`)
- Headers de seguranca (X-Frame-Options, X-Content-Type-Options, etc.) sao configurados no `vercel.json`
- Sentry esta configurado com `tracesSampleRate: 0.2` (20% das requests)
- Dashboard usa cache em 3 camadas: SWR (cliente), in-memory (servidor), HTTP Cache-Control
- Endpoints de debug disponiveis: `/api/health` e `/api/debug/auth`

---

## Estrutura de pastas

```
ERPsb/
├── prisma/
│   ├── schema.prisma          # Schema do banco (22 modelos)
│   └── seed.ts                # Seed com dados realistas de loja
├── src/
│   ├── app/                   # Next.js App Router (pages + API)
│   ├── core/                  # Auth + Tenant (infra transversal)
│   ├── modules/               # Logica de negocio por dominio
│   ├── integrations/          # Adapters para APIs externas
│   ├── components/            # Componentes React reutilizaveis
│   ├── hooks/                 # Custom hooks
│   └── lib/                   # Utilitarios compartilhados
├── docs/                      # Documentacao do projeto (PRD, stories, QA)
├── doc/                       # Conceito original e analises
├── .env.example               # Template de variaveis de ambiente
├── vercel.json                # Config Vercel (regiao, crons, headers)
├── next.config.ts             # Config Next.js + Sentry
├── package.json               # Scripts e dependencias
└── tsconfig.json              # Config TypeScript
```

---

## Modulos

### Dashboard (`/`)
Visao geral com carregamento progressivo: semaforo financeiro, saldo, resumo (hoje/semana/mes), contas pendentes, grafico de fluxo de caixa 30 dias, e alertas proativos.

### Cadastros (`/cadastros`)
CRUD completo de clientes, fornecedores e produtos. Campos progressivos - comeca simples, expande conforme necessidade.

### Financeiro (`/financeiro`)
Contas a pagar e receber com status (pendente, pago, vencido). Cobranca PIX com QR code. Baixa manual ou automatica por webhook.

### Vendas (`/vendas`)
Venda direta com selecao de produtos e calculo automatico. Orcamentos com conversao em venda em 1 clique. Gera automaticamente conta a receber e movimentacao de estoque.

### Estoque (`/estoque`)
Entrada por compra, saida por venda, ajustes manuais. Alerta de estoque minimo. Historico de movimentacoes.

### Fiscal (`/fiscal`)
Emissao de NFe, NFSe e NFCe via Focus NFe. Configuracao de certificado digital e dados fiscais.

### Configuracoes (`/configuracoes`)
Formas de pagamento customizaveis (com taxa de cartao), configuracao de lembretes automaticos via WhatsApp.

---

## API

Todas as rotas da API estao sob `/api/v1/` e requerem autenticacao (exceto webhooks e endpoints de debug).

| Endpoint | Metodos | Descricao |
|----------|---------|-----------|
| `/api/v1/dashboard/saldo` | GET | Saldo atual + semaforo |
| `/api/v1/dashboard/resumo` | GET | Receitas/despesas hoje, semana, mes |
| `/api/v1/dashboard/pendentes` | GET | Totais pendentes + proximas contas |
| `/api/v1/dashboard/chart` | GET | Fluxo de caixa 30 dias |
| `/api/v1/alertas` | GET | Alertas proativos + "quanto posso retirar" |
| `/api/v1/clientes` | GET, POST | Listar/criar clientes |
| `/api/v1/clientes/[id]` | GET, PUT, DELETE | CRUD cliente |
| `/api/v1/fornecedores` | GET, POST | Listar/criar fornecedores |
| `/api/v1/fornecedores/[id]` | GET, PUT, DELETE | CRUD fornecedor |
| `/api/v1/produtos` | GET, POST | Listar/criar produtos |
| `/api/v1/produtos/[id]` | GET, PUT, DELETE | CRUD produto |
| `/api/v1/contas-pagar` | GET, POST | Listar/criar contas a pagar |
| `/api/v1/contas-pagar/[id]` | GET, PUT, DELETE | CRUD conta a pagar |
| `/api/v1/contas-pagar/[id]/pagar` | POST | Baixar conta a pagar |
| `/api/v1/contas-receber` | GET, POST | Listar/criar contas a receber |
| `/api/v1/contas-receber/[id]` | GET, PUT, DELETE | CRUD conta a receber |
| `/api/v1/contas-receber/[id]/receber` | POST | Baixar conta a receber |
| `/api/v1/vendas` | GET, POST | Listar/criar vendas |
| `/api/v1/vendas/[id]` | GET | Detalhes da venda |
| `/api/v1/vendas/[id]/confirmar` | POST | Confirmar venda |
| `/api/v1/vendas/[id]/cancelar` | POST | Cancelar venda |
| `/api/v1/orcamentos` | GET, POST | Listar/criar orcamentos |
| `/api/v1/orcamentos/[id]` | GET, PUT, DELETE | CRUD orcamento |
| `/api/v1/orcamentos/[id]/converter` | POST | Converter orcamento em venda |
| `/api/v1/orcamentos/[id]/duplicar` | POST | Duplicar orcamento |
| `/api/v1/pix` | GET, POST | Listar/criar cobrancas PIX |
| `/api/v1/pix/[id]` | GET | Detalhes da cobranca PIX |
| `/api/v1/pix/[id]/status` | GET | Status do pagamento |
| `/api/v1/pix/[id]/cancelar` | POST | Cancelar cobranca |
| `/api/v1/estoque` | GET | Saldos de estoque |
| `/api/v1/estoque/entrada` | POST | Registrar entrada |
| `/api/v1/estoque/ajuste` | POST | Ajuste manual |
| `/api/v1/estoque/alertas` | GET | Produtos abaixo do minimo |
| `/api/v1/estoque/movimentacoes` | GET | Historico de movimentacoes |
| `/api/v1/notas-fiscais` | GET, POST | Listar notas fiscais |
| `/api/v1/notas-fiscais/emitir-nfce` | POST | Emitir NFCe |
| `/api/v1/notas-fiscais/emitir-nfse` | POST | Emitir NFSe |
| `/api/v1/notas-fiscais/[id]` | GET | Detalhes da nota |
| `/api/v1/notas-fiscais/[id]/status` | GET | Status da nota |
| `/api/v1/notas-fiscais/[id]/cancelar` | POST | Cancelar nota |
| `/api/v1/formas-pagamento` | GET, POST | Listar/criar formas de pagamento |
| `/api/v1/formas-pagamento/[id]` | PUT, DELETE | Editar/remover forma |
| `/api/v1/notificacoes` | GET | Listar notificacoes |
| `/api/v1/notificacoes/count` | GET | Contagem de nao-lidas |
| `/api/v1/notificacoes/[id]/read` | POST | Marcar como lida |
| `/api/v1/notificacoes/read-all` | POST | Marcar todas como lidas |
| `/api/v1/tenants` | GET | Tenant do usuario |
| `/api/v1/onboarding` | POST | Wizard de onboarding |
| `/api/v1/config-fiscal` | GET, PUT | Configuracao fiscal |
| `/api/v1/config-fiscal/certificado` | POST | Upload certificado A1 |
| `/api/v1/whatsapp/send` | POST | Enviar mensagem WhatsApp |
| `/api/v1/whatsapp/messages` | GET | Historico de mensagens |
| `/api/v1/whatsapp/lembretes` | GET, PUT | Config de lembretes |
| `/api/health` | GET | Health check |
| `/api/debug/auth` | GET | Debug de autenticacao |

---

## Licenca

Projeto privado - todos os direitos reservados.

---

*ERPsb v1.2.1 - Criado por [inematds](https://github.com/inematds)*
