# ERPsb - Resumo Executivo do Produto

**Versao:** 1.0
**Data:** 2026-02-10
**Status:** Aprovado
**Baseado em:** PRD v1.0 (`docs/prd.md`) + Arquitetura v1.0 (`docs/architecture.md`)

---

## 1. Resumo do Produto

### O que e o ERPsb

O ERPsb e um ERP SaaS mobile-first desenvolvido para nanoempreendedores, MEIs e microempresas brasileiras que hoje operam com controles informais -- cadernos, planilhas, WhatsApp e memoria. A plataforma unifica gestao financeira, vendas, fiscal e estoque em uma interface radicalmente simples, acessivel 100% pelo celular.

### Visao

Ser o ERP mais simples que papel e planilha, eliminando barreiras de adocao para quem nunca usou sistema de gestao. O ERPsb cresce com o empreendedor -- do primeiro PIX ao primeiro milhao.

### Missao

Permitir que micro e pequenos empresarios brasileiros controlem financas, vendas e obrigacoes fiscais em menos de 5 minutos de setup, com PIX nativo, WhatsApp integrado e compliance fiscal automatico, sem exigir conhecimento contabil.

### Oportunidade de Mercado

- **97% das empresas** nao estao preparadas para a reforma tributaria de 2026 (CBS/IBS, NFSe Nacional obrigatoria)
- **33% pretendem trocar de ERP** -- janela de oportunidade unica
- **29% das empresas fecham** nos primeiros 5 anos por falta de gestao (Sebrae)
- Concorrentes existentes (Bling, Omie, ContaAzul, Tiny) sao complexos demais e caros para o publico-alvo

### Modelo de Negocio

Freemium honesto: gratuito ate R$ 5.000/mes de faturamento, com planos pagos progressivos (Starter, Growth, Pro) que acompanham o crescimento do negocio.

---

## 2. Escopo do MVP (Fase 1)

O MVP do ERPsb contempla 6 epics que entregam um sistema completo de gestao para microempresas, com os seguintes modulos:

| Modulo | Descricao | Epic |
|--------|-----------|------|
| **Fundacao e Autenticacao** | Login Google OAuth, multi-tenant com RLS, onboarding wizard, layout mobile-first | Epic 1 |
| **Cadastros Progressivos** | Clientes, Fornecedores, Produtos/Servicos, Formas de Pagamento com formularios minimos que expandem | Epic 2 |
| **Financeiro (Semaforo)** | Contas a pagar/receber, fluxo de caixa, dashboard semaforo (verde/amarelo/vermelho), alertas proativos, "Quanto posso retirar?" | Epic 3 |
| **Vendas e PIX Nativo** | Venda rapida em 1 toque, orcamentos com conversao, cobranca PIX via Mercado Pago, conciliacao automatica via webhook | Epic 4 |
| **Fiscal** | Emissao de NFe, NFSe Nacional e NFCe via Focus NFe, campos CBS/IBS, determinacao automatica de regime tributario | Epic 5 |
| **WhatsApp, Estoque e PWA** | Envio de cobrancas e notificacoes via WhatsApp, estoque simplificado (entrada/saida/saldo/alertas), PWA instalavel com offline basico | Epic 6 |

### Diferenciais do MVP

- **Onboarding em 5 perguntas** -- sistema pronto para uso em menos de 5 minutos
- **Dashboard Semaforo** -- saude financeira em linguagem visual (verde/amarelo/vermelho), nao em numeros complexos
- **Venda em 30 segundos** -- 3 a 4 toques para registrar uma venda completa
- **PIX nativo com conciliacao automatica** -- gera QR code, recebe pagamento, baixa conta a receber sem intervencao manual
- **Compliance fiscal sem conhecimento contabil** -- sistema preenche automaticamente CFOP, CST, NCM e aliquotas
- **Modo informal** -- funciona sem CNPJ para nanoempreendedores (ate R$ 40,5k/ano)

---

## 3. Requisitos Funcionais

O PRD define 58 requisitos funcionais (FR1-FR58) organizados nos seguintes grupos:

| Grupo | FRs | Destaques |
|-------|-----|-----------|
| **Autenticacao e Multi-Tenant** | FR1-FR5 | Login Google OAuth, multi-tenant com RLS, Modo Informal sem CNPJ |
| **Onboarding** | FR6-FR8 | Wizard de 5 perguntas, pronto em < 5 min, importacao de contatos (LGPD) |
| **Cadastros Progressivos** | FR9-FR13 | Campos minimos que expandem, busca com autocomplete |
| **Financeiro** | FR14-FR22 | Dashboard semaforo, contas a pagar/receber, fluxo de caixa, alertas proativos, "Quanto posso retirar?" |
| **Vendas** | FR23-FR29 | Venda em 30s, orcamentos com conversao 1-clique, geracao automatica de financeiro e estoque |
| **PIX Nativo** | FR30-FR33 | QR code + copia-e-cola em 1 clique, conciliacao automatica via webhook, notificacao em tempo real |
| **Fiscal** | FR34-FR41 | NFe/NFSe/NFCe via Focus NFe, campos CBS/IBS, vinculacao Venda -> NFe -> Financeiro |
| **WhatsApp** | FR42-FR45 | Cobranca PIX, notificacao NFe, lembrete de vencimento, envio de orcamento |
| **Estoque** | FR46-FR50 | Entrada/saida automatica, saldo em tempo real, alertas de minimo |
| **PWA e Config** | FR51-FR58 | PWA instalavel com offline basico, 100% mobile, certificado digital, limites por plano |

---

## 4. Requisitos Nao-Funcionais

O PRD define 27 requisitos nao-funcionais (NFR1-NFR27):

| Categoria | Requisitos Principais |
|-----------|----------------------|
| **Performance** | FCP < 1,5s (4G), TTI < 3s, API < 200ms, dashboard < 2s, QR PIX < 1s |
| **Seguranca/LGPD** | TLS 1.3, RLS multi-tenant, audit logs, conformidade LGPD, rate limiting 100 req/min |
| **Disponibilidade** | Uptime 99,5%, backup a cada 6h (30 dias retencao), circuit breaker com modo degradado |
| **Escalabilidade** | 10.000 tenants simultaneos, banco particionavel, BullMQ + Redis para jobs assincronos |
| **Compatibilidade** | Chrome/Safari/Firefox/Edge, PWA Android 8+/iOS 14+, responsivo desde 320px |
| **Observabilidade** | Sentry (erros), PostHog (analytics), infra < US$ 50/mes ate 500 usuarios |

---

## 5. Epicos e Stories

### Fase 1 -- MVP (Epics 1-6)

#### Epic 1: Fundacao e Autenticacao

> Estabelecer infraestrutura base, autenticacao Google OAuth, multi-tenant com RLS e onboarding wizard.

| Story | Titulo | Descricao |
|-------|--------|-----------|
| 1.1 | Setup do Projeto e Infraestrutura | Next.js 15, TypeScript, Tailwind, shadcn/ui, PostgreSQL, Prisma, CI/CD |
| 1.2 | Autenticacao Google OAuth e Sessao | Login social, email/senha alternativo, JWT com refresh token |
| 1.3 | Multi-Tenant com Row-Level Security | RLS no PostgreSQL, alternancia entre empresas, isolamento total |
| 1.4 | Onboarding Wizard | 5 perguntas, configuracao automatica, pronto em 5 minutos |
| 1.5 | Layout Base e Navegacao Mobile-First | Bottom navigation, FAB de acoes rapidas, responsivo mobile/desktop |

#### Epic 2: Cadastros Progressivos

> Cadastros essenciais com modelo progressivo (campos minimos que expandem).

| Story | Titulo | Descricao |
|-------|--------|-----------|
| 2.1 | Cadastro de Clientes | Nome + telefone obrigatorios, expansao progressiva |
| 2.2 | Cadastro de Fornecedores | Mesmo padrao progressivo de clientes |
| 2.3 | Cadastro de Produtos e Servicos | Nome + preco obrigatorios, toggle de controle de estoque |
| 2.4 | Formas de Pagamento e Importacao de Contatos | Pre-configuracao via onboarding, importacao de contatos do celular |

#### Epic 3: Financeiro e Dashboard Semaforo

> Coracao do sistema -- visibilidade completa da saude financeira do negocio.

| Story | Titulo | Descricao |
|-------|--------|-----------|
| 3.1 | Contas a Pagar | Registro com vencimento, categoria, fornecedor, recorrencia |
| 3.2 | Contas a Receber | Vinculacao com vendas, cobranca via PIX e WhatsApp |
| 3.3 | Fluxo de Caixa e Dashboard Semaforo | Saldo real, grafico 30 dias, semaforo verde/amarelo/vermelho |
| 3.4 | Alertas Proativos e "Quanto Posso Retirar?" | Alertas de caixa em risco, calculo de retirada segura |

#### Epic 4: Vendas e PIX Nativo

> Vender e cobrar de forma integrada, com tudo refletido no financeiro.

| Story | Titulo | Descricao |
|-------|--------|-----------|
| 4.1 | Venda Rapida (1 Toque) | Venda completa em 30 segundos, geracao automatica de financeiro e estoque |
| 4.2 | Orcamentos com Conversao | Criar orcamento, converter em venda com 1 clique |
| 4.3 | Integracao PIX - Mercado Pago | QR code, copia-e-cola, link compartilhavel, expiracao |
| 4.4 | Webhook PIX e Conciliacao Automatica | Deteccao automatica de pagamento, notificacao em tempo real |

#### Epic 5: Fiscal (NFe/NFSe/NFCe)

> Emissao de documentos fiscais sem conhecimento contabil.

| Story | Titulo | Descricao |
|-------|--------|-----------|
| 5.1 | Configuracao Fiscal e Certificado Digital | Regime tributario, upload de certificado A1, ambiente hom/prod |
| 5.2 | Emissao de NFe (Produto) | Via Focus NFe, preenchimento automatico, emissao assincrona |
| 5.3 | Emissao de NFSe Nacional (Servico) | NFSe Nacional via Focus NFe, ISS automatico |
| 5.4 | Emissao de NFCe e Fluxo Fiscal Completo | NFCe para consumidor final, fluxo Venda -> NFe -> Financeiro |

#### Epic 6: WhatsApp, Estoque e PWA

> Completar o MVP com todas as integracoes e funcionalidades essenciais.

| Story | Titulo | Descricao |
|-------|--------|-----------|
| 6.1 | WhatsApp Business - Envio de Mensagens | Templates para cobranca, NFe, lembrete, orcamento |
| 6.2 | Lembretes Automaticos de Vencimento | Job diario, configuravel por tenant, link PIX incluso |
| 6.3 | Estoque Simplificado | Entrada/saida/ajuste, saldo em tempo real, alertas de minimo |
| 6.4 | PWA Completo e Offline Basico | Instalavel, cache strategies, offline para consultas, push notifications |
| 6.5 | Polish Final e Preparacao para Beta | UX review, testes E2E, Lighthouse > 90, seguranca |

**Total Fase 1: 6 epics, 22 stories**

---

### Fase 2 -- IA (Epics 7-9)

#### Epic 7: Captura Inteligente

> Registrar despesas, notas e vendas por foto ou WhatsApp, com extracao automatica por IA.

| Story | Titulo | Descricao |
|-------|--------|-----------|
| 7.1 | Infra de IA e Storage | Claude Vision API, Supabase Storage, modelo DocumentCapture |
| 7.2 | Captura de Nota/Despesa por Foto | Camera no app, OCR por IA, tela de aprovacao |
| 7.3 | Captura de Venda por Foto/Anotacao | Foto de itens ou texto livre, IA monta venda |
| 7.4 | Entrada via WhatsApp | Receber foto/texto pelo WhatsApp, processar com IA |
| 7.5 | Historico e Reprocessamento | Historico de capturas, status, reprocessamento |

#### Epic 8: CFO Virtual - IA Conversacional

> Assistente de IA que responde perguntas sobre o negocio em linguagem natural.

| Story | Titulo | Descricao |
|-------|--------|-----------|
| 8.1 | Infra de Chat e Consultas | Componente de chat, API de consultas, function calling |
| 8.2 | Consultas Financeiras | Vendas, saldo, despesas, lucro, comparativos |
| 8.3 | Analise de Clientes e Produtos | Rankings, inadimplentes, sazonalidade |
| 8.4 | Insights e Recomendacoes Proativas | IA identifica padroes e sugere acoes |

#### Epic 9: Precificacao Inteligente

> Ferramentas para precificar corretamente e analisar margem real.

| Story | Titulo | Descricao |
|-------|--------|-----------|
| 9.1 | Calculadora de Preco de Venda | Custo total -> preco sugerido com margem desejada |
| 9.2 | Analise de Margem por Produto | Dashboard de margens reais, alertas de margem negativa |
| 9.3 | Simulador de Cenarios | "E se?" -- desconto, aumento de custo, mudanca de imposto |

**Total Fase 2: 3 epics, 12 stories**

---

### Fase 3 -- Vendas Online (Epic 10)

#### Epic 10: Marketing e Vendas Online

> Transformar o ERPsb em plataforma de vendas com catalogo online, mini loja e integracao com marketplaces.

| Story | Titulo | Descricao |
|-------|--------|-----------|
| 10.1 | Catalogo Online Publico | Pagina publica com produtos, precos, fotos, link compartilhavel |
| 10.2 | Mini Loja com Carrinho e Checkout | Carrinho, checkout com PIX, pedido automatico no ERPsb |
| 10.3 | WhatsApp Marketing | Campanhas de promocao, reativacao de inativos, lancamentos |
| 10.4 | Integracao Mercado Livre | Sync de produtos, pedidos e estoque bidirecional |
| 10.5 | Integracao Shopee e iFood | Mesmo padrao para outros marketplaces |

**Total Fase 3: 1 epic, 5 stories**

---

**Totais do projeto: 10 epics, 39 stories**

---

## 6. Arquitetura Resumida

### Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Radix UI |
| **Backend** | Next.js API Routes (serverless), Zod (validacao), Pino (logging) |
| **Banco de dados** | PostgreSQL 16 via Supabase, Prisma ORM 6, Row-Level Security |
| **Autenticacao** | NextAuth.js v5 (Auth.js), Google OAuth, JWT |
| **Cache e Filas** | Upstash Redis (serverless), BullMQ |
| **Armazenamento** | Supabase Storage (XMLs fiscais, certificados, imagens) |
| **Integracoes** | Focus NFe (fiscal), Mercado Pago (PIX), WhatsApp Business API |
| **Monitoramento** | Sentry (erros), PostHog (analytics), Vercel Analytics |
| **Testes** | Vitest (unit/integration), Playwright (E2E), Testing Library |
| **CI/CD** | GitHub Actions, Vercel (deploy automatico) |
| **Hospedagem** | Vercel (frontend + API), Supabase (banco + storage), regiao GRU (Sao Paulo) |

### Padrao Arquitetural

**Monolito Modular (DDD)** -- modulos isolados por dominio de negocio dentro de um unico repositorio Next.js, comunicando-se via eventos internos (EventEmitter). Permite extrair modulos para microservicos no futuro sem retrabalho.

### Modelo de Dados

O sistema possui 17 entidades principais organizadas em 5 dominios:

- **Auth:** User, UserTenant, Tenant
- **Cadastros:** Cliente, Fornecedor, Produto, FormaPagamento
- **Financeiro:** ContaPagar, ContaReceber
- **Vendas:** Venda, Orcamento, PixCharge
- **Fiscal/Operacional:** NotaFiscal, ConfigFiscal, MovimentacaoEstoque, WhatsAppMessage, AuditLog

### Fluxo Principal: Venda Completa

```
Venda confirmada
  -> Conta a Receber criada automaticamente
  -> Estoque baixado automaticamente
  -> Cobranca PIX gerada (Mercado Pago)
  -> Webhook confirma pagamento
  -> Conta a Receber baixada automaticamente
  -> NFe emitida via Focus NFe (assincrono)
  -> Cliente notificado via WhatsApp
```

---

## 7. Plano de Entregas

| Fase | Periodo Estimado | Epics | Entregas Principais |
|------|-----------------|-------|---------------------|
| **Fase 1 -- MVP** | Meses 1-4 | Epics 1-6 (22 stories) | Sistema completo com cadastros, financeiro, vendas, PIX, fiscal, WhatsApp, estoque e PWA. Pronto para beta com usuarios reais. |
| **Fase 2 -- IA** | Meses 5-7 | Epics 7-9 (12 stories) | Captura inteligente por foto/WhatsApp, CFO Virtual com chat IA, calculadora de precificacao e analise de margem. |
| **Fase 3 -- Online** | Meses 8-10 | Epic 10 (5 stories) | Catalogo online publico, mini loja com checkout PIX, WhatsApp marketing, integracao com Mercado Livre, Shopee e iFood. |

### Marcos da Fase 1 (MVP)

| Marco | Epics | Resultado |
|-------|-------|-----------|
| **M1 -- Fundacao** | Epic 1 | Usuario pode cadastrar-se, criar empresa e ver dashboard vazio |
| **M2 -- Cadastros** | Epic 2 | Base de dados populada (clientes, fornecedores, produtos) |
| **M3 -- Financeiro** | Epic 3 | Visibilidade completa da saude financeira com dashboard semaforo |
| **M4 -- Vendas + PIX** | Epic 4 | Vender e cobrar via PIX de forma integrada |
| **M5 -- Fiscal** | Epic 5 | Emissao de notas fiscais automatizada |
| **M6 -- Completo** | Epic 6 | MVP completo com WhatsApp, estoque e PWA |

---

## 8. Metricas de Sucesso

### KPIs de Produto (Ano 1)

| Metrica | Meta | Prazo |
|---------|------|-------|
| Usuarios ativos | 1.000 | 6 meses apos lancamento |
| MRR (receita recorrente mensal) | R$ 20.000 | 12 meses |
| Time to Value | < 5 minutos (cadastro ate primeira venda) | Lancamento |
| Onboarding completion rate | > 80% | Lancamento |
| DAU/MAU ratio | > 40% | 6 meses |

### KPIs Tecnicos

| Metrica | Meta |
|---------|------|
| Lighthouse Performance Score | > 90 |
| Lighthouse PWA Score | > 90 |
| First Contentful Paint (4G) | < 1,5 segundos |
| API Latency p95 | < 500ms |
| Uptime | 99,5% |
| Cobertura de testes (core) | > 80% |

### KPIs de Engajamento

- **Vendas:** 80%+ registram pelo menos 1 venda/semana
- **PIX:** 50%+ das vendas geram cobranca PIX
- **Dashboard:** 70%+ acessam diariamente
- **Fiscal:** 60%+ dos usuarios com CNPJ emitem pelo menos 1 nota/mes
- **Captura IA (Fase 2):** 30%+ de adocao, 85%+ de precisao
- **CFO Virtual (Fase 2):** 40%+ fazem 1+ pergunta/semana

---

## 9. Riscos e Mitigacoes

| Categoria | Risco | Impacto | Mitigacao |
|-----------|-------|---------|-----------|
| Produto | Resistencia a tecnologia pelo publico-alvo | Alto | UX radicalmente simples, onboarding guiado, linguagem humana |
| Produto | Concorrentes grandes reagem ao nicho | Medio | Velocidade de execucao, foco MEI/informal, freemium como barreira |
| Produto | Reforma tributaria atrasa ou muda | Medio | Campos CBS/IBS opcionais, arquitetura flexivel |
| Tecnico | Integracoes externas fora do ar | Alto | Circuit breaker, filas com retry, modo degradado |
| Tecnico | Performance degrada com crescimento | Medio | Banco particionavel, Redis cache, monitoramento proativo |
| Tecnico | Seguranca multi-tenant comprometida | Alto | RLS no PostgreSQL, audit logs, testes de isolamento |
| Negocio | CAC alto / baixa conversao organica | Alto | Freemium como canal, WhatsApp marketing, SEO do catalogo |
| Negocio | Churn elevado apos periodo gratuito | Alto | Valor demonstrado antes da cobranca, CFO Virtual como retencao |
| Negocio | Regulamentacao PIX/pagamentos muda | Medio | Abstraction layer, adapter pattern para trocar provedor |

---

*Documentos de referencia: PRD (`docs/prd.md`), Arquitetura (`docs/architecture.md`), Stories (`docs/stories/`), Brief (`docs/brief.md`)*
