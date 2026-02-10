# ERPsb

<p align="center">
  <img src="doc/erpsb-banner.png" alt="ERPsb - Sistema Integrado de Gestao" width="700">
</p>

**O ERP que cresce com voce - do primeiro PIX ao primeiro milhao.**

ERPsb e um sistema ERP SaaS **mobile-first** para **nanoempreendedores, MEIs e microempresas brasileiras** que hoje controlam seus negocios com papel, planilha e WhatsApp. Simplicidade radical: mais facil que planilha, entrega valor desde o primeiro dia.

**Producao:** [erpsb.vercel.app](https://erpsb.vercel.app) | **Versao atual:** v1.2.1

---

## Indice

- [O que e](#o-que-e)
- [Contexto de mercado](#contexto-de-mercado)
- [Publico-alvo](#publico-alvo)
- [Analise competitiva](#analise-competitiva)
- [Modelo de negocio](#modelo-de-negocio)
- [Roadmap](#roadmap)
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
- [Planejamento e documentacao](#planejamento-e-documentacao)
- [Documentacao por modulo](#documentacao-por-modulo)
- [Metricas de sucesso](#metricas-de-sucesso)
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

## Contexto de mercado

O ERPsb nasce em um momento unico para o mercado brasileiro de gestao empresarial:

| Dado | Fonte |
|------|-------|
| Mercado global de ERP: **US$ 62 bilhoes** ate 2026 (CAGR 7,52%) | Mordor Intelligence |
| **33% das empresas brasileiras** pretendem trocar de ERP ate 2026 | Portal ERP |
| **97% das empresas NAO estao preparadas** para a reforma tributaria (CBS/IBS) | Receita Federal |
| Gastos com apps cloud no Brasil: **US$ 4,9 bi** em 2025 (+11%) | IDC |
| **91% das PMEs** que adotaram IA reportaram aumento na receita | Microsoft/KPMG |
| Brasil: **147 milhoes** de usuarios WhatsApp (2o maior mercado mundial) | Meta |
| Volume Open Banking cresceu **246%** nos ultimos 12 meses | Banco Central |
| **29% das pequenas empresas** fecham nos primeiros 5 anos por falta de gestao | Sebrae |

### Reforma Tributaria 2026 (CBS/IBS)

A partir de janeiro de 2026 comeca a implementacao de CBS + IBS (substituindo PIS, Cofins, ICMS, ISS, IPI). Periodo de transicao ate 2033. Todo ERP precisa suportar:

- Emissao de documento fiscal eletronico com campos CBS/IBS
- NFSe Nacional obrigatoria
- Coexistencia de tributos antigos e novos

**Isso cria uma janela de oportunidade unica** - a maioria dos ERPs existentes nao esta preparada, e 33% das empresas planejam trocar de sistema.

---

## Publico-alvo

### Primario: Nanoempreendedor / MEI Iniciante

- Faturamento: R$ 0 a R$ 81k/ano (limite MEI)
- Idade: 25-55 anos
- Ramo: servicos, comercio, alimentacao, beleza, manutencao
- Gerencia **tudo pelo celular** (Android)
- Nunca usou sistema de gestao
- Cobra via PIX manual, anota vendas no caderno
- Pergunta principal: *"Estou lucrando? Quanto posso retirar?"*

### Secundario: Microempresa em Crescimento

- Faturamento: R$ 81k a R$ 360k/ano (Simples Nacional)
- 1-5 funcionarios
- Ja tentou ERP mas desistiu pela complexidade
- Precisa centralizar vendas, financeiro e fiscal

### Terciario: Nanoempreendedor Informal

- Nova categoria legal (ate R$ 40,5k/ano, sem CNPJ)
- O ERPsb funciona em **Modo Informal** para atender esse publico

---

## Analise competitiva

| Concorrente | Preco | Ponto Forte | Ponto Fraco |
|-------------|-------|-------------|-------------|
| **Bling** | R$ 55/mes | Marketplaces | Financeiro basico |
| **Tiny ERP** | R$ 41/mes | Hub integracoes | Interface complexa |
| **ContaAzul** | R$ 99/mes | Conciliacao bancaria | Caro, pouco e-commerce |
| **Omie** | R$ 79/mes | CRM + WhatsApp | Complexo para micro |
| **MarketUP** | Gratuito | Custo zero | Interface datada |
| **GestaoClick** | R$ 59/mes | Multi-fiscal | Pouca integracao |

### Gaps que NENHUM concorrente atende bem

1. **Simplicidade real** - todos prometem, nenhum entrega para quem nunca usou ERP
2. **Onboarding eficiente** - configuracao demora dias/semanas em todos
3. **Mobile-first verdadeiro** - apps sao versoes empobrecidas do web
4. **Suporte a informalidade** - todos assumem processos ja organizados e CNPJ
5. **Precificacao inteligente** - nenhum calcula margem real com impostos + taxas
6. **Compliance automatico** - nenhum prepara proativamente para mudancas fiscais

### Diferenciais competitivos do ERPsb

| # | Diferencial | vs Quem ganha | Esforco |
|---|------------|---------------|---------|
| 1 | Setup em 2 minutos (sem configuracao) | TODOS | Medio |
| 2 | PIX nativo com conciliacao automatica | Bling, Tiny, GestaoClick | Medio |
| 3 | WhatsApp integrado de verdade | Todos exceto Omie | Alto |
| 4 | Dashboard semaforo (visual, nao numeros) | TODOS | Baixo |
| 5 | Mobile-first real (PWA completo) | TODOS | Alto |
| 6 | Compliance fiscal automatico (reforma 2026) | TODOS | Alto |
| 7 | Plano gratuito real (nao trial de 30 dias) | Bling, ContaAzul, Omie | Baixo |
| 8 | Modo informal (funciona sem CNPJ) | TODOS | Baixo |

---

## Modelo de negocio

**Freemium + SaaS escalonado por faturamento:**

| Plano | Faturamento | Preco | Inclui |
|-------|-------------|-------|--------|
| **Gratis** | Ate R$ 5k/mes | R$ 0 | Cadastros + Financeiro + 10 vendas/mes |
| **Starter** | Ate R$ 20k/mes | R$ 49/mes | + Vendas ilimitadas + NFe + PIX |
| **Growth** | Ate R$ 100k/mes | R$ 99/mes | + WhatsApp + Estoque + Relatorios |
| **Pro** | Acima R$ 100k | R$ 199/mes | + IA + Marketplaces + Multi-usuario |

**Principios:**
- Preco baseado em **faturamento**, nao usuarios (justo para quem cresce)
- Upgrade automatico sugerido quando atinge limite
- Sem taxas ocultas ou modulos escondidos
- Downgrade sem perda de dados

---

## Roadmap

### Fase 1 - MVP Core (implementado)

| Epic | Status | Descricao |
|------|--------|-----------|
| **1. Fundacao** | Concluido | Next.js 15 + PostgreSQL + Auth Google + Multi-tenant + Onboarding wizard |
| **2. Cadastros** | Concluido | Clientes, Fornecedores, Produtos com formularios progressivos |
| **3. Financeiro** | Concluido | Contas a pagar/receber + Dashboard semaforo + Alertas + "Quanto posso retirar?" |
| **4. Vendas + PIX** | Concluido | Venda rapida + Orcamentos + Cobranca PIX via Mercado Pago + Webhooks |
| **5. Fiscal** | Concluido | NFe + NFSe + NFCe via Focus NFe + Campos CBS/IBS |
| **6. WhatsApp + Estoque** | Concluido | WhatsApp Business + Estoque simplificado + Lembretes automaticos |

### Fase 2 - Diferenciacao (v2.0 - planejado)

| Epic | Stories | Descricao |
|------|---------|-----------|
| **7. Captura Inteligente** | [7.1 - 7.5](docs/stories/) | Foto de nota/despesa → IA extrai dados → aprovacao com 1 clique. Via camera ou WhatsApp |
| **8. CFO Virtual** | [8.1 - 8.4](docs/stories/) | Chat com IA que responde perguntas sobre o negocio ("Quanto vendi?", "Quem me deve?") |
| **9. Precificacao Inteligente** | [9.1 - 9.3](docs/stories/) | Calculadora de preco, analise de margem real por produto, simulador de cenarios |

### Fase 3 - Escala (v3.0 - planejado)

| Epic | Stories | Descricao |
|------|---------|-----------|
| **10. Marketing e Vendas Online** | [10.1 - 10.5](docs/stories/) | Catalogo online publico, mini loja com carrinho + PIX, WhatsApp marketing, integracao Mercado Livre/Shopee/iFood |

**Futuro (backlog):**
- Conciliacao bancaria automatica (Open Finance)
- Fluxo de caixa projetado com IA
- CRM basico
- BI / Analytics
- App nativo (se metricas justificarem)
- API publica para integracoes de terceiros

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

## Planejamento e documentacao

O projeto possui documentacao completa de planejamento, pesquisa de mercado e arquitetura:

### Conceito e mercado (`doc/`)

| Documento | Descricao |
|-----------|-----------|
| [`doc/erp-sb.txt`](doc/erp-sb.txt) | Conceito original do projeto - principios, escopo MVP, sequencia de implantacao |
| [`doc/analise-estrategica-erpsb.md`](doc/analise-estrategica-erpsb.md) | Analise de mercado, concorrencia (8 ERPs), gaps, recomendacoes, riscos |
| [`doc/historico-pesquisa-completo.md`](doc/historico-pesquisa-completo.md) | 60+ fontes de pesquisa compiladas (Sebrae, Mordor, Portal ERP, etc.) |
| [`doc/todo.md`](doc/todo.md) | Gestao geral do projeto e proximos passos |

### Planejamento de produto (`docs/`)

| Documento | Descricao |
|-----------|-----------|
| [`docs/brief.md`](docs/brief.md) | Project Brief completo - problema, solucao, publico, diferenciais |
| [`docs/prd.md`](docs/prd.md) | PRD com **58 requisitos funcionais**, **27 NFRs**, 6 epics, 20+ stories |
| [`docs/architecture.md`](docs/architecture.md) | Arquitetura tecnica completa (monolito modular DDD) |
| [`docs/diagnostico-performance.md`](docs/diagnostico-performance.md) | Diagnostico de performance e plano de otimizacao |

### Documentos shardados

| Pasta | Conteudo |
|-------|----------|
| [`docs/prd/`](docs/prd/) | PRD dividido em 8 secoes (goals, requirements, UI, epics, etc.) |
| [`docs/architecture/`](docs/architecture/) | Arquitetura em 18 documentos (tech stack, data models, API spec, workflows, etc.) |
| [`docs/stories/`](docs/stories/) | **25 stories** detalhadas (1.1 a 6.5) com acceptance criteria |
| [`docs/qa/`](docs/qa/) | Quality gates para validacao de stories |

### Metodologia: BMad Method

O projeto usa o **BMad Method** para planejamento agile orientado por IA:

```
Analyst (Brief) --> PM (PRD) --> Architect --> PO (Shard) --> Dev (Stories) --> QA
     [x]              [x]          [x]           [x]            [x]          [x]
```

Todas as fases de planejamento foram concluidas. O MVP esta implementado e em producao.

---

## Metricas de sucesso

| Metrica | Meta MVP | Meta 6 meses | Meta 1 ano |
|---------|----------|-------------|------------|
| Usuarios ativos (gratis) | 50 (beta) | 1.000 | 5.000 |
| Usuarios pagos | 5 (beta) | 150 | 750 |
| MRR | R$ 0 | R$ 7.500 | R$ 20.000 |
| Time to Value | < 5 min | < 5 min | < 3 min |
| DAU/MAU | > 30% | > 40% | > 45% |
| NPS | > 30 | > 50 | > 60 |

**Metricas tecnicas (NFRs):**
- First Contentful Paint < 1.5s (4G)
- Time to Interactive < 3s (4G)
- API latencia media < 200ms
- Dashboard carrega em < 2s
- Disponibilidade 99.5%

---

## Documentacao por modulo

O ERPsb possui documentacao integrada na aplicacao, acessivel em `/ajuda`. Abaixo o resumo de cada modulo:

| Modulo | Descricao | App | Stories |
|--------|-----------|-----|---------|
| **Primeiros Passos** | Login, criacao de empresa, onboarding wizard | [`/ajuda/primeiros-passos`](https://erpsb.vercel.app/ajuda/primeiros-passos) | [Story 1.1 - 1.4](docs/stories/) |
| **Dashboard** | Semaforo financeiro, saldo, alertas, grafico fluxo de caixa, "quanto posso retirar" | [`/ajuda/dashboard`](https://erpsb.vercel.app/ajuda/dashboard) | [Story 3.4 - 3.5](docs/stories/) |
| **Cadastros** | Clientes, fornecedores, produtos, formas de pagamento | [`/ajuda/cadastros`](https://erpsb.vercel.app/ajuda/cadastros) | [Story 2.1 - 2.3](docs/stories/) |
| **Financeiro** | Contas a pagar/receber, fluxo de caixa, baixa manual/automatica | [`/ajuda/financeiro`](https://erpsb.vercel.app/ajuda/financeiro) | [Story 3.1 - 3.3](docs/stories/) |
| **Vendas** | Venda rapida, orcamentos, conversao em 1 clique | [`/ajuda/vendas`](https://erpsb.vercel.app/ajuda/vendas) | [Story 4.1 - 4.2](docs/stories/) |
| **PIX** | Cobranca PIX via Mercado Pago, QR code, conciliacao automatica | [`/ajuda/pix`](https://erpsb.vercel.app/ajuda/pix) | [Story 4.3 - 4.4](docs/stories/) |
| **Fiscal** | NFe, NFSe Nacional, NFCe via Focus NFe, certificado digital, CBS/IBS | [`/ajuda/fiscal`](https://erpsb.vercel.app/ajuda/fiscal) | [Story 5.1 - 5.3](docs/stories/) |
| **Estoque** | Entradas, saidas automaticas, ajustes manuais, alerta de minimo | [`/ajuda/estoque`](https://erpsb.vercel.app/ajuda/estoque) | [Story 6.3 - 6.4](docs/stories/) |
| **WhatsApp** | Envio de cobrancas, orcamentos, NFe e lembretes automaticos | [`/ajuda/whatsapp`](https://erpsb.vercel.app/ajuda/whatsapp) | [Story 6.1 - 6.2](docs/stories/) |
| **Configuracoes** | Formas de pagamento, lembretes, dados da empresa, config fiscal | [`/ajuda/configuracoes`](https://erpsb.vercel.app/ajuda/configuracoes) | [Story 2.3, 6.5](docs/stories/) |

### Documentacao tecnica

| Documento | Descricao |
|-----------|-----------|
| [`docs/prd.md`](docs/prd.md) | PRD completo (58 requisitos funcionais, 27 NFRs) |
| [`docs/architecture.md`](docs/architecture.md) | Arquitetura tecnica (monolito modular DDD) |
| [`docs/stories/`](docs/stories/) | 25 stories detalhadas com acceptance criteria |
| [`docs/brief.md`](docs/brief.md) | Project Brief - problema, solucao, diferenciais |
| [`docs/diagnostico-performance.md`](docs/diagnostico-performance.md) | Diagnostico e plano de otimizacao |

---

## Licenca

Projeto privado - todos os direitos reservados.

---

*ERPsb v1.2.1 - Criado por [inematds](https://github.com/inematds)*
