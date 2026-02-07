# TODO - ERPsb Project Management

**Projeto:** ERPsb - ERP para Micro e Pequenas Empresas Brasileiras
**Inicio:** 2026-02-07
**Ultima atualizacao:** 2026-02-07

---

## Legenda de Status
- [ ] Pendente
- [x] Concluido
- [~] Em andamento
- [!] Bloqueado
- [-] Cancelado

---

## FASE 0: PESQUISA E ANALISE (Concluida)

- [x] Definir conceito inicial do projeto (`doc/erp-sb.txt`)
- [x] Pesquisa de mercado ERP Brasil (tamanho, tendencias, regulamentacoes)
- [x] Analise competitiva (10+ concorrentes: Bling, Tiny, Omie, ContaAzul, etc.)
- [x] Pesquisa de tendencias tecnologicas (stack, arquitetura, integracoes, IA)
- [x] Compilar analise estrategica (`doc/analise-estrategica-erpsb.md`)
- [x] Salvar historico completo de pesquisa (`doc/historico-pesquisa-completo.md`)

**Entregaveis:**
- `doc/erp-sb.txt` - Conceito original
- `doc/analise-estrategica-erpsb.md` - Analise estrategica com recomendacoes
- `doc/historico-pesquisa-completo.md` - Pesquisa completa (60+ fontes)

---

## FASE 1: PLANEJAMENTO (BMad Workflow)

### 1.1 Project Brief (Analyst)
- [x] Criar Project Brief baseado na pesquisa (`docs/brief.md`)

### 1.2 PRD - Product Requirements Document (PM)
- [x] Criar PRD completo a partir do brief (`docs/prd.md`)
  - [x] Requisitos funcionais por modulo (58 FRs)
  - [x] Requisitos nao-funcionais (27 NFRs)
  - [x] Definicao de epics (6) e stories (26)
  - [x] Criterios de aceitacao por feature
  - [x] Prioridades (MoSCoW)

### 1.3 Architecture Document (Architect)
- [x] Criar documento de arquitetura (`docs/architecture.md`)
  - [x] Stack tecnologica detalhada (30+ tecnologias)
  - [x] Arquitetura do sistema (monolito modular DDD)
  - [x] Modelo de dados (17 models Prisma)
  - [x] Multi-tenant design (RLS)
  - [x] API design (REST, 50+ endpoints)
  - [x] Integracoes externas (Focus NFe, Mercado Pago, WhatsApp)
  - [x] Infraestrutura e deploy (Vercel + Supabase)
  - [x] Seguranca e LGPD
  - [x] Coding standards
  - [x] Source tree

### 1.4 Validacao e Sharding (PO)
- [x] Validar alinhamento PRD + Architecture
- [x] Shardar PRD em epics (`docs/prd/` - 9 arquivos)
- [x] Shardar Architecture em secoes (`docs/architecture/` - 19 + 3 alias)
- [x] Gerar stories Epic 1 (`docs/stories/` - 5 stories)

---

## FASE 2: MVP CORE - DESENVOLVIMENTO (3-4 meses)

### Sprint 1-2: Fundacao (Mes 1)
- [ ] Setup do projeto Next.js 15 + TypeScript + Tailwind + shadcn/ui
- [ ] Configurar PostgreSQL + Prisma ORM
- [ ] Implementar autenticacao (NextAuth.js ou Clerk)
- [ ] Implementar multi-tenant com RLS
- [ ] Criar layout base (mobile-first PWA)
- [ ] Modulo: Cadastro de Clientes (progressivo)
- [ ] Modulo: Cadastro de Fornecedores (progressivo)
- [ ] Modulo: Cadastro de Produtos/Servicos (progressivo)
- [ ] Modulo: Formas de Pagamento
- [ ] Onboarding wizard (5 perguntas)
- [ ] Setup CI/CD (Vercel)

### Sprint 3-4: Financeiro + Vendas (Mes 2)
- [ ] Modulo: Contas a Pagar
- [ ] Modulo: Contas a Receber
- [ ] Modulo: Fluxo de Caixa Diario
- [ ] Dashboard Semaforo (verde/amarelo/vermelho)
- [ ] Alertas proativos de caixa
- [ ] Modulo: Orcamentos
- [ ] Modulo: Vendas Diretas (1 toque)
- [ ] Conversao automatica Venda -> Financeiro
- [ ] Integracao PIX (Mercado Pago)
  - [ ] Geracao de cobranca PIX (QR code + link)
  - [ ] Webhook de recebimento
  - [ ] Conciliacao automatica

### Sprint 5-6: Fiscal + Mobile (Mes 3)
- [ ] Integracao Focus NFe
  - [ ] Emissao NFe (produto)
  - [ ] Emissao NFSe Nacional (servico)
  - [ ] Emissao NFCe (consumidor)
  - [ ] Campos CBS/IBS preparados
- [ ] Vinculacao automatica Venda -> NFe -> Financeiro
- [ ] PWA completo (manifest, service worker, offline basico)
- [ ] Modulo: Estoque Simplificado
  - [ ] Entrada por compra
  - [ ] Saida por venda
  - [ ] Saldo atual
- [ ] Testes mobile em dispositivos reais

### Sprint 7-8: Integracao + Polish (Mes 4)
- [ ] Integracao WhatsApp Business
  - [ ] Envio de cobranca via WhatsApp
  - [ ] Notificacao NFe emitida
  - [ ] Lembrete de vencimento automatico
- [ ] Onboarding guiado completo
- [ ] Configuracoes do usuario/empresa
- [ ] Testes end-to-end
- [ ] Testes de seguranca (LGPD)
- [ ] Performance optimization
- [ ] Beta com 10-20 usuarios reais
- [ ] Correcoes pos-beta
- [ ] Deploy producao

---

## FASE 3: DIFERENCIACAO (2-3 meses apos MVP)

### IA e Inteligencia
- [ ] Chat IA em linguagem natural ("Quanto vendi em janeiro?")
- [ ] Categorizacao automatica de despesas (foto recibo -> dados)
- [ ] Previsao de fluxo de caixa (media movel + sazonalidade)
- [ ] Sugestoes contextuais proativas

### Precificacao e Relatorios
- [ ] Calculadora de precificacao inteligente (custo + imposto + taxa + margem)
- [ ] Relatorio DRE simplificada
- [ ] Relatorio de vendas por periodo/produto/cliente
- [ ] Export PDF/Excel

### Integracoes Avancadas
- [ ] Integracao Mercado Livre
- [ ] Integracao Shopee
- [ ] Sincronizacao de estoque multi-canal
- [ ] Open Finance (conciliacao bancaria automatica)

---

## FASE 4: ESCALA (3+ meses)

- [ ] CRM basico (pipeline de vendas)
- [ ] Centro de custo
- [ ] BI / Analytics (dashboards customizaveis)
- [ ] App nativo (se metricas justificarem)
- [ ] API publica para integracoes terceiros
- [ ] Conta digital integrada
- [ ] Comunidade de microempreendedores
- [ ] Verticalizacao por setor

---

## INFRAESTRUTURA E DEVOPS

- [ ] Setup repositorio Git
- [ ] Configurar ESLint + Prettier
- [ ] Configurar Husky (pre-commit hooks)
- [ ] Setup Sentry (monitoramento de erros)
- [ ] Setup PostHog (analytics)
- [ ] Configurar ambientes (dev, staging, production)
- [ ] Configurar backup automatico do banco
- [ ] Documentar runbooks de operacao

---

## MODELO DE NEGOCIO

### Planos definidos

| Plano | Faturamento | Preco | Status |
|-------|-------------|-------|--------|
| Gratis | Ate R$ 5k/mes | R$ 0 | [ ] Implementar |
| Starter | Ate R$ 20k/mes | R$ 49/mes | [ ] Implementar |
| Growth | Ate R$ 100k/mes | R$ 99/mes | [ ] Implementar |
| Pro | Acima R$ 100k | R$ 199/mes | [ ] Implementar |

### Pagamento e Billing
- [ ] Integrar gateway de pagamento para assinaturas
- [ ] Implementar controle de limites por plano
- [ ] Implementar upgrade/downgrade automatico
- [ ] Landing page com precos

---

## MARKETING E LANCAMENTO

- [ ] Criar landing page
- [ ] Definir estrategia de aquisicao (SEO, conteudo, parcerias)
- [ ] Parcerias com Sebrae / associacoes de MEIs
- [ ] Conteudo educativo (blog, videos)
- [ ] Programa de beta testers
- [ ] Lancamento soft (convite)
- [ ] Lancamento publico

---

## DECISOES PENDENTES

| # | Decisao | Opcoes | Status |
|---|---------|--------|--------|
| 1 | Teto plano gratuito | R$ 3k / R$ 5k / R$ 10k por mes | Definido: R$ 5k |
| 2 | Auth provider | NextAuth.js / Clerk | Pendente |
| 3 | Hosting DB | Supabase / Railway / Neon | Pendente |
| 4 | WhatsApp provider | Wati / Evolution API (open-source) | Pendente |
| 5 | Nome comercial do produto | ERPsb / outro nome | Pendente |
| 6 | Dominio | A definir | Pendente |

---

## METRICAS DE ACOMPANHAMENTO

| Metrica | Meta MVP | Meta 6 meses | Meta 1 ano |
|---------|----------|-------------|------------|
| Usuarios ativos (gratis) | 50 (beta) | 1.000 | 5.000 |
| Usuarios pagos | 5 (beta) | 150 | 750 |
| MRR | R$ 0 | R$ 7.500 | R$ 20.000 |
| DAU/MAU | > 30% | > 40% | > 45% |
| Time to Value | < 10 min | < 5 min | < 3 min |
| NPS | > 30 | > 50 | > 60 |
| Churn mensal | < 10% | < 5% | < 3% |

---

## REGISTRO DE PROGRESSO

### 2026-02-07 - Inicio do Projeto
- Criado conceito inicial (`doc/erp-sb.txt`)
- Executada pesquisa de mercado com 3 agentes em paralelo (60+ fontes)
- Criada analise estrategica com recomendacoes de melhoria
- Criado Project Brief completo (`docs/brief.md`)
- Criado todo.md para gestao do projeto
- Criado PRD completo com `/pm` (58 FRs, 27 NFRs, 6 epics, 26 stories)
- Criado Architecture completo com `/architect` (2051 linhas)
- Repositorio Git configurado e pushed para GitHub (SSH)
- README.md criado (264 linhas)
- PO shardou PRD (9 files) e Architecture (19 + 3 alias files)
- PO criou 5 stories detalhadas para Epic 1
- **Proximo passo:** Implementar Epic 1 com `/dev`

---

*Gerenciado via BMad Method - Atualizar este documento a cada entrega significativa.*
