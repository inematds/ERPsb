# ERPsb - Product Requirements Document (PRD)

**Versao:** 1.0
**Data:** 2026-02-07
**Autor:** John (PM) - BMad Method
**Status:** Draft
**Baseado em:** Project Brief v1.0 (`docs/brief.md`)

---

## 1. Goals and Background Context

### 1.1 Goals

- Entregar um ERP SaaS mobile-first que permita nanoempreendedores, MEIs e microempresas brasileiras controlarem financas, vendas e fiscal em menos de 5 minutos de setup
- Ser o unico ERP mais simples que papel e planilha, eliminando barreiras de adocao para quem nunca usou sistema
- Oferecer PIX nativo com conciliacao automatica e WhatsApp integrado como canais primarios de cobranca e comunicacao
- Garantir compliance fiscal automatico (NFe, NFSe Nacional, campos CBS/IBS) sem exigir conhecimento contabil do usuario
- Capturar mercado de microempreendedores com modelo freemium honesto (gratis ate R$ 5k/mes de faturamento)
- Atingir 1.000 usuarios ativos em 6 meses e MRR de R$ 20.000 no primeiro ano
- Funcionar como PWA completo no celular, atendendo 70%+ dos usuarios que gerenciam pelo smartphone

### 1.2 Background Context

Microempreendedores brasileiros (MEIs, nanoempreendedores, pequenas empresas) representam a maior fatia do tecido empresarial do pais, mas operam com controles informais - cadernos, planilhas, WhatsApp e memoria. Essa falta de gestao contribui para que 29% das empresas fechem nos primeiros 5 anos (Sebrae). As solucoes ERP existentes (Bling, Omie, ContaAzul, Tiny) sao complexas demais, caras e assumem que o usuario ja tem processos formais organizados.

A reforma tributaria de 2026 (CBS/IBS, NFSe Nacional obrigatoria) cria uma janela de oportunidade unica: 97% das empresas nao estao preparadas e 33% pretendem trocar de ERP. O ERPsb se posiciona como o ERP que cresce com o empreendedor - do primeiro PIX ao primeiro milhao - combinando simplicidade radical, PIX nativo, WhatsApp integrado e compliance fiscal automatico. A pesquisa de mercado validou que nenhum concorrente atende bem esses gaps simultaneamente (ver `doc/analise-estrategica-erpsb.md`).

### 1.3 Change Log

| Data | Versao | Descricao | Autor |
|------|--------|-----------|-------|
| 2026-02-07 | 1.0 | Criacao inicial do PRD a partir do Project Brief v1.0 | John (PM) |

---

## 2. Requirements

### 2.1 Functional Requirements

**Autenticacao e Multi-Tenant**

- **FR1:** O sistema deve permitir cadastro e login via Google OAuth (login social) como metodo primario de autenticacao
- **FR2:** O sistema deve permitir cadastro via email/senha como metodo alternativo
- **FR3:** O sistema deve suportar multi-empresa (multi-tenant) com isolamento total de dados via Row-Level Security (RLS) no PostgreSQL
- **FR4:** O usuario deve poder criar e alternar entre multiplas empresas/negocios na mesma conta
- **FR5:** O sistema deve suportar "Modo Informal" - funcionamento sem CNPJ para nanoempreendedores (ate R$ 40,5k/ano)

**Onboarding**

- **FR6:** O onboarding deve consistir em um wizard de no maximo 5 perguntas que configura o sistema automaticamente (tipo de negocio, faturamento medio, regime tributario, se tem CNPJ, como cobra hoje)
- **FR7:** O sistema deve estar pronto para uso (primeira venda possivel) em menos de 5 minutos apos o cadastro
- **FR8:** O onboarding deve oferecer importacao de contatos do celular (com consentimento LGPD)

**Cadastros Progressivos**

- **FR9:** O cadastro de Clientes deve iniciar com campos minimos obrigatorios (nome e telefone) e expandir progressivamente conforme necessidade (CPF/CNPJ, endereco, email, etc.)
- **FR10:** O cadastro de Fornecedores deve seguir o mesmo padrao progressivo do cadastro de Clientes
- **FR11:** O cadastro de Produtos/Servicos deve iniciar com campos minimos (nome e valor de venda) e expandir progressivamente (codigo de barras, NCM, unidade de medida, custo, estoque)
- **FR12:** O cadastro de Formas de Pagamento deve vir pre-configurado (PIX, Dinheiro, Cartao Debito, Cartao Credito, Boleto) com opcao de personalizar
- **FR13:** O sistema deve permitir busca rapida em todos os cadastros com autocomplete

**Financeiro (Dashboard Semaforo)**

- **FR14:** O sistema deve exibir dashboard financeiro com indicadores visuais tipo semaforo: Verde (caixa saudavel), Amarelo (atencao - caixa apertado), Vermelho (caixa critico)
- **FR15:** O sistema deve manter registro de contas a pagar com data de vencimento, valor, fornecedor, categoria e status (pendente/pago/vencido)
- **FR16:** O sistema deve manter registro de contas a receber com data de vencimento, valor, cliente, origem (venda) e status (pendente/recebido/vencido)
- **FR17:** O sistema deve calcular e exibir fluxo de caixa diario com saldo real atualizado em tempo real
- **FR18:** O sistema deve gerar alertas proativos quando detectar risco de caixa negativo nos proximos 7, 15 e 30 dias
- **FR19:** O sistema deve permitir separacao de movimentacoes pessoa fisica vs pessoa juridica (conta pessoal vs empresa)
- **FR20:** O sistema deve responder a pergunta "Quanto posso retirar esse mes?" com base no saldo, contas a pagar futuras e media de recebimentos
- **FR21:** O sistema deve permitir categorizacao de receitas e despesas (categorias pre-definidas + personalizaveis)
- **FR22:** Toda venda registrada deve gerar automaticamente um lancamento em contas a receber

**Vendas (1 Toque)**

- **FR23:** O sistema deve permitir criar uma venda direta em no maximo 30 segundos (selecionar produto/servico + cliente + forma de pagamento + confirmar)
- **FR24:** O sistema deve permitir criar orcamentos com itens, quantidades, valores e desconto
- **FR25:** O sistema deve permitir converter orcamento em venda com 1 clique
- **FR26:** Toda venda confirmada deve gerar automaticamente lancamento financeiro (conta a receber) e baixa de estoque (se produto)
- **FR27:** O sistema deve gerar link de pagamento PIX automaticamente ao confirmar venda
- **FR28:** O sistema deve permitir venda sem cliente identificado (venda balcao/consumidor final)
- **FR29:** O sistema deve manter historico completo de vendas com filtros por periodo, cliente, produto e status

**PIX Nativo**

- **FR30:** O sistema deve gerar cobranca PIX (QR code + copia-e-cola + link compartilhavel) em 1 clique a partir de qualquer venda ou conta a receber
- **FR31:** O sistema deve receber notificacao de pagamento PIX via webhook e baixar automaticamente a conta a receber correspondente (conciliacao automatica)
- **FR32:** O sistema deve notificar o usuario em tempo real quando um pagamento PIX for recebido
- **FR33:** O sistema deve permitir compartilhar link de pagamento PIX via WhatsApp, SMS ou qualquer app de mensagem

**Fiscal (Compliance Automatico)**

- **FR34:** O sistema deve emitir NFe (Nota Fiscal Eletronica de produto) via integracao com API fiscal (Focus NFe)
- **FR35:** O sistema deve emitir NFSe Nacional (Nota Fiscal de Servico eletronica) via integracao com API fiscal
- **FR36:** O sistema deve emitir NFCe (Nota Fiscal de Consumidor eletronica) para vendas a consumidor final
- **FR37:** O sistema deve incluir campos CBS/IBS conforme reforma tributaria 2026 em todos os documentos fiscais
- **FR38:** O sistema deve vincular automaticamente: Venda -> NFe/NFSe -> Lancamento financeiro (fluxo completo sem intervencao manual)
- **FR39:** O sistema deve determinar automaticamente o regime tributario e aliquotas com base nos dados da empresa (Simples Nacional, MEI, etc.)
- **FR40:** O sistema deve permitir emissao de documento fiscal sem exigir conhecimento contabil do usuario - preenchendo automaticamente CFOP, CST, NCM quando possivel
- **FR41:** O sistema deve armazenar XML das notas fiscais emitidas e permitir download

**WhatsApp Business**

- **FR42:** O sistema deve permitir enviar cobranca PIX (link + valor) via WhatsApp para o cliente com 1 clique
- **FR43:** O sistema deve enviar notificacao automatica via WhatsApp quando NFe/NFSe for emitida para o cliente
- **FR44:** O sistema deve enviar lembrete automatico de vencimento via WhatsApp (configuravel: 3 dias antes, no dia, 1 dia depois)
- **FR45:** O sistema deve permitir enviar orcamento formatado via WhatsApp para o cliente

**Estoque Simplificado**

- **FR46:** O sistema deve registrar entrada de estoque vinculada a compra/fornecedor
- **FR47:** O sistema deve registrar saida automatica de estoque vinculada a venda
- **FR48:** O sistema deve exibir saldo atual de cada produto em tempo real
- **FR49:** O sistema deve alertar quando produto atingir estoque minimo (configuravel por produto)
- **FR50:** O estoque nao deve incluir controle de lotes, series, localizacao ou inventario complexo no MVP

**PWA Mobile-First**

- **FR51:** O sistema deve funcionar como PWA instalavel no celular (manifest.json, service worker, icone na home screen)
- **FR52:** Todas as operacoes essenciais (vender, cobrar, consultar saldo, emitir nota) devem ser executaveis 100% pelo celular
- **FR53:** O sistema deve utilizar camera do celular para digitalizar notas de fornecedor (captura de imagem para anexo)
- **FR54:** O sistema deve funcionar em modo offline basico (consultar cadastros e saldos) com sincronizacao posterior

**Configuracoes e Perfil**

- **FR55:** O sistema deve permitir configurar dados da empresa (razao social, CNPJ/CPF, endereco, regime tributario, logo)
- **FR56:** O sistema deve permitir configurar certificado digital para emissao de NFe (upload A1)
- **FR57:** O sistema deve permitir configurar preferencias de notificacao (WhatsApp, email, push)
- **FR58:** O sistema deve implementar controle de limites por plano (faturamento, quantidade de vendas, funcionalidades disponiveis)

### 2.2 Non-Functional Requirements

**Performance**

- **NFR1:** First Contentful Paint (FCP) deve ser inferior a 1.5 segundos em conexao 4G
- **NFR2:** Time to Interactive (TTI) deve ser inferior a 3 segundos em conexao 4G
- **NFR3:** API responses devem ter latencia media inferior a 200ms para operacoes CRUD
- **NFR4:** Geracao de QR code PIX deve completar em menos de 1 segundo
- **NFR5:** Dashboard financeiro deve carregar em menos de 2 segundos com ate 12 meses de dados

**Seguranca e LGPD**

- **NFR6:** Todos os dados devem ser criptografados em transito (TLS 1.3) e em repouso
- **NFR7:** Multi-tenant deve usar Row-Level Security (RLS) no PostgreSQL garantindo isolamento total entre tenants
- **NFR8:** O sistema deve manter audit logs de todas as operacoes criticas (login, alteracao de dados financeiros, emissao fiscal, exclusao de registros)
- **NFR9:** O sistema deve estar em conformidade com LGPD: consentimento explicito para dados pessoais, direito ao esquecimento, portabilidade de dados
- **NFR10:** Senhas devem ser armazenadas com hash bcrypt (custo >= 12)
- **NFR11:** API deve implementar rate limiting para prevenir abuso (100 req/min por tenant)
- **NFR12:** Tokens de sessao devem expirar em 24 horas com refresh token de 30 dias

**Disponibilidade e Confiabilidade**

- **NFR13:** O sistema deve ter disponibilidade de 99.5% (downtime maximo ~3.6h/mes)
- **NFR14:** Backup automatico do banco de dados a cada 6 horas com retencao de 30 dias
- **NFR15:** Integracoes externas (Focus NFe, Mercado Pago, WhatsApp) devem usar circuit breaker pattern com retry automatico e fila de fallback
- **NFR16:** O sistema deve funcionar em modo degradado quando integracoes externas estiverem indisponiveis (gravar operacao pendente e processar quando disponivel)

**Escalabilidade**

- **NFR17:** A arquitetura deve suportar ate 10.000 tenants ativos simultaneos sem degradacao significativa
- **NFR18:** O banco de dados deve ser particionavel por tenant_id quando necessario para performance
- **NFR19:** Jobs assincronos (NFe, WhatsApp, webhooks) devem usar fila (BullMQ + Redis) com concorrencia configuravel

**Compatibilidade**

- **NFR20:** O sistema deve funcionar nos navegadores Chrome, Safari, Firefox e Edge (ultimas 2 versoes)
- **NFR21:** O PWA deve funcionar em Android 8+ e iOS 14+
- **NFR22:** A interface deve ser responsiva: mobile-first com suporte a tablet e desktop
- **NFR23:** O sistema deve funcionar adequadamente em telas a partir de 320px de largura

**Observabilidade**

- **NFR24:** O sistema deve integrar monitoramento de erros (Sentry) com alertas para erros criticos
- **NFR25:** O sistema deve integrar analytics de uso (PostHog) para metricas de produto (DAU/MAU, Time to Value, funnel de onboarding)
- **NFR26:** Logs estruturados em JSON para todas as operacoes de negocio (vendas, fiscal, pagamentos)

**Custos**

- **NFR27:** A infraestrutura deve priorizar tiers gratuitos e pay-as-you-go: Vercel free tier, Supabase free tier, para manter custos abaixo de US$ 50/mes ate 500 usuarios ativos

---

## 3. User Interface Design Goals

### 3.1 Overall UX Vision

A experiencia do ERPsb deve ser radicalmente simples - mais proxima de um app de mensagens do que de um ERP tradicional. O usuario-alvo (MEI que controla tudo pelo celular) nunca usou um sistema de gestao e se intimida com interfaces cheias de menus, tabelas e formularios longos. A UX deve transmitir: "Isso e facil. Eu consigo usar isso."

Principios visuais:
- **Minimalismo funcional** - cada tela tem 1 objetivo claro
- **Linguagem humana** - semaforo em vez de numeros, perguntas em vez de relatorios
- **Acao em 1-2 toques** - operacoes frequentes acessiveis sem navegacao profunda
- **Feedback instantaneo** - toda acao gera resposta visual/sonora imediata
- **Educacao contextual** - dicas e tooltips ensinam gestao sem ser invasivo

### 3.2 Key Interaction Paradigms

- **Mobile-first touch** - botoes grandes (min 44px), gestos de swipe, pull-to-refresh
- **Bottom navigation** - menu principal no rodape (polegar alcanca facilmente)
- **Progressive disclosure** - mostrar apenas o essencial, expandir sob demanda
- **Quick actions FAB** - botao flutuante "+" para acoes rapidas (nova venda, nova cobranca, nova despesa)
- **Cards e chips** - informacao agrupada em cartoes visuais com status por cor
- **Formularios conversacionais** - campos aparecem um a um em fluxos criticos (onboarding, primeira venda)
- **Busca universal** - campo de busca acessivel em qualquer tela para encontrar clientes, produtos, vendas

### 3.3 Core Screens and Views

1. **Tela de Login/Cadastro** - Login social (Google) como CTA principal, email como alternativa
2. **Onboarding Wizard** - 5 telas com perguntas simples, uma por vez, com progresso visual
3. **Dashboard Principal (Home)** - Semaforo financeiro, saldo do dia, alertas, acoes rapidas (vender, cobrar, ver vendas)
4. **Modulo Financeiro** - Contas a pagar/receber em lista com filtros, fluxo de caixa grafico, botao "Quanto posso retirar?"
5. **Nova Venda (Quick Sale)** - Tela otimizada para venda rapida: selecionar itens, cliente (opcional), forma de pagamento, confirmar
6. **Orcamentos** - Lista de orcamentos com status, detalhes, botao "Converter em Venda" e "Enviar WhatsApp"
7. **Cobranca PIX** - QR code grande, botao copiar, botao compartilhar WhatsApp, status em tempo real
8. **Emissao Fiscal** - Formulario simplificado (sistema preenche automaticamente), preview da nota, botao emitir
9. **Cadastro de Clientes** - Lista com busca, cartao do cliente com historico resumido, formulario progressivo
10. **Cadastro de Produtos** - Lista com busca, cartao do produto com preco e estoque, formulario progressivo
11. **Estoque** - Lista de produtos com saldo, alertas de minimo, historico de movimentacoes
12. **Configuracoes** - Dados da empresa, certificado digital, notificacoes, plano/assinatura
13. **Notificacoes** - Centro de notificacoes (pagamentos recebidos, vencimentos, alertas de caixa)

### 3.4 Accessibility: WCAG AA

O sistema deve atender WCAG 2.1 nivel AA:
- Contraste minimo de 4.5:1 para texto normal
- Suporte a leitores de tela (ARIA labels)
- Navegacao por teclado em todas as funcionalidades
- Textos alternativos para elementos visuais
- Tamanho minimo de fonte 16px no mobile

### 3.5 Branding

- **Estilo visual:** Limpo, moderno, amigavel - inspirado em apps de fintech brasileiras (Nubank, PicPay)
- **Cores primarias:** A definir - preferencialmente tons que transmitam confianca e simplicidade (azul/verde)
- **Tipografia:** Sans-serif moderna (Inter ou similar) para legibilidade em telas pequenas
- **Tom de voz:** Informal, acolhedor, educativo - "Voce vendeu R$ 350 hoje! Seu caixa esta saudavel."
- **Icones:** Rounded, filled, estilo consistente (Lucide Icons via shadcn/ui)
- **Semaforo:** Verde (#22C55E), Amarelo (#EAB308), Vermelho (#EF4444) - cores do dashboard financeiro

### 3.6 Target Device and Platforms: Web Responsive (Mobile-First)

- **Primario:** Smartphones Android (320px-428px) - 70%+ dos usuarios
- **Secundario:** Smartphones iOS (375px-430px)
- **Terciario:** Tablets (768px-1024px) e Desktop (1024px+)
- **PWA:** Instalavel como app nativo no Android e iOS
- **Orientacao:** Portrait como padrao, landscape suportado em tablets/desktop

---

## 4. Technical Assumptions

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

## 5. Epic List

> Epics sequenciados para entrega incremental de valor. Cada epic e um incremento deployavel e testavel.

### Epic 1: Fundacao e Autenticacao
**Goal:** Estabelecer a infraestrutura base do projeto (Next.js, PostgreSQL, CI/CD), implementar autenticacao com Google OAuth, multi-tenant com RLS, e entregar o onboarding wizard - resultando em um sistema onde o usuario pode se cadastrar, criar sua empresa e estar pronto para usar o sistema.

### Epic 2: Cadastros Progressivos
**Goal:** Implementar os cadastros essenciais (Clientes, Fornecedores, Produtos/Servicos, Formas de Pagamento) com modelo progressivo (campos minimos que expandem) e busca rapida, permitindo que o usuario popule sua base de dados de forma simples e natural.

### Epic 3: Financeiro e Dashboard Semaforo
**Goal:** Implementar o coracao do sistema - contas a pagar/receber, fluxo de caixa diario, dashboard com semaforo visual (verde/amarelo/vermelho), alertas proativos de caixa e a funcionalidade "Quanto posso retirar?" - entregando ao usuario visibilidade real sobre a saude financeira do negocio.

### Epic 4: Vendas e PIX Nativo
**Goal:** Implementar vendas rapidas (1 toque), orcamentos com conversao em venda, integracao PIX via Mercado Pago (geracao de cobranca, QR code, conciliacao automatica via webhook), e a vinculacao automatica Venda -> Financeiro - permitindo ao usuario vender e cobrar de forma integrada.

### Epic 5: Fiscal (NFe/NFSe/NFCe)
**Goal:** Implementar emissao de documentos fiscais (NFe, NFSe Nacional, NFCe) via Focus NFe com campos CBS/IBS preparados, vinculacao automatica Venda -> NFe -> Financeiro, e determinacao automatica de regime tributario - eliminando complexidade fiscal para o usuario.

### Epic 6: WhatsApp, Estoque e PWA
**Goal:** Implementar integracao WhatsApp Business (envio de cobranca, notificacao de NFe, lembrete de vencimento), estoque simplificado (entrada/saida/saldo com alertas), e PWA completo (instalavel, offline basico) - completando o MVP com todos os modulos e integracoes essenciais.

---

## 6. Epic Details

### Epic 1: Fundacao e Autenticacao

**Goal expandido:** Este epic estabelece toda a base tecnica do ERPsb: projeto Next.js 15 com TypeScript, banco PostgreSQL com Prisma ORM, CI/CD via GitHub Actions + Vercel, autenticacao Google OAuth via NextAuth.js v5, sistema multi-tenant com RLS, e onboarding wizard. Ao final, um usuario pode se cadastrar, fazer login, criar sua empresa via wizard de 5 perguntas, e ver o dashboard vazio pronto para uso. Inclui setup de monitoring (Sentry), analytics (PostHog) e logging desde o inicio.

#### Story 1.1: Setup do Projeto e Infraestrutura Base

**Como** desenvolvedor,
**Quero** ter o projeto Next.js 15 configurado com TypeScript, Tailwind, shadcn/ui, PostgreSQL, Prisma e CI/CD,
**Para que** a equipe possa iniciar o desenvolvimento com a stack completa e pipeline de deploy funcionando.

**Acceptance Criteria:**
1. Projeto Next.js 15 (App Router) criado com TypeScript 5 strict mode, Tailwind CSS 4 e shadcn/ui configurados
2. Prisma ORM configurado e conectado ao PostgreSQL (Supabase) com schema inicial (modelo Tenant e User)
3. ESLint + Prettier configurados com regras para TypeScript e React
4. Estrutura de pastas DDD criada: `src/core/`, `src/modules/`, `src/integrations/`, `src/lib/`, `src/app/`
5. GitHub Actions configurado: lint + type-check + testes unitarios em cada PR
6. Deploy automatico via Vercel em push para main (preview deploys em PRs)
7. Sentry configurado para captura de erros (client e server)
8. Variáveis de ambiente configuradas (.env.example documentado)
9. pnpm como gerenciador de pacotes com lockfile commitado
10. Health check endpoint (`/api/health`) retornando status do servidor e conexao com banco

#### Story 1.2: Autenticacao Google OAuth e Sessao

**Como** usuario,
**Quero** fazer login com minha conta Google,
**Para que** eu possa acessar o sistema sem precisar criar uma senha nova.

**Acceptance Criteria:**
1. NextAuth.js v5 configurado com Google OAuth provider
2. Tela de login responsiva (mobile-first) com botao "Entrar com Google" como CTA principal
3. Opcao secundaria de cadastro/login via email + senha
4. Sessao JWT com expiracao de 24h e refresh token de 30 dias
5. Middleware de autenticacao protegendo todas as rotas exceto login e landing
6. Model User no Prisma com campos: id, email, name, image, provider, createdAt, updatedAt
7. Redirect apos login para onboarding (se primeiro acesso) ou dashboard (se ja tem empresa)
8. Logout funcional com limpeza de sessao

#### Story 1.3: Multi-Tenant com Row-Level Security

**Como** usuario com multiplas empresas,
**Quero** que meus dados de cada empresa sejam completamente isolados,
**Para que** eu possa alternar entre empresas sem risco de vazamento de dados.

**Acceptance Criteria:**
1. Model Tenant no Prisma com campos: id, name, document (CNPJ/CPF, opcional), type (MEI/ME/informal), plan (free/starter/growth/pro), createdAt
2. Model UserTenant (relacao N:N) com campos: userId, tenantId, role (owner/admin/user)
3. Row-Level Security (RLS) habilitado no PostgreSQL com policies por tenant_id para todas as tabelas de dados
4. Middleware que injeta tenant_id no contexto de cada request com base na sessao do usuario
5. Endpoint para criar novo tenant (empresa)
6. Endpoint para listar tenants do usuario e alternar o tenant ativo
7. Todas as queries Prisma filtradas automaticamente por tenant_id via middleware/extension
8. Teste de isolamento: dados de tenant A nunca acessiveis por tenant B

#### Story 1.4: Onboarding Wizard

**Como** novo usuario,
**Quero** configurar minha empresa respondendo 5 perguntas simples,
**Para que** o sistema esteja pronto para uso em menos de 5 minutos.

**Acceptance Criteria:**
1. Wizard de 5 steps com UI conversacional (1 pergunta por tela, progresso visual):
   - Step 1: "Qual o nome do seu negocio?" (texto livre)
   - Step 2: "Que tipo de negocio voce tem?" (opcoes: Servicos, Comercio, Alimentacao, Beleza, Outro)
   - Step 3: "Quanto voce fatura por mes, mais ou menos?" (faixas: Ate R$5k, R$5-20k, R$20-100k, Acima R$100k)
   - Step 4: "Voce tem CNPJ?" (Sim - informar CNPJ / Nao - modo informal)
   - Step 5: "Como voce cobra seus clientes hoje?" (multipla escolha: PIX, Dinheiro, Cartao, Boleto)
2. Sistema configura automaticamente: tipo de tenant, plano sugerido, formas de pagamento, categorias financeiras
3. Ao concluir, redireciona para dashboard com mensagem de boas-vindas e dicas contextuais
4. Possibilidade de pular o wizard e configurar depois
5. Dados do wizard salvos no tenant e editaveis em Configuracoes
6. Mobile-first: botoes grandes, transicoes suaves, funciona bem em telas de 320px

#### Story 1.5: Layout Base e Navegacao Mobile-First

**Como** usuario,
**Quero** uma interface clara com navegacao facil pelo celular,
**Para que** eu consiga acessar todas as funcoes sem me perder.

**Acceptance Criteria:**
1. Layout base com bottom navigation (5 tabs): Home, Financeiro, Vender, Fiscal, Menu
2. Header com nome da empresa ativa, sino de notificacoes e avatar do usuario
3. FAB (Floating Action Button) "+" para acoes rapidas: Nova Venda, Nova Cobranca, Nova Despesa
4. Dashboard Home vazio com placeholders e CTAs para primeiras acoes ("Cadastre seu primeiro cliente", "Faca sua primeira venda")
5. Tela de Configuracoes acessivel via Menu com dados da empresa, perfil do usuario e opcao de alternar empresa
6. Responsivo: layout adapta de mobile (bottom nav) para desktop (sidebar nav) em breakpoint 1024px
7. Tema com cores do semaforo integrado ao Tailwind config
8. Loading states (skeleton) e empty states para todas as telas principais

---

### Epic 2: Cadastros Progressivos

**Goal expandido:** Este epic implementa os quatro cadastros essenciais do ERP (Clientes, Fornecedores, Produtos/Servicos, Formas de Pagamento) com o modelo progressivo que diferencia o ERPsb: comeca com campos minimos e expande conforme necessidade. Inclui busca rapida com autocomplete e importacao de contatos do celular. Ao final, o usuario tem toda a base de dados necessaria para iniciar vendas.

#### Story 2.1: Cadastro de Clientes Progressivo

**Como** usuario,
**Quero** cadastrar clientes rapidamente com apenas nome e telefone,
**Para que** eu possa comecar a vender sem perder tempo preenchendo formularios longos.

**Acceptance Criteria:**
1. Model Cliente no Prisma: id, tenantId, name (obrigatorio), phone (obrigatorio), email, document (CPF/CNPJ), address (JSON), notes, createdAt, updatedAt
2. Formulario de criacao com apenas 2 campos visíveis inicialmente (nome e telefone)
3. Botao "Mais detalhes" expande progressivamente: email, CPF/CNPJ, endereco completo, observacoes
4. Lista de clientes com busca por nome/telefone/documento com autocomplete
5. Tela de detalhe do cliente com informacoes e futuro historico de vendas (placeholder)
6. Edicao inline dos campos do cliente
7. Validacao de CPF/CNPJ quando preenchido
8. Paginacao ou scroll infinito na lista
9. RLS aplicado - clientes isolados por tenant

#### Story 2.2: Cadastro de Fornecedores Progressivo

**Como** usuario,
**Quero** cadastrar fornecedores de forma rapida,
**Para que** eu possa registrar minhas compras e contas a pagar associadas.

**Acceptance Criteria:**
1. Model Fornecedor no Prisma: id, tenantId, name (obrigatorio), phone, email, document (CNPJ/CPF), address (JSON), notes, createdAt, updatedAt
2. Formulario progressivo identico ao de Clientes (nome obrigatorio, demais expandiveis)
3. Lista com busca por nome/telefone/documento
4. Tela de detalhe do fornecedor
5. Edicao inline dos campos
6. RLS aplicado - fornecedores isolados por tenant

#### Story 2.3: Cadastro de Produtos e Servicos Progressivo

**Como** usuario,
**Quero** cadastrar meus produtos e servicos com apenas nome e preco,
**Para que** eu possa comecar a vender imediatamente.

**Acceptance Criteria:**
1. Model Produto no Prisma: id, tenantId, type (produto/servico), name (obrigatorio), sellPrice (obrigatorio, em centavos), costPrice (centavos, opcional), unit (un/kg/hr/srv), barcode, ncm, description, stockMin, trackStock (boolean), active (boolean), createdAt, updatedAt
2. Formulario com campos minimos: nome, tipo (produto/servico), preco de venda
3. Expansao progressiva: preco de custo, unidade de medida, codigo de barras, NCM, descricao, estoque minimo
4. Toggle "Controlar estoque" (default: true para produtos, false para servicos)
5. Lista com busca por nome/codigo de barras
6. Tela de detalhe com informacoes e futuro historico de vendas (placeholder)
7. Validacao: preco deve ser positivo, NCM formato valido quando preenchido
8. RLS aplicado

#### Story 2.4: Formas de Pagamento e Importacao de Contatos

**Como** usuario,
**Quero** ter formas de pagamento pre-configuradas e poder importar contatos do celular,
**Para que** eu nao precise configurar tudo do zero.

**Acceptance Criteria:**
1. Model FormaPagamento no Prisma: id, tenantId, name, type (pix/dinheiro/debito/credito/boleto/outro), active, isDefault, installments (max parcelas), fee (taxa percentual), createdAt
2. Formas de pagamento pre-criadas no onboarding com base na resposta do wizard (step 5)
3. Tela de gerenciamento: ativar/desativar, editar nome, definir taxa, definir parcelas maximas
4. API de importacao de contatos: recebe lista de contatos (nome + telefone) e cria clientes em batch (com de-duplicacao por telefone)
5. Botao "Importar Contatos" na tela de clientes que acessa Contacts API do navegador (com permissao LGPD)
6. Feedback visual da importacao: X contatos importados, Y duplicados ignorados

---

### Epic 3: Financeiro e Dashboard Semaforo

**Goal expandido:** Este epic implementa o modulo financeiro - o coracao do ERPsb. Inclui contas a pagar e receber com categorizacao, fluxo de caixa diario com saldo real, o dashboard semaforo (verde/amarelo/vermelho) que traduz numeros em linguagem visual, alertas proativos de caixa, e a funcionalidade "Quanto posso retirar?". Ao final, o usuario tem visibilidade completa da saude financeira do seu negocio.

#### Story 3.1: Contas a Pagar

**Como** usuario,
**Quero** registrar minhas contas a pagar com vencimento e categoria,
**Para que** eu nunca esqueca de pagar uma conta e saiba exatamente quanto devo.

**Acceptance Criteria:**
1. Model ContaPagar no Prisma: id, tenantId, description, amount (centavos), dueDate, paidDate, status (pendente/pago/vencido/cancelado), category, supplierId (FK opcional), notes, recurrent (boolean), recurrenceType (mensal/semanal), createdAt, updatedAt
2. Formulario de criacao: descricao, valor, vencimento, fornecedor (autocomplete), categoria (select com opcoes pre-definidas + customizavel)
3. Categorias pre-definidas: Aluguel, Funcionarios, Fornecedores, Impostos, Marketing, Servicos, Outros
4. Lista de contas a pagar com filtros: status (todas/pendentes/vencidas/pagas), periodo, categoria
5. Acao "Marcar como pago" com 1 toque (registra data de pagamento = hoje)
6. Indicador visual: vencidas em vermelho, vencendo em 3 dias em amarelo, futuras em cinza
7. Opcao de conta recorrente (cria automaticamente a proxima ao pagar)
8. RLS aplicado

#### Story 3.2: Contas a Receber

**Como** usuario,
**Quero** registrar o que tenho a receber com datas e clientes,
**Para que** eu saiba quanto dinheiro vai entrar e possa cobrar em dia.

**Acceptance Criteria:**
1. Model ContaReceber no Prisma: id, tenantId, description, amount (centavos), dueDate, receivedDate, status (pendente/recebido/vencido/cancelado), category, clientId (FK opcional), saleId (FK opcional), pixChargeId (opcional), notes, createdAt, updatedAt
2. Formulario de criacao: descricao, valor, vencimento, cliente (autocomplete), categoria
3. Categorias: Vendas, Servicos, Outros
4. Lista com filtros: status, periodo, cliente
5. Acao "Marcar como recebido" com 1 toque
6. Indicador visual: vencidas em vermelho, vencendo em 3 dias em amarelo
7. Botao "Cobrar via PIX" (placeholder para Epic 4) e "Lembrar via WhatsApp" (placeholder para Epic 6)
8. RLS aplicado

#### Story 3.3: Fluxo de Caixa e Dashboard Semaforo

**Como** usuario,
**Quero** ver meu fluxo de caixa diario com um semaforo visual,
**Para que** eu saiba instantaneamente se meu negocio esta saudavel.

**Acceptance Criteria:**
1. Dashboard principal exibe: saldo atual (receitas recebidas - despesas pagas), receitas do dia/semana/mes, despesas do dia/semana/mes
2. Semaforo visual baseado em regras:
   - Verde: saldo cobre 30+ dias de despesas medias
   - Amarelo: saldo cobre 7-30 dias de despesas medias
   - Vermelho: saldo cobre menos de 7 dias ou esta negativo
3. Grafico de fluxo de caixa dos ultimos 30 dias (linha com area: receitas em verde, despesas em vermelho)
4. Lista resumida: proximas 5 contas a pagar e proximas 5 contas a receber
5. Valor total pendente a pagar e total pendente a receber exibidos com destaque
6. Dados atualizados em tempo real quando usuario acessa o dashboard
7. Responsivo: funciona bem em tela de 320px ate desktop

#### Story 3.4: Alertas Proativos e "Quanto Posso Retirar?"

**Como** usuario,
**Quero** receber alertas quando meu caixa estiver em risco e saber quanto posso retirar,
**Para que** eu tome decisoes financeiras melhores.

**Acceptance Criteria:**
1. Sistema de alertas que calcula diariamente:
   - Contas a vencer nos proximos 7 dias vs saldo atual
   - Se despesas futuras (30 dias) superam recebimentos previstos
   - Se ha contas vencidas nao pagas
2. Alertas exibidos como cards no topo do dashboard com icones de alerta
3. Notificacao push (se PWA instalado) para alertas criticos (caixa negativo iminente)
4. Funcionalidade "Quanto posso retirar?":
   - Calcula: saldo atual - contas a pagar proximos 30 dias - reserva de seguranca (10% do faturamento medio)
   - Exibe resultado com explicacao simples: "Voce pode retirar ate R$ X. Depois disso, seu caixa fica apertado."
5. Card de resumo financeiro no dashboard com linguagem humana: "Esse mes voce recebeu R$ X e gastou R$ Y"

---

### Epic 4: Vendas e PIX Nativo

**Goal expandido:** Este epic implementa o modulo de vendas (venda rapida em 1 toque, orcamentos, conversao automatica para financeiro) e a integracao PIX via Mercado Pago (geracao de cobranca, QR code, webhook de pagamento, conciliacao automatica). Ao final, o usuario pode vender, cobrar via PIX e ter tudo refletido automaticamente no financeiro.

#### Story 4.1: Venda Rapida (1 Toque)

**Como** usuario,
**Quero** registrar uma venda em menos de 30 segundos,
**Para que** eu nao perca tempo entre atender clientes.

**Acceptance Criteria:**
1. Model Venda no Prisma: id, tenantId, clientId (opcional), items (JSON array: productId, name, quantity, unitPrice, total), subtotal, discount, total, paymentMethod, status (rascunho/confirmada/cancelada), notes, createdAt, updatedAt
2. Tela de nova venda otimizada:
   - Busca rapida de produto (por nome ou codigo)
   - Adicionar quantidade com +/- ou teclado numerico
   - Cliente opcional (busca por nome/telefone)
   - Forma de pagamento (selecao rapida com icones)
   - Botao "Confirmar Venda" grande e visivel
3. Ao confirmar venda: cria automaticamente conta a receber no financeiro
4. Se produto tem estoque controlado: baixa automatica do estoque
5. Tela de confirmacao com resumo e opcoes: "Gerar PIX", "Emitir Nota" (placeholders), "Nova Venda"
6. Historico de vendas com filtros (periodo, cliente, status)
7. Meta de UX: venda completa em 30 segundos ou menos (3-4 toques)

#### Story 4.2: Orcamentos com Conversao

**Como** usuario,
**Quero** criar orcamentos e converte-los em vendas com 1 clique,
**Para que** eu possa negociar com clientes sem perder o registro.

**Acceptance Criteria:**
1. Model Orcamento no Prisma: id, tenantId, clientId, items (JSON array), subtotal, discount, total, validUntil, status (pendente/aprovado/recusado/convertido/expirado), notes, saleId (FK quando convertido), createdAt, updatedAt
2. Formulario de orcamento: mesma UX de venda mas com data de validade
3. Lista de orcamentos com filtros (status, periodo, cliente)
4. Botao "Converter em Venda" que cria venda a partir dos dados do orcamento
5. Orcamento convertido muda status para "convertido" com link para a venda
6. Orcamentos vencidos mudam automaticamente para status "expirado"
7. Opcao de duplicar orcamento existente

#### Story 4.3: Integracao PIX - Mercado Pago (Cobranca e QR Code)

**Como** usuario,
**Quero** gerar cobranca PIX em 1 clique com QR code,
**Para que** meu cliente possa pagar instantaneamente pelo celular.

**Acceptance Criteria:**
1. Integracao com API Mercado Pago configurada (credenciais em env vars)
2. Model PixCharge no Prisma: id, tenantId, contaReceberId (FK), externalId (Mercado Pago), amount, qrCode (base64), qrCodeText (copia-e-cola), paymentLink, status (pending/paid/expired/cancelled), expiresAt, paidAt, createdAt
3. Botao "Cobrar via PIX" disponivel em: tela de venda, conta a receber, acao rapida FAB
4. Ao clicar: chama API Mercado Pago, gera cobranca PIX, exibe QR code na tela
5. Tela de cobranca PIX com: QR code grande, botao "Copiar codigo PIX", botao "Compartilhar" (WhatsApp/SMS/outros)
6. Cobranca com expiracao configuravel (default: 24h)
7. Status da cobranca atualizado em tempo real na tela

#### Story 4.4: Webhook PIX e Conciliacao Automatica

**Como** usuario,
**Quero** que o sistema detecte automaticamente quando um PIX for pago,
**Para que** eu nao precise baixar manualmente cada recebimento.

**Acceptance Criteria:**
1. Endpoint webhook (`/api/webhooks/mercadopago`) para receber notificacoes de pagamento
2. Webhook valida assinatura do Mercado Pago (seguranca)
3. Ao receber pagamento confirmado: atualiza PixCharge.status para "paid", atualiza ContaReceber.status para "recebido" com data de recebimento
4. Notificacao em tempo real para o usuario: "Pagamento de R$ X recebido de [Cliente]!"
5. Notificacao push (PWA) e badge no icone de notificacoes
6. Tratamento de falhas: retry automatico se processamento falhar (via BullMQ)
7. Log de todas as notificacoes recebidas para auditoria
8. Endpoint de consulta manual de status (fallback caso webhook falhe)

---

### Epic 5: Fiscal (NFe/NFSe/NFCe)

**Goal expandido:** Este epic implementa a emissao de documentos fiscais eletronicos via Focus NFe: NFe (produto), NFSe Nacional (servico) e NFCe (consumidor final). Inclui preenchimento automatico de campos fiscais (CFOP, CST, NCM), campos CBS/IBS preparados para reforma tributaria 2026, determinacao automatica de regime tributario, vinculacao automatica Venda -> NFe -> Financeiro, e armazenamento de XMLs. O objetivo e que o usuario emita nota fiscal sem conhecimento contabil.

#### Story 5.1: Configuracao Fiscal e Certificado Digital

**Como** usuario,
**Quero** configurar meu certificado digital e dados fiscais,
**Para que** eu possa emitir notas fiscais pelo sistema.

**Acceptance Criteria:**
1. Model ConfigFiscal no Prisma: id, tenantId, regimeTributario (MEI/SimplesNacional/LucroPresumido/LucroReal), inscricaoEstadual, inscricaoMunicipal, certificateFileUrl (Supabase Storage), certificatePassword (criptografado), certificateExpiry, ambiente (homologacao/producao), serieNFe, serieNFSe, serieNFCe, ultimoNumeroNFe, ultimoNumeroNFSe, ultimoNumeroNFCe
2. Tela de configuracao fiscal com:
   - Selecao de regime tributario (com explicacao simples de cada)
   - Upload de certificado digital A1 (.pfx) com armazenamento seguro
   - Campos de inscricao estadual e municipal
   - Toggle ambiente: homologacao (testes) / producao
3. Validacao do certificado: verifica se e A1, se nao esta expirado, exibe data de vencimento
4. Alerta quando certificado esta a 30 dias de expirar
5. Sistema determina automaticamente configuracoes fiscais com base no regime tributario

#### Story 5.2: Emissao de NFe (Produto)

**Como** usuario,
**Quero** emitir NFe de produto a partir de uma venda,
**Para que** eu entregue o documento fiscal ao cliente sem precisar entender de tributacao.

**Acceptance Criteria:**
1. Model NotaFiscal no Prisma: id, tenantId, type (NFe/NFSe/NFCe), saleId (FK), numero, serie, chaveAcesso, xmlUrl (Supabase Storage), pdfUrl, status (processando/autorizada/rejeitada/cancelada), focusNfeId, errorMessage, emitidaEm, createdAt
2. Integracao com Focus NFe API para emissao de NFe
3. Botao "Emitir NFe" disponivel na tela de detalhes da venda (pos-confirmacao)
4. Sistema preenche automaticamente: CFOP, CST, NCM (do cadastro do produto), aliquotas com base no regime tributario
5. Preview da nota antes de emitir com campos editaveis para correcoes
6. Emissao assincrona via BullMQ (nao bloqueia a tela do usuario)
7. Status atualizado em tempo real: processando -> autorizada/rejeitada
8. XML armazenado no Supabase Storage, link para download
9. Vinculacao automatica: ao autorizar NFe, atualiza venda com numero da nota
10. Campos CBS/IBS presentes no schema (preenchimento conforme regulamentacao vigente)

#### Story 5.3: Emissao de NFSe Nacional (Servico)

**Como** prestador de servicos,
**Quero** emitir NFSe Nacional pelo sistema,
**Para que** eu cumpra a obrigacao fiscal sem complexidade.

**Acceptance Criteria:**
1. Integracao com Focus NFe API para emissao de NFSe Nacional
2. Botao "Emitir NFSe" disponivel quando venda contem servicos
3. Sistema determina automaticamente: codigo de servico, ISS, aliquota com base no municipio e regime
4. Campos NFSe Nacional preenchidos automaticamente a partir dos dados da venda e empresa
5. Preview antes de emitir
6. Emissao assincrona via BullMQ
7. XML armazenado, link para download
8. Campos CBS/IBS preparados

#### Story 5.4: Emissao de NFCe (Consumidor) e Fluxo Fiscal Completo

**Como** usuario que vende para consumidor final,
**Quero** emitir NFCe automaticamente,
**Para que** cada venda no balcao tenha documento fiscal.

**Acceptance Criteria:**
1. Integracao com Focus NFe API para emissao de NFCe
2. Opcao de emissao automatica de NFCe em vendas sem cliente identificado (consumidor final)
3. Emissao assincrona, XML armazenado
4. Fluxo fiscal completo validado end-to-end: Venda -> NFe/NFSe/NFCe -> Conta a Receber (vinculacao automatica)
5. Tela "Notas Fiscais" com lista de todas as notas emitidas, filtros por tipo/status/periodo
6. Acoes na lista: visualizar PDF, baixar XML, reenviar para cliente (email/WhatsApp placeholder)
7. Tratamento de rejeicao: exibir motivo claro da Sefaz e sugerir correcao
8. Cancelamento de nota (dentro do prazo legal) com motivo obrigatorio

---

### Epic 6: WhatsApp, Estoque e PWA

**Goal expandido:** Este epic completa o MVP com as ultimas tres funcionalidades essenciais: integracao WhatsApp Business (envio de cobranca, notificacao de NFe, lembrete de vencimento), estoque simplificado (entrada por compra, saida por venda, saldo e alertas) e PWA completo (manifest, service worker, offline basico, instalacao). Ao final, o ERPsb MVP esta completo e pronto para beta com usuarios reais.

#### Story 6.1: Integracao WhatsApp Business - Envio de Mensagens

**Como** usuario,
**Quero** enviar cobrancas e notificacoes pelo WhatsApp com 1 clique,
**Para que** meus clientes recebam pelo canal que mais usam.

**Acceptance Criteria:**
1. Integracao com WhatsApp Business API (provedor configuravel via env vars)
2. Model WhatsAppMessage no Prisma: id, tenantId, clientId, phone, type (cobranca/nfe/lembrete/orcamento), templateId, status (queued/sent/delivered/read/failed), externalId, sentAt, createdAt
3. Templates de mensagem pre-definidos:
   - Cobranca PIX: "Ola [nome]! Segue sua cobranca de R$ [valor]: [link PIX]. Obrigado!"
   - NFe emitida: "Ola [nome]! Sua nota fiscal [numero] foi emitida. Acesse: [link PDF]"
   - Lembrete de vencimento: "Ola [nome]! Lembrete: sua conta de R$ [valor] vence em [data]. Link para pagar: [link PIX]"
   - Orcamento: "Ola [nome]! Segue seu orcamento de R$ [valor]. Detalhes: [link]"
4. Botao "Enviar WhatsApp" disponivel em: cobranca PIX, nota fiscal, orcamento, conta a receber
5. Envio assincrono via BullMQ (fila de mensagens WhatsApp)
6. Status de entrega atualizado via webhook do provedor
7. Log de todas as mensagens enviadas com status

#### Story 6.2: Lembretes Automaticos de Vencimento

**Como** usuario,
**Quero** que o sistema envie lembretes automaticos de cobranca,
**Para que** meus clientes paguem em dia sem eu precisar cobrar manualmente.

**Acceptance Criteria:**
1. Configuracao de lembretes por tenant: ativar/desativar, dias antes (default: 3), no dia (default: sim), dias depois (default: 1)
2. Job agendado (BullMQ cron) que verifica diariamente contas a receber proximas do vencimento
3. Envia mensagem WhatsApp automatica conforme configuracao do tenant
4. Nao reenvia se ja foi enviado para aquela conta naquele dia
5. Inclui link de pagamento PIX na mensagem (se cobranca PIX existir)
6. Registro de envio no historico de mensagens
7. Tenant pode desativar lembretes automaticos nas configuracoes

#### Story 6.3: Estoque Simplificado

**Como** usuario,
**Quero** controlar meu estoque de forma simples,
**Para que** eu saiba o que tenho disponivel e nao venda o que nao tenho.

**Acceptance Criteria:**
1. Model MovimentacaoEstoque no Prisma: id, tenantId, productId, type (entrada/saida/ajuste), quantity, reason (compra/venda/ajuste_manual), referenceId (saleId ou purchaseId), notes, createdAt
2. Saldo de estoque calculado como soma de movimentacoes (entradas - saidas) por produto
3. Tela de estoque: lista de produtos com saldo atual, alerta visual quando abaixo do minimo
4. Formulario de entrada manual: produto, quantidade, fornecedor (opcional), observacao
5. Saida automatica vinculada a vendas (Story 4.1 ja cria a baixa)
6. Ajuste manual de estoque com motivo obrigatorio
7. Historico de movimentacoes por produto com filtros
8. Alerta quando produto atinge estoque minimo (notificacao no dashboard + badge)
9. Produtos com estoque zero nao sao bloqueados na venda (aviso, nao bloqueio)

#### Story 6.4: PWA Completo e Offline Basico

**Como** usuario,
**Quero** instalar o ERPsb no meu celular como se fosse um app,
**Para que** eu acesse rapidamente e possa consultar dados mesmo sem internet.

**Acceptance Criteria:**
1. manifest.json configurado: nome, icones (512px, 192px, maskable), theme_color, background_color, display: standalone, start_url
2. Service worker via next-pwa com estrategias de cache:
   - Cache-first para assets estaticos (JS, CSS, imagens, fontes)
   - Stale-while-revalidate para dados de API (cadastros, saldos)
   - Network-first para operacoes criticas (vendas, fiscal, financeiro)
3. Banner de instalacao nativo (beforeinstallprompt) com CTA customizado
4. Offline basico: consultar cadastros (clientes, produtos) e ver ultimo saldo do dashboard
5. Indicador visual quando offline: banner no topo "Voce esta offline. Dados podem estar desatualizados."
6. Operacoes feitas offline sao enfileiradas e sincronizadas quando internet volta (write-behind para vendas e lancamentos)
7. Splash screen com logo ao abrir PWA instalado
8. Push notifications configuradas para alertas financeiros e recebimentos PIX

#### Story 6.5: Polish Final e Preparacao para Beta

**Como** Product Owner,
**Quero** que o sistema esteja polido e estavel para beta com usuarios reais,
**Para que** tenhamos feedback confiavel para evoluir o produto.

**Acceptance Criteria:**
1. Revisao e correcao de todos os empty states com mensagens amigaveis e CTAs
2. Loading states (skeleton screens) em todas as telas de lista e dashboard
3. Tratamento de erros amigavel em toda a aplicacao (nao exibir stack traces)
4. Mensagens de sucesso/erro com toast notifications consistentes
5. PostHog analytics configurado: tracking de eventos-chave (signup, onboarding_complete, first_sale, first_pix, first_nfe)
6. Metatags SEO basicas e Open Graph para compartilhamento
7. Testes E2E (Playwright) cobrindo fluxos criticos:
   - Cadastro + onboarding completo
   - Cadastrar cliente + produto + realizar venda
   - Gerar cobranca PIX
   - Registrar conta a pagar + marcar como paga
   - Visualizar dashboard semaforo
8. Performance audit via Lighthouse: score > 90 em Performance e > 90 em PWA
9. Revisao de seguranca: confirmar RLS funcional, audit logs ativos, LGPD consentimento no cadastro

---

## 7. Checklist Results Report

*A ser executado antes da aprovacao final do PRD. Executar checklist `pm-checklist.md` e documentar resultados aqui.*

---

## 8. Next Steps

### 8.1 UX Expert Prompt

> Inicie em "Create UX" mode. O PRD do ERPsb esta em `docs/prd.md`. Revise as secoes de UI Design Goals (secao 3) e as stories de cada epic. Crie wireframes/mockups low-fidelity para as core screens definidas, com foco em mobile-first (320px-428px). Priorize: Dashboard Semaforo, Tela de Venda Rapida, Cobranca PIX, e Onboarding Wizard.

### 8.2 Architect Prompt

> Inicie em "Create Architecture" mode. O PRD do ERPsb esta em `docs/prd.md` e o Project Brief em `docs/brief.md`. Crie o documento de arquitetura (`docs/architecture.md`) detalhando: stack tecnologica, estrutura de pastas (source tree), modelo de dados (Prisma schema), API design, multi-tenant com RLS, integracoes externas (Focus NFe, Mercado Pago, WhatsApp), infraestrutura (Vercel + Supabase), coding standards e estrategia de testes. Use as decisoes tecnicas da secao 4 do PRD como base.
