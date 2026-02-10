# ERPsb - Documentacao Tecnica

**Versao:** 1.2.2
**Ultima atualizacao:** Fevereiro 2026
**Tipo:** SaaS Multi-Tenant
**Publico-alvo:** Pequenas empresas brasileiras (comercio, servicos, informais)

---

## Sumario

1. [Visao Geral da Arquitetura](#1-visao-geral-da-arquitetura)
2. [Stack Tecnologico](#2-stack-tecnologico)
3. [Estrutura do Codigo](#3-estrutura-do-codigo)
4. [Modelos de Dados](#4-modelos-de-dados)
5. [API Endpoints](#5-api-endpoints)
6. [Multi-Tenancy](#6-multi-tenancy)
7. [Autenticacao e Seguranca](#7-autenticacao-e-seguranca)
8. [Integracoes Externas](#8-integracoes-externas)
9. [Performance e Cache](#9-performance-e-cache)
10. [Deploy e Infraestrutura](#10-deploy-e-infraestrutura)
11. [Testes](#11-testes)

---

## 1. Visao Geral da Arquitetura

O ERPsb adota uma arquitetura **monolitica modular** baseada no Next.js App Router, organizada segundo principios de **Domain-Driven Design (DDD)**. Cada dominio de negocio (Cadastros, Financeiro, Vendas, Fiscal, Estoque, WhatsApp) e encapsulado em seu proprio modulo dentro de `src/modules/`, com schemas de validacao (Zod), servicos de negocio e adaptadores de integracao separados.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                    │
│              React 19 + SWR + Zustand + shadcn/ui           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                     VERCEL EDGE (gru1)                      │
│               NextAuth v5 Middleware (JWT)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   NEXT.JS APP ROUTER                        │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │ Pages   │  │API Routes│  │ Modules   │  │Integrations│  │
│  │ (SSR)   │  │ /api/v1  │  │ (DDD)     │  │ (Adapters) │  │
│  └─────────┘  └──────────┘  └───────────┘  └───────────┘  │
│                      │                                      │
│         ┌────────────▼────────────┐                        │
│         │  Prisma ORM + Tenant    │                        │
│         │    Context Extension    │                        │
│         └────────────┬────────────┘                        │
└──────────────────────┼──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              SUPABASE PostgreSQL 16                         │
│           (pgbouncer + connection pooling)                   │
└─────────────────────────────────────────────────────────────┘
```

**Principios arquiteturais:**

- **Usabilidade sobre complexidade:** interfaces simples para usuarios nao-tecnicos.
- **Financeiro e o coracao:** o modulo financeiro e central, recebendo dados de Vendas, PIX e Fiscal.
- **Fiscal nao bloqueia operacao:** emissao de NF e assincrona; vendas funcionam sem nota.
- **Modular desde o MVP:** cada modulo e independente, com APIs bem definidas entre eles.
- **Escalabilidade estrutural:** tudo construido no MVP escala sem reescrita.

---

## 2. Stack Tecnologico

### Frontend

| Tecnologia | Versao | Finalidade |
|---|---|---|
| Next.js | 15.5 | Framework fullstack (App Router + Turbopack) |
| React | 19.1 | Biblioteca de UI |
| TypeScript | 5.x | Tipagem estatica (modo strict) |
| Tailwind CSS | 4.x | Estilizacao utility-first |
| shadcn/ui + Radix UI | 1.4 | Componentes acessiveis e customizaveis |
| Recharts | 3.7 | Graficos e visualizacoes do dashboard |
| Lucide React | 0.563 | Biblioteca de icones |
| SWR | 2.4 | Data fetching com cache e revalidacao |
| Zustand | 5.0 | Gerenciamento de estado global |
| Sonner | 2.0 | Notificacoes toast |
| date-fns | 4.1 | Manipulacao de datas |

### Backend

| Tecnologia | Versao | Finalidade |
|---|---|---|
| Next.js API Routes | 15.5 | Endpoints REST sob /api/v1 |
| Prisma ORM | 6.19 | ORM com extensao de tenant automatico |
| Zod | 3.25 | Validacao de schemas de entrada |
| Pino | 10.3 | Logging estruturado |
| node-forge | 1.3 | Manipulacao de certificados digitais (fiscal) |

### Banco de Dados

| Componente | Detalhe |
|---|---|
| PostgreSQL | 16 (hospedado no Supabase) |
| Conexao pooled | `DATABASE_URL` (porta 6543, via pgbouncer) |
| Conexao direta | `DIRECT_URL` (porta 5432, para migrations e seed) |
| Connection limit | 5 (configurado programaticamente) |
| Pool timeout | 15 segundos |

### Autenticacao

| Componente | Detalhe |
|---|---|
| NextAuth.js | v5 (beta.30) |
| Provider | Google OAuth 2.0 |
| Estrategia | JWT (sessoes de 24 horas) |
| Adapter | @auth/prisma-adapter |

### Hospedagem e Monitoramento

| Servico | Finalidade |
|---|---|
| Vercel | Hospedagem da aplicacao (regiao `gru1` - Sao Paulo) |
| Supabase | Banco de dados PostgreSQL gerenciado |
| Sentry | Monitoramento de erros e performance (v10.38) |

### Testes

| Ferramenta | Versao | Tipo |
|---|---|---|
| Vitest | 4.0 | Testes unitarios e de integracao |
| Testing Library | 16.3 | Testes de componentes React |
| Playwright | 1.58 | Testes end-to-end |
| jsdom | 28.0 | Ambiente DOM para testes |

### Ferramentas de Desenvolvimento

| Ferramenta | Finalidade |
|---|---|
| ESLint 9 + Prettier 3.8 | Linting e formatacao de codigo |
| pnpm | Gerenciador de pacotes |
| Turbopack | Bundler de desenvolvimento (via Next.js) |
| tsx | Execucao de scripts TypeScript (seed, migrations) |

---

## 3. Estrutura do Codigo

```
src/
├── app/                          # Pages + API Routes (App Router)
│   ├── (dashboard)/              # Layout group - area autenticada
│   │   ├── layout.tsx            # Layout principal com sidebar/nav
│   │   ├── page.tsx              # Dashboard (pagina inicial)
│   │   ├── cadastros/            # Clientes, Fornecedores, Produtos
│   │   ├── financeiro/           # Contas Pagar/Receber, PIX
│   │   ├── vendas/               # Vendas e Orcamentos
│   │   ├── estoque/              # Movimentacoes de estoque
│   │   ├── fiscal/               # Notas fiscais e configuracao
│   │   ├── configuracoes/        # Formas de pagamento, lembretes
│   │   ├── notificacoes/         # Centro de notificacoes
│   │   └── ajuda/                # Central de ajuda contextual
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── health/               # Health check
│   │   ├── debug/auth/           # Debug de autenticacao
│   │   ├── v1/                   # API REST versionada
│   │   │   ├── dashboard/        # 4 endpoints progressivos
│   │   │   ├── alertas/          # Alertas financeiros
│   │   │   ├── clientes/         # CRUD + import
│   │   │   ├── fornecedores/     # CRUD
│   │   │   ├── produtos/         # CRUD
│   │   │   ├── formas-pagamento/ # CRUD
│   │   │   ├── contas-pagar/     # CRUD + acao pagar
│   │   │   ├── contas-receber/   # CRUD + acao receber
│   │   │   ├── vendas/           # CRUD + confirmar/cancelar
│   │   │   ├── orcamentos/       # CRUD + converter/duplicar
│   │   │   ├── pix/              # Criar, status, cancelar
│   │   │   ├── estoque/          # Movimentacoes, alertas, entrada, ajuste
│   │   │   ├── notas-fiscais/    # CRUD + emissao NFe/NFSe/NFCe
│   │   │   ├── config-fiscal/    # Config + certificado
│   │   │   ├── whatsapp/         # Envio, mensagens, lembretes
│   │   │   ├── notificacoes/     # CRUD + contagem + marcar lidas
│   │   │   ├── tenants/          # Gerenciamento de tenant
│   │   │   └── onboarding/       # Fluxo de onboarding
│   │   └── webhooks/             # Mercado Pago, WhatsApp
│   ├── login/                    # Pagina de login
│   └── onboarding/               # Fluxo de primeiro acesso
│
├── core/                         # Modulos transversais
│   ├── auth/                     # Configuracao NextAuth + auth helper
│   │   ├── auth.ts               # Instancia auth() exportada
│   │   └── auth.config.ts        # Providers, callbacks, JWT config
│   ├── tenant/                   # Sistema multi-tenant
│   │   ├── tenant.context.ts     # AsyncLocalStorage para tenantId
│   │   ├── tenant.middleware.ts  # withTenantApi() wrapper
│   │   └── tenant.service.ts    # Servico de tenant
│   └── events/                   # Sistema de eventos (reservado)
│
├── modules/                      # Logica de negocio por dominio (DDD)
│   ├── cadastros/                # Cliente, Fornecedor, Produto, FormaPagamento
│   │   ├── *.schema.ts           # Schemas Zod de validacao
│   │   └── *.service.ts          # Servicos de negocio
│   ├── financeiro/               # ContaPagar, ContaReceber, Dashboard, Alertas
│   ├── vendas/                   # Venda, Orcamento
│   ├── fiscal/                   # ConfigFiscal, NotaFiscal, helpers
│   ├── estoque/                  # MovimentacaoEstoque
│   ├── whatsapp/                 # Mensagens, Lembretes
│   └── notificacoes/             # Notificacoes internas
│
├── integrations/                 # Adaptadores de APIs externas
│   ├── pix/                      # Mercado Pago (pagamentos PIX)
│   │   ├── mercadopago.client.ts # Client HTTP para Mercado Pago
│   │   ├── pix.service.ts        # Logica de negocio PIX
│   │   ├── pix.schema.ts         # Schemas de validacao
│   │   └── pix.webhook.ts        # Processamento de webhooks
│   ├── fiscal-api/               # Focus NFe (notas fiscais)
│   │   └── focusnfe.client.ts    # Client HTTP para Focus NFe
│   └── whatsapp/                 # WhatsApp Business
│       ├── whatsapp.client.ts    # Client HTTP (Evolution API compativel)
│       └── templates.ts          # Templates de mensagens
│
├── components/                   # Componentes de UI
│   ├── ui/                       # Primitivos shadcn/ui (Button, Card, Dialog...)
│   ├── layout/                   # Sidebar, Header, BottomNav, FAB
│   ├── dashboard/                # Semaforo, AlertCards, CashFlowChart...
│   └── shared/                   # EmptyState, LoadingSkeleton, OfflineBanner...
│
├── hooks/                        # Custom React hooks
│   ├── use-tenant.ts             # Hook de contexto do tenant
│   ├── use-pwa-install.ts        # Hook de instalacao PWA
│   └── use-online-status.ts      # Deteccao de conectividade
│
├── stores/                       # Zustand stores
│   └── notification-store.ts     # Estado global de notificacoes
│
├── lib/                          # Utilitarios e configuracoes
│   ├── prisma.ts                 # Instancia Prisma com extensao tenant
│   ├── server-cache.ts           # Cache in-memory com TTL
│   ├── swr-config.tsx            # Configuracao global do SWR
│   ├── env.ts                    # Validacao de variaveis de ambiente (Zod)
│   ├── formatters.ts             # Formatacao BRL, datas, etc.
│   ├── validators.ts             # Validadores compartilhados
│   ├── constants.ts              # Constantes da aplicacao
│   ├── crypto.ts                 # Utilitarios criptograficos
│   └── utils.ts                  # Utilitarios gerais (cn, etc.)
│
└── middleware.ts                  # Edge middleware (NextAuth)

prisma/
├── schema.prisma                 # Schema do banco (22 models)
└── seed.ts                       # Seed com dados realistas de loja

vercel.json                       # Configuracao de deploy Vercel
```

---

## 4. Modelos de Dados

O banco de dados possui **22 modelos** organizados por dominio. Todos os valores monetarios sao armazenados como `Int` em **centavos** (ex: R$ 49,90 = 4990).

### 4.1 Diagrama de Dominios

```
AUTH                    TENANT                  CADASTROS
┌──────────┐           ┌──────────┐            ┌──────────┐
│ User     │◄─────────►│UserTenant│───────────►│ Tenant   │
│ Account  │           └──────────┘            └────┬─────┘
│ Verif.   │                                        │
│ Token    │                            ┌───────────┼───────────┐
└──────────┘                            ▼           ▼           ▼
                                   ┌────────┐ ┌──────────┐ ┌────────┐
                                   │Cliente │ │Fornecedor│ │Produto │
                                   └───┬────┘ └────┬─────┘ └───┬────┘
                                       │           │            │
FINANCEIRO                             │           │            │
┌──────────────┐◄──────────────────────┘           │     ┌──────▼──────┐
│ContaReceber  │         ┌─────────────┐◄──────────┘     │Movimentacao │
└──────┬───────┘         │ ContaPagar  │                 │  Estoque    │
       │                 └─────────────┘                 └─────────────┘
       │
┌──────▼───────┐    VENDAS
│  PixCharge   │    ┌──────────┐    ┌──────────┐
└──────────────┘    │  Venda   │◄──►│Orcamento │
                    └────┬─────┘    └──────────┘
                         │
                    ┌────▼─────┐
                    │NotaFiscal│
                    └──────────┘
```

### 4.2 Tabela de Modelos

| Dominio | Modelo | Tabela | Descricao |
|---|---|---|---|
| **Auth** | User | `users` | Usuarios do sistema |
| | Account | `accounts` | Contas OAuth vinculadas |
| | VerificationToken | `verification_tokens` | Tokens de verificacao |
| **Tenant** | Tenant | `tenants` | Empresa/organizacao |
| | UserTenant | `user_tenants` | Vinculo usuario-tenant com role |
| **Cadastros** | Cliente | `clientes` | Clientes da empresa |
| | Fornecedor | `fornecedores` | Fornecedores |
| | Produto | `produtos` | Produtos e servicos |
| | FormaPagamento | `formas_pagamento` | Formas de pagamento configuradas |
| **Financeiro** | ContaPagar | `contas_pagar` | Contas a pagar (despesas) |
| | ContaReceber | `contas_receber` | Contas a receber (receitas) |
| **Vendas** | Venda | `vendas` | Vendas realizadas (items como JSON) |
| | Orcamento | `orcamentos` | Orcamentos para clientes |
| **PIX** | PixCharge | `pix_charges` | Cobrancas PIX via Mercado Pago |
| **Fiscal** | ConfigFiscal | `config_fiscal` | Configuracao fiscal do tenant (1:1) |
| | NotaFiscal | `notas_fiscais` | Notas fiscais emitidas (NFe/NFSe/NFCe) |
| **WhatsApp** | WhatsAppMessage | `whatsapp_messages` | Mensagens enviadas via WhatsApp |
| | LembreteConfig | `lembrete_configs` | Config de lembretes automaticos (1:1) |
| **Estoque** | MovimentacaoEstoque | `movimentacoes_estoque` | Entradas, saidas e ajustes |
| **Outros** | WebhookLog | `webhook_logs` | Log de webhooks recebidos |
| | Notification | `notifications` | Notificacoes internas do sistema |

### 4.3 Convencoes de Dados

- **IDs:** CUID (`@default(cuid())`)
- **Valores monetarios:** `Int` em centavos (R$ 49,90 = `4990`)
- **Datas:** `DateTime` nativo do Prisma (ISO 8601)
- **Status:** `String` com valores pre-definidos (ex: `PENDENTE`, `PAGO`, `CANCELADO`)
- **Items de venda:** campo `Json` com array de `{ productId, productName, quantity, unitPrice, total }`
- **Enderecos:** campo `Json` com estrutura flexivel
- **Soft delete:** nao utilizado; exclusoes sao em cascata (`onDelete: Cascade`)
- **Indices:** compostos por `[tenantId, campo]` para performance em queries multi-tenant

### 4.4 Relacionamentos Principais

| Origem | Destino | Tipo | Via |
|---|---|---|---|
| User | Tenant | N:N | UserTenant |
| Venda | ContaReceber | 1:N | `saleId` |
| Venda | NotaFiscal | 1:N | `saleId` |
| ContaPagar | Fornecedor | N:1 | `supplierId` |
| ContaReceber | Cliente | N:1 | `clientId` |
| ContaReceber | PixCharge | 1:N | `contaReceberId` |
| Orcamento | Venda | N:1 | `saleId` (apos conversao) |
| Produto | MovimentacaoEstoque | 1:N | `productId` |
| Cliente | WhatsAppMessage | 1:N | `clientId` |
| Tenant | ConfigFiscal | 1:1 | `tenantId` (unique) |
| Tenant | LembreteConfig | 1:1 | `tenantId` (unique) |

---

## 5. API Endpoints

Todos os endpoints de negocio estao sob `/api/v1/` e requerem autenticacao (exceto webhooks e debug). Total: **61 rotas**.

### 5.1 Dashboard e Alertas

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/api/v1/dashboard` | Dados completos do dashboard (com cache 30s) |
| GET | `/api/v1/dashboard/saldo` | Saldo atual (receitas - despesas) |
| GET | `/api/v1/dashboard/resumo` | Resumo mensal (totais, contagens) |
| GET | `/api/v1/dashboard/pendentes` | Contas pendentes e vencidas |
| GET | `/api/v1/dashboard/chart` | Dados para grafico de fluxo de caixa |
| GET | `/api/v1/alertas` | Alertas financeiros ativos |

### 5.2 Cadastros

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/api/v1/clientes` | Listar clientes (com busca e paginacao) |
| POST | `/api/v1/clientes` | Criar cliente |
| POST | `/api/v1/clientes/import` | Importar clientes em lote |
| GET | `/api/v1/clientes/:id` | Detalhe do cliente |
| PUT | `/api/v1/clientes/:id` | Atualizar cliente |
| DELETE | `/api/v1/clientes/:id` | Excluir cliente |
| GET | `/api/v1/fornecedores` | Listar fornecedores |
| POST | `/api/v1/fornecedores` | Criar fornecedor |
| GET | `/api/v1/fornecedores/:id` | Detalhe do fornecedor |
| PUT | `/api/v1/fornecedores/:id` | Atualizar fornecedor |
| DELETE | `/api/v1/fornecedores/:id` | Excluir fornecedor |
| GET | `/api/v1/produtos` | Listar produtos |
| POST | `/api/v1/produtos` | Criar produto |
| GET | `/api/v1/produtos/:id` | Detalhe do produto |
| PUT | `/api/v1/produtos/:id` | Atualizar produto |
| DELETE | `/api/v1/produtos/:id` | Excluir produto |
| GET | `/api/v1/formas-pagamento` | Listar formas de pagamento |
| POST | `/api/v1/formas-pagamento` | Criar forma de pagamento |
| PUT | `/api/v1/formas-pagamento/:id` | Atualizar forma de pagamento |

### 5.3 Financeiro

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/api/v1/contas-pagar` | Listar contas a pagar |
| POST | `/api/v1/contas-pagar` | Criar conta a pagar |
| GET | `/api/v1/contas-pagar/:id` | Detalhe da conta |
| PUT | `/api/v1/contas-pagar/:id` | Atualizar conta |
| DELETE | `/api/v1/contas-pagar/:id` | Excluir conta |
| POST | `/api/v1/contas-pagar/:id/pagar` | Registrar pagamento |
| GET | `/api/v1/contas-receber` | Listar contas a receber |
| POST | `/api/v1/contas-receber` | Criar conta a receber |
| GET | `/api/v1/contas-receber/:id` | Detalhe da conta |
| PUT | `/api/v1/contas-receber/:id` | Atualizar conta |
| DELETE | `/api/v1/contas-receber/:id` | Excluir conta |
| POST | `/api/v1/contas-receber/:id/receber` | Registrar recebimento |

### 5.4 Vendas e Orcamentos

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/api/v1/vendas` | Listar vendas |
| POST | `/api/v1/vendas` | Criar venda (rascunho) |
| GET | `/api/v1/vendas/:id` | Detalhe da venda |
| PUT | `/api/v1/vendas/:id` | Atualizar venda |
| DELETE | `/api/v1/vendas/:id` | Excluir venda |
| POST | `/api/v1/vendas/:id/confirmar` | Confirmar venda (gera ContaReceber) |
| POST | `/api/v1/vendas/:id/cancelar` | Cancelar venda |
| GET | `/api/v1/orcamentos` | Listar orcamentos |
| POST | `/api/v1/orcamentos` | Criar orcamento |
| GET | `/api/v1/orcamentos/:id` | Detalhe do orcamento |
| PUT | `/api/v1/orcamentos/:id` | Atualizar orcamento |
| DELETE | `/api/v1/orcamentos/:id` | Excluir orcamento |
| POST | `/api/v1/orcamentos/:id/converter` | Converter orcamento em venda |
| POST | `/api/v1/orcamentos/:id/duplicar` | Duplicar orcamento |

### 5.5 PIX

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/api/v1/pix` | Listar cobrancas PIX |
| POST | `/api/v1/pix` | Criar cobranca PIX (QR Code) |
| GET | `/api/v1/pix/:id` | Detalhe da cobranca |
| GET | `/api/v1/pix/:id/status` | Consultar status do pagamento |
| POST | `/api/v1/pix/:id/cancelar` | Cancelar cobranca |

### 5.6 Estoque

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/api/v1/estoque` | Posicao atual de estoque por produto |
| GET | `/api/v1/estoque/movimentacoes` | Historico de movimentacoes |
| GET | `/api/v1/estoque/alertas` | Produtos abaixo do estoque minimo |
| POST | `/api/v1/estoque/entrada` | Registrar entrada de estoque |
| POST | `/api/v1/estoque/ajuste` | Ajuste manual de estoque |

### 5.7 Fiscal

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/api/v1/config-fiscal` | Configuracao fiscal do tenant |
| PUT | `/api/v1/config-fiscal` | Atualizar configuracao fiscal |
| POST | `/api/v1/config-fiscal/certificado` | Upload de certificado digital |
| GET | `/api/v1/notas-fiscais` | Listar notas fiscais |
| GET | `/api/v1/notas-fiscais/:id` | Detalhe da nota fiscal |
| POST | `/api/v1/notas-fiscais` | Emitir NFe |
| POST | `/api/v1/notas-fiscais/emitir-nfse` | Emitir NFSe (servicos) |
| POST | `/api/v1/notas-fiscais/emitir-nfce` | Emitir NFCe (consumidor) |
| GET | `/api/v1/notas-fiscais/:id/status` | Consultar status na SEFAZ |
| POST | `/api/v1/notas-fiscais/:id/cancelar` | Cancelar nota fiscal |

### 5.8 WhatsApp

| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/api/v1/whatsapp/send` | Enviar mensagem WhatsApp |
| GET | `/api/v1/whatsapp/messages` | Historico de mensagens |
| GET | `/api/v1/whatsapp/lembretes` | Configuracao de lembretes |
| PUT | `/api/v1/whatsapp/lembretes` | Atualizar config de lembretes |
| POST | `/api/v1/whatsapp/processar-lembretes` | Cron: processar lembretes pendentes |

### 5.9 Notificacoes

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/api/v1/notificacoes` | Listar notificacoes |
| GET | `/api/v1/notificacoes/count` | Contagem de nao-lidas |
| POST | `/api/v1/notificacoes/:id/read` | Marcar como lida |
| POST | `/api/v1/notificacoes/read-all` | Marcar todas como lidas |

### 5.10 Outros

| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/api/v1/onboarding` | Completar onboarding (cria tenant) |
| GET | `/api/v1/tenants` | Listar tenants do usuario |
| POST | `/api/webhooks/mercadopago` | Webhook Mercado Pago (PIX) |
| POST | `/api/webhooks/whatsapp` | Webhook WhatsApp (status) |
| GET | `/api/health` | Health check (publico) |
| GET | `/api/debug/auth` | Debug de autenticacao (publico) |

---

## 6. Multi-Tenancy

O ERPsb implementa multi-tenancy no modelo **Shared Database** (banco compartilhado com isolamento logico via `tenantId`).

### 6.1 Arquitetura

```
Request → Edge Middleware (auth) → API Route → withTenantApi()
                                                     │
                                          ┌──────────▼──────────┐
                                          │  resolveTenantId()  │
                                          │  JWT → tenantId     │
                                          │  fallback → DB      │
                                          └──────────┬──────────┘
                                                     │
                                          ┌──────────▼──────────┐
                                          │ AsyncLocalStorage   │
                                          │ runWithTenant()     │
                                          └──────────┬──────────┘
                                                     │
                                          ┌──────────▼──────────┐
                                          │  Prisma Extension   │
                                          │  Auto-inject WHERE  │
                                          │  tenantId = X       │
                                          └─────────────────────┘
```

### 6.2 Mecanismo de Isolamento

1. **`AsyncLocalStorage`** (`src/core/tenant/tenant.context.ts`): armazena o `tenantId` no contexto assincrono da requisicao, propagando automaticamente para todas as chamadas internas.

2. **Prisma Extension** (`src/lib/prisma.ts`): intercepta todas as operacoes do Prisma e automaticamente:
   - **CREATE:** injeta `tenantId` no registro criado.
   - **READ (find, count, aggregate):** adiciona `WHERE tenantId = X`.
   - **UPDATE/DELETE:** adiciona `WHERE tenantId = X`.
   - **Excecoes:** modelos `User`, `Account`, `VerificationToken` e `UserTenant` nao recebem filtro.

3. **`basePrisma`**: instancia Prisma sem a extensao de tenant, utilizada para operacoes que precisam acessar dados de multiplos tenants (ex: resolucao de tenant no login, webhooks).

4. **`withTenantApi()`** (`src/core/tenant/tenant.middleware.ts`): wrapper para API routes que:
   - Valida autenticacao (retorna 401 se ausente).
   - Resolve o `tenantId` via JWT ou fallback em DB.
   - Retorna 403 se o usuario nao tem tenant ativo.
   - Executa o handler dentro do contexto do tenant.

### 6.3 Modelo de Dados

```
User ──N:N──► Tenant  (via UserTenant, com role: OWNER)
              │
              ├── isActive: true (tenant selecionado)
              └── activeTenantId no JWT (para evitar query DB)
```

Cada `UserTenant` registra a role (`OWNER` por default) e se o tenant esta ativo para aquele usuario (`isActive`). O `activeTenantId` e persistido no token JWT para evitar consultas ao banco em cada requisicao.

---

## 7. Autenticacao e Seguranca

### 7.1 Fluxo de Autenticacao

```
1. Usuario acessa /login
2. Clica em "Entrar com Google"
3. NextAuth v5 redireciona para Google OAuth
4. Callback: cria/atualiza User + Account no banco
5. JWT gerado com userId + activeTenantId
6. Cookie HttpOnly armazenado no browser
7. Edge middleware valida JWT em toda requisicao
```

### 7.2 Configuracao NextAuth

| Parametro | Valor |
|---|---|
| Provider | Google OAuth 2.0 |
| Estrategia | JWT (sem sessao no banco) |
| Tempo de sessao | 24 horas (`maxAge: 86400`) |
| Pagina de login | `/login` (customizada) |
| Pagina protegida padrao | Redirect para `/login` |

### 7.3 Edge Middleware

O middleware roda no Vercel Edge Runtime e intercepta todas as requisicoes (exceto assets estaticos). Logica de autorizacao:

| Tipo de Rota | Comportamento |
|---|---|
| `/login`, `/api/auth/*` | Publica (permite acesso sem login) |
| `/api/health`, `/api/debug/*` | Publica |
| `/api/webhooks/*` | Publica (validacao propria) |
| `/api/*` (demais) | Retorna `401 JSON` se nao autenticado |
| Pages (demais) | Redirect para `/login` se nao autenticado |
| `/login` (se logado) | Redirect para `/` |

### 7.4 Headers de Seguranca

Configurados em `vercel.json` para todas as rotas:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 7.5 Validacao de Entrada

Todas as requisicoes de entrada sao validadas com **Zod schemas** antes de atingir a logica de negocio. Schemas estao definidos em `src/modules/*/\*.schema.ts` e `src/integrations/*/\*.schema.ts`.

### 7.6 Variaveis de Ambiente

Validadas em runtime via Zod (`src/lib/env.ts`):

| Variavel | Obrigatoria | Descricao |
|---|---|---|
| `DATABASE_URL` | Sim | URL PostgreSQL (pgbouncer) |
| `DIRECT_URL` | Nao | URL PostgreSQL (direta, para migrations) |
| `NEXTAUTH_URL` | Sim | URL base da aplicacao |
| `NEXTAUTH_SECRET` | Sim | Secret para assinar JWTs |
| `GOOGLE_CLIENT_ID` | Nao | Client ID do Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Nao | Client Secret do Google OAuth |
| `MERCADO_PAGO_ACCESS_TOKEN` | Nao | Token de acesso Mercado Pago |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Nao | Secret para validar webhooks |
| `FOCUS_NFE_TOKEN` | Nao | Token da API Focus NFe |
| `WHATSAPP_API_URL` | Nao | URL da API WhatsApp (Evolution) |
| `WHATSAPP_API_TOKEN` | Nao | Token da API WhatsApp |
| `NEXT_PUBLIC_SENTRY_DSN` | Nao | DSN do Sentry |
| `ENABLE_DEV_LOGIN` | Nao | Ativa login de desenvolvimento |

Quando tokens de integracao nao estao configurados, o sistema opera em **modo mock**, retornando dados simulados sem chamar APIs externas.

---

## 8. Integracoes Externas

### 8.1 PIX - Mercado Pago

**Arquivo:** `src/integrations/pix/mercadopago.client.ts`

| Operacao | Metodo API | Endpoint Mercado Pago |
|---|---|---|
| Criar cobranca | POST | `/v1/payments` |
| Consultar status | GET | `/v1/payments/:id` |
| Cancelar cobranca | PUT | `/v1/payments/:id` |

**Fluxo de cobranca PIX:**

```
1. Usuario cria cobranca → POST /api/v1/pix
2. Sistema chama Mercado Pago → cria payment com method_id=pix
3. Retorna QR Code (base64) + link de pagamento
4. Cliente paga via app de banco
5. Mercado Pago envia webhook → POST /api/webhooks/mercadopago
6. Sistema atualiza PixCharge + ContaReceber
7. Notificacao criada para o usuario
```

**Mapeamento de status:**

| Status Mercado Pago | Status ERPsb |
|---|---|
| `approved` | `PAID` |
| `pending`, `in_process`, `authorized` | `PENDING` |
| `expired` | `EXPIRED` |
| `cancelled`, `rejected`, `refunded` | `CANCELLED` |

### 8.2 Fiscal - Focus NFe

**Arquivo:** `src/integrations/fiscal-api/focusnfe.client.ts`

Suporta emissao de tres tipos de documento fiscal:

| Tipo | Endpoint Focus | Uso |
|---|---|---|
| **NFe** | `/v2/nfe` | Nota Fiscal Eletronica (venda de produtos) |
| **NFSe** | `/v2/nfse` | Nota Fiscal de Servico Eletronica |
| **NFCe** | `/v2/nfce` | Nota Fiscal de Consumidor Eletronica (PDV) |

**Operacoes por tipo:**

| Operacao | Descricao |
|---|---|
| `create{NFe,NFSe,NFCe}` | Emissao do documento fiscal |
| `get{NFe,NFSe,NFCe}Status` | Consulta de status na SEFAZ |
| `cancel{NFe,NFSe,NFCe}` | Cancelamento com justificativa |

**Autenticacao:** Basic Auth com token codificado em Base64.

**Ambientes:** `homologacao` (padrao) e `producao`, configurados no modelo `ConfigFiscal` por tenant.

**Mapeamento de status:**

| Status Focus NFe | Status ERPsb |
|---|---|
| `autorizado` | `AUTORIZADA` |
| `cancelado` | `CANCELADA` |
| `erro_autorizacao`, `rejeitado` | `REJEITADA` |
| `processando_autorizacao` | `PROCESSANDO` |

### 8.3 WhatsApp - Evolution API

**Arquivo:** `src/integrations/whatsapp/whatsapp.client.ts`

Integracao com API compativel com a **Evolution API** (self-hosted). A URL da API e configuravel via variavel de ambiente.

| Operacao | Endpoint da API |
|---|---|
| Enviar mensagem | POST `{API_URL}/message/sendText` |
| Consultar status | GET `{API_URL}/message/status/:id` |

**Tipos de mensagem suportados:**
- `cobranca` - Lembrete de pagamento
- `nfe` - Envio de nota fiscal
- `lembrete` - Lembrete automatico de vencimento
- `orcamento` - Envio de orcamento

**Lembretes automaticos:** Configurados por tenant via `LembreteConfig` com opcoes de envio N dias antes, no dia e N dias apos o vencimento. Processados via cron job diario as 9h (horario de Brasilia).

---

## 9. Performance e Cache

### 9.1 Cache Server-Side

**Arquivo:** `src/lib/server-cache.ts`

Cache in-memory com TTL para evitar consultas repetidas ao banco em funcoes serverless:

```typescript
cached(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>
invalidateCache(key: string): void
invalidateCachePrefix(prefix: string): void
```

**Uso principal:** endpoint do Dashboard com TTL de 30 segundos.

### 9.2 Cache Client-Side (SWR)

O SWR e configurado globalmente (`src/lib/swr-config.tsx`) para:
- **Revalidacao automatica** ao focar a aba.
- **Deduplicacao** de requisicoes simultaneas.
- **Cache stale-while-revalidate** para resposta instantanea.

### 9.3 Dashboard Progressivo

O dashboard utiliza **4 endpoints independentes** para carregamento progressivo, permitindo que cada secao carregue independentemente:

| Endpoint | Conteudo | Prioridade |
|---|---|---|
| `/dashboard/saldo` | Saldo atual | Alta (carrega primeiro) |
| `/dashboard/resumo` | Resumo mensal | Alta |
| `/dashboard/pendentes` | Contas pendentes | Media |
| `/dashboard/chart` | Grafico de fluxo de caixa | Baixa (carrega por ultimo) |

### 9.4 Connection Pooling

O Prisma Client e configurado para funcionar com pgbouncer do Supabase:

- **`connection_limit=5`**: maximo de conexoes por instancia serverless.
- **`pool_timeout=15`**: timeout de 15 segundos para obter conexao.
- **`globalThis` caching**: reutiliza a instancia do Prisma entre invocacoes quentes.

### 9.5 Otimizacoes Adicionais

- **Consultas paralelas limitadas:** maximo de 5 queries simultaneas por `Promise.all()` para evitar esgotar conexoes.
- **Conversao BigInt:** `Number()` aplicado em resultados de aggregates antes de serializar para JSON.
- **Indices compostos:** todas as tabelas multi-tenant possuem indices `[tenantId, campo_mais_consultado]`.

---

## 10. Deploy e Infraestrutura

### 10.1 Configuracao Vercel

**Arquivo:** `vercel.json`

| Parametro | Valor |
|---|---|
| Framework | Next.js |
| Regiao | `gru1` (Sao Paulo, Brasil) |
| Build env | `NEXT_TELEMETRY_DISABLED=1` |

### 10.2 Cron Jobs

| Schedule | Endpoint | Descricao |
|---|---|---|
| `0 9 * * *` (9h diario) | `/api/v1/whatsapp/processar-lembretes` | Processa e envia lembretes de cobranca via WhatsApp |

### 10.3 URL de Producao

```
https://erpsb.vercel.app
```

### 10.4 Variaveis de Ambiente por Ambiente

| Ambiente | DATABASE_URL | NEXTAUTH_URL |
|---|---|---|
| Development | Local ou Supabase (dev) | `http://localhost:3000` |
| Production | Supabase (pgbouncer, porta 6543) | `https://erpsb.vercel.app` |

### 10.5 Scripts de Operacao

```bash
# Desenvolvimento
pnpm dev                    # Inicia servidor com Turbopack
pnpm lint                   # Verifica linting
pnpm lint:fix               # Corrige problemas de linting
pnpm format                 # Formata codigo com Prettier
pnpm format:check           # Verifica formatacao
pnpm type-check             # Verificacao de tipos TypeScript

# Build
pnpm build                  # prisma generate + next build

# Testes
pnpm test                   # Vitest em modo watch
pnpm test:run               # Vitest execucao unica

# Banco de Dados
npx prisma generate         # Gerar Prisma Client
npx prisma db push          # Aplicar schema no banco
npx prisma studio           # Interface grafica do banco
# Seed (com env vars do .env.local):
env $(grep -E '^(DATABASE_URL|DIRECT_URL)=' .env.local | sed 's/"//g' | xargs) npx tsx prisma/seed.ts
```

---

## 11. Testes

### 11.1 Estrategia de Testes

| Camada | Ferramenta | Cobertura |
|---|---|---|
| **Unitarios** | Vitest + Testing Library | Services, schemas, formatters, utils |
| **Integracao** | Vitest | API routes, middleware, Prisma queries |
| **E2E** | Playwright | Fluxos completos de usuario |

### 11.2 Configuracao

O Vitest e configurado com:
- **Ambiente:** jsdom (para testes de componentes React)
- **Plugin:** `@vitejs/plugin-react` (suporte a JSX)
- **Alias:** `@/` mapeado para `src/`

### 11.3 Organizacao

Os testes seguem a convencao de co-localizacao:
- Testes unitarios ficam junto ao codigo fonte (`*.test.ts` / `*.test.tsx`).
- Testes E2E ficam em diretorio dedicado na raiz.

### 11.4 Execucao

```bash
pnpm test          # Modo watch (desenvolvimento)
pnpm test:run      # Execucao unica (CI/CD)
```

---

## Apendice A: Glossario

| Termo | Significado |
|---|---|
| **Tenant** | Empresa/organizacao que usa o sistema |
| **CUID** | Collision-resistant Unique Identifier |
| **Centavos** | Unidade monetaria minima (1 real = 100 centavos) |
| **PIX** | Sistema de pagamentos instantaneos do Banco Central |
| **NFe** | Nota Fiscal Eletronica (produtos) |
| **NFSe** | Nota Fiscal de Servico Eletronica |
| **NFCe** | Nota Fiscal de Consumidor Eletronica |
| **SEFAZ** | Secretaria da Fazenda (orgao fiscal estadual) |
| **pgbouncer** | Connection pooler para PostgreSQL |
| **SWR** | Stale-While-Revalidate (estrategia de cache) |
| **DDD** | Domain-Driven Design |
| **RBAC** | Role-Based Access Control |

## Apendice B: Dependencias Principais

```json
{
  "next": "15.5.12",
  "react": "19.1.0",
  "typescript": "^5",
  "tailwindcss": "^4",
  "@prisma/client": "^6.19.2",
  "next-auth": "5.0.0-beta.30",
  "zod": "^3.25.76",
  "swr": "^2.4.0",
  "zustand": "^5.0.11",
  "recharts": "^3.7.0",
  "lucide-react": "^0.563.0",
  "@sentry/nextjs": "^10.38.0",
  "date-fns": "^4.1.0",
  "pino": "^10.3.0",
  "sonner": "^2.0.7",
  "radix-ui": "^1.4.3",
  "node-forge": "^1.3.3"
}
```
