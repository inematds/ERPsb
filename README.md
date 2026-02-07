# ERPsb

**O ERP que cresce com voce - do primeiro PIX ao primeiro milhao.**

ERPsb e um sistema ERP SaaS **mobile-first** criado para **nanoempreendedores, MEIs e microempresas brasileiras** que hoje controlam seus negocios com papel, planilha, WhatsApp e memoria. O diferencial: ser **mais simples que papel e planilha**, entregando valor desde o primeiro dia sem configuracao complexa.

---

## O Problema

- **29% das pequenas empresas** fecham nos primeiros 5 anos por falta de gestao (Sebrae)
- Donos de negocio nao sabem se estao lucrando ou nao
- Informacao critica fragmentada entre cadernos, apps e memoria
- ERPs existentes sao complexos demais, caros e assumem processos formais
- **97% das empresas** nao estao preparadas para a reforma tributaria 2026 (CBS/IBS)

## A Solucao

O ERPsb resolve isso com **simplicidade radical**:

| Diferencial | Descricao |
|-------------|-----------|
| **Setup Zero** | Login, wizard de 5 perguntas, primeira venda em 2 minutos |
| **PIX Nativo** | Gerar cobranca, QR code e conciliacao automatica em 1 clique |
| **WhatsApp Integrado** | Enviar cobranca, orcamento e NFe pelo canal #1 do Brasil |
| **Dashboard Semaforo** | Verde/Amarelo/Vermelho em vez de numeros frios |
| **Mobile-First Real** | 100% das operacoes essenciais no celular (PWA) |
| **Compliance Automatico** | NFe, NFSe Nacional, CBS/IBS - sem exigir conhecimento contabil |
| **Freemium Honesto** | Gratis ate R$ 5k/mes de faturamento, sem trial com data de expiracao |
| **Modo Informal** | Funciona sem CNPJ para nanoempreendedores |

---

## Publico-Alvo

### Primario: Nanoempreendedor / MEI

- Faturamento ate R$ 81k/ano
- Gerencia tudo pelo celular (Android)
- Nunca usou sistema de gestao
- Cobra via PIX manual, anota vendas no caderno
- Quer saber: *"Estou lucrando? Quanto posso retirar?"*

### Secundario: Microempresa em Crescimento

- Faturamento R$ 81k a R$ 360k/ano (Simples Nacional)
- 1-5 funcionarios, ja tentou ERP mas desistiu
- Precisa centralizar vendas, financeiro e fiscal

---

## Modulos do MVP

```
Cadastros ──> Financeiro ──> Vendas ──> Fiscal ──> Estoque
(base)        (coracao)      (receita)  (compliance) (controle)
```

### 1. Cadastros Progressivos
Clientes, Fornecedores, Produtos/Servicos com campos minimos que expandem conforme necessidade. Importacao de contatos do celular.

### 2. Financeiro (Dashboard Semaforo)
Contas a pagar/receber, fluxo de caixa diario, saldo real. Semaforo visual: verde (saudavel), amarelo (atencao), vermelho (critico). Alertas proativos e funcionalidade "Quanto posso retirar?".

### 3. Vendas (1 Toque)
Venda direta em 30 segundos. Orcamentos com conversao em 1 clique. Vinculacao automatica com financeiro e estoque.

### 4. PIX Nativo
Cobranca PIX com QR code em 1 clique via Mercado Pago. Conciliacao automatica por webhook. Compartilhamento via WhatsApp.

### 5. Fiscal (Compliance Automatico)
NFe, NFSe Nacional e NFCe via Focus NFe. Campos CBS/IBS preparados para reforma tributaria 2026. Zero conhecimento contabil exigido.

### 6. WhatsApp Business
Envio de cobranca, notificacao de NFe, lembrete automatico de vencimento.

### 7. Estoque Simplificado
Entrada por compra, saida por venda, saldo atual, alerta de minimo. Sem lotes/series/inventario complexo.

---

## Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 15 (App Router) + TypeScript 5 + Tailwind CSS 4 + shadcn/ui |
| **Backend** | Next.js API Routes (monolito modular DDD) |
| **Database** | PostgreSQL 16 + Prisma ORM 6 |
| **Auth** | NextAuth.js v5 (Auth.js) - Google OAuth + email/senha |
| **Multi-tenant** | Shared database + Row-Level Security (RLS) |
| **Queue** | BullMQ + Upstash Redis (jobs assincronos) |
| **Fiscal** | Focus NFe API (NFe, NFSe Nacional, NFCe) |
| **Pagamentos** | Mercado Pago (PIX, QR code, webhooks) |
| **WhatsApp** | WhatsApp Business API (provedor a definir) |
| **Hosting** | Vercel (frontend + API) + Supabase (DB + Storage) |
| **Monitoramento** | Sentry (erros) + PostHog (analytics) |
| **Testes** | Vitest (unit/integration) + Playwright (E2E) |

### Arquitetura

```
src/
├── app/                    # Next.js App Router (pages, layouts, API routes)
├── core/
│   ├── auth/               # Autenticacao e sessoes
│   └── tenant/             # Multi-tenant, planos, limites
├── modules/
│   ├── cadastros/          # Clientes, Fornecedores, Produtos
│   ├── financeiro/         # Contas, Fluxo de Caixa, Dashboard
│   ├── vendas/             # Orcamentos, Vendas, PDV rapido
│   ├── fiscal/             # NFe, NFSe, NFCe, CBS/IBS
│   └── estoque/            # Entradas, Saidas, Saldos
├── integrations/
│   ├── pix/                # Mercado Pago API
│   ├── whatsapp/           # WhatsApp Business API
│   └── fiscal-api/         # Focus NFe adapter
└── lib/                    # Utilitarios compartilhados
```

---

## Modelo de Negocio

| Plano | Faturamento | Preco | Inclui |
|-------|-------------|-------|--------|
| **Gratis** | Ate R$ 5k/mes | R$ 0 | Cadastros + Financeiro + 10 vendas/mes |
| **Starter** | Ate R$ 20k/mes | R$ 49/mes | + Vendas ilimitadas + NFe + PIX |
| **Growth** | Ate R$ 100k/mes | R$ 99/mes | + WhatsApp + Estoque + Relatorios |
| **Pro** | Acima R$ 100k | R$ 199/mes | + IA + Marketplaces + Multi-usuario |

Principios: preco por faturamento (nao por usuarios), upgrade/downgrade sem perda de dados, sem taxas ocultas.

---

## Roadmap

### Fase 1 - MVP Core (3-4 meses)
- **Mes 1:** Fundacao (Next.js + PostgreSQL + Auth + Multi-tenant + Cadastros + Onboarding)
- **Mes 2:** Financeiro + Vendas + PIX Nativo
- **Mes 3:** Fiscal (NFe/NFSe/NFCe via Focus NFe) + PWA + Estoque
- **Mes 4:** WhatsApp Business + Polish + Beta (10-20 usuarios reais)

### Fase 2 - Diferenciacao (2-3 meses)
- IA assistente ("Quanto vendi em janeiro?")
- Calculadora de precificacao inteligente
- Relatorios gerenciais + DRE simplificada
- Integracoes marketplaces (Mercado Livre, Shopee)
- Open Finance (conciliacao bancaria)

### Fase 3 - Escala (3+ meses)
- CRM basico
- Centro de custo
- BI / Analytics
- App nativo (se metricas justificarem)
- API publica

---

## Principios de Design

1. **Usabilidade > Complexidade** - menos telas, mais fluxo
2. **Financeiro e o coracao** - toda operacao reflete no caixa
3. **Fiscal nao trava a operacao** - compliance automatico, sem burocracia
4. **Tudo que nasce no MVP escala** - sem retrabalho estrutural
5. **Mobile-first real** - celular como dispositivo principal, nao secundario
6. **Treinar rotina, nao sistema** - ERP se adapta ao negocio, nao o contrario

---

## Metricas de Sucesso

| Metrica | Meta MVP | Meta 6 meses | Meta 1 ano |
|---------|----------|-------------|------------|
| Usuarios ativos (gratis) | 50 (beta) | 1.000 | 5.000 |
| Usuarios pagos | 5 (beta) | 150 | 750 |
| MRR | R$ 0 | R$ 7.500 | R$ 20.000 |
| Time to Value | < 5 min | < 5 min | < 3 min |
| DAU/MAU | > 30% | > 40% | > 45% |
| NPS | > 30 | > 50 | > 60 |

---

## Analise Competitiva

| Concorrente | Preco | Ponto Forte | Onde ERPsb ganha |
|-------------|-------|-------------|------------------|
| Bling | R$ 55/mes | Marketplaces | Simplicidade, PIX nativo, mobile-first |
| Tiny ERP | R$ 41/mes | Hub integracoes | Onboarding rapido, freemium |
| ContaAzul | R$ 99/mes | Conciliacao bancaria | Preco, mobile-first, WhatsApp |
| Omie | R$ 79/mes | CRM + WhatsApp | Simplicidade radical, freemium |
| MarketUP | Gratis | Custo zero | UX moderna, PIX nativo, fiscal 2026 |

**Gaps que nenhum concorrente atende:** setup em minutos (nao dias), mobile-first verdadeiro, suporte a informalidade (sem CNPJ), educacao financeira integrada, compliance fiscal automatico para reforma 2026.

---

## Documentacao do Projeto

| Documento | Caminho | Descricao |
|-----------|---------|-----------|
| Conceito Original | `doc/erp-sb.txt` | Visao inicial do projeto |
| Analise Estrategica | `doc/analise-estrategica-erpsb.md` | Analise de mercado e recomendacoes |
| Pesquisa Completa | `doc/historico-pesquisa-completo.md` | 60+ fontes de pesquisa compiladas |
| Project Brief | `docs/brief.md` | Brief completo (BMad Analyst) |
| PRD | `docs/prd.md` | 58 FRs, 27 NFRs, 6 epics, 20 stories |
| Todo | `doc/todo.md` | Gestao geral do projeto |

---

## Metodologia

Este projeto usa o **BMad Method** para planejamento e desenvolvimento agile orientado por IA.

**Pipeline de planejamento:**
```
Analyst (Brief) ──> PM (PRD) ──> Architect ──> PO (Shard) ──> Dev (Stories)
     [x]              [x]          [ ]           [ ]            [ ]
```

**Agentes disponiveis:**
- `/analyst` - Pesquisa, brainstorming, project briefs
- `/pm` - PRD, estrategia de produto, priorizacao
- `/architect` - Arquitetura tecnica, stack, modelo de dados
- `/po` - Validacao, sharding em epics e stories
- `/dev` - Implementacao story-by-story
- `/qa` - Testes, quality gates, revisoes
- `/sm` - Draft de stories a partir de epics

---

## Como Comecar

```bash
# Clonar o repositorio
git clone git@github.com:inematds/ERPsb.git
cd ERPsb

# Instalar dependencias
npm install

# Proximo passo: criar arquitetura com /architect
# (projeto ainda em fase de planejamento)
```

---

## Contexto de Mercado

- **Mercado global ERP:** US$ 62 bilhoes ate 2026
- **33%** das empresas brasileiras pretendem trocar de ERP ate 2026
- **97%** nao preparadas para reforma tributaria (CBS/IBS)
- **147 milhoes** de usuarios WhatsApp no Brasil
- **91%** das PMEs com IA reportaram aumento na receita
- Open Banking cresceu **246%** em transacoes

---

## Licenca

Projeto privado - todos os direitos reservados.

---

*Criado com BMad Method - AI-driven agile development.*
