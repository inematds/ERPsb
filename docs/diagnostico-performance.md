# Diagnóstico de Performance - ERPsb

**Data:** 2026-02-09
**Status:** Diagnóstico apenas, nenhuma alteração feita

---

## Resumo Executivo

A lentidão afeta **todos os módulos** porque a causa raiz está no pipeline que roda em cada request:
- 1 query extra no banco para buscar tenantId (já está no JWT mas não é usado)
- `auth()` chamado 2x por request (Edge Middleware + withTenantApi)
- Latência de rede ao Supabase remoto (~30-80ms por query)
- Zero cache em qualquer camada (API, browser, componentes)

O dashboard é o caso mais grave (26 queries), mas até uma listagem simples faz 3 round-trips ao banco remoto (~150-240ms mínimo).

---

## BACKEND - Problemas Encontrados

### CRÍTICO 1: Tenant Lookup Desnecessário em CADA Request

**Arquivo:** `src/core/tenant/tenant.middleware.ts:46-49`
**Impacto:** +30-80ms em **todos os 51 endpoints**

```typescript
// PROBLEMA: Ignora o JWT e faz query no banco de novo
const userTenant = await basePrisma.userTenant.findFirst({
  where: { userId: session.user.id, isActive: true },
  select: { tenantId: true },
});
```

O `activeTenantId` já é salvo no JWT no login (`auth.ts:62-66`), mas o middleware ignora e faz a mesma query no banco toda vez.

### CRÍTICO 2: auth() Chamado 2x por Request

**Arquivos:** `src/middleware.ts:6` + `src/core/tenant/tenant.middleware.ts:39`
**Impacto:** +5-10ms duplicado

1. Edge Middleware decodifica JWT
2. `withTenantApi` decodifica JWT de novo

### CRÍTICO 3: Dashboard = 15 Queries

**Arquivo:** `src/modules/financeiro/dashboard.service.ts`
**Impacto:** ~500-1200ms

- Batch 1 (linhas 79-86): 5 aggregates - saldo + hoje/semana
- Batch 2 (linhas 89-96): 5 aggregates - semana/mês + pendentes
- Batch 3 (linhas 99-112): 2 findMany + getCashFlowChart (2 queries internas)
- **Total: 15 queries** em 3 batches sequenciais

### CRÍTICO 4: Alertas = 11 Queries

**Arquivo:** `src/modules/financeiro/alerta.service.ts`
**Impacto:** ~400-900ms

- `getAlertas()`: 5 queries (linhas 50-78) + 2 queries extras (linhas 111-126)
- `calcularQuantoPossoRetirar()`: 4 queries (linhas 147-167)
- `getResumoMensal()`: 2 queries (linhas 203-218)
- **Total: ~11 queries** com dependências sequenciais

### CRÍTICO 5: Lembrete N+1 Query Loop

**Arquivo:** `src/modules/whatsapp/lembrete.service.ts:79-121`
**Impacto:** 100-200+ queries para processar lembretes

```typescript
for (const conta of contasReceber) {
  const alreadySent = await prisma.whatsAppMessage.findFirst({...}); // 1 query POR conta
  await sendLembreteVencimento(...); // mais queries
}
```

### ALTO 1: Queries Duplicadas Dashboard + Alertas

**Impacto:** 20-30% carga extra

Ambos calculam saldo (totalRecebido - totalPago) independentemente = 4 queries repetidas.

### ALTO 2: Estoque N+1 na Saída de Venda

**Arquivo:** `src/modules/estoque/estoque.service.ts:98-116`
**Impacto:** N inserts individuais por venda

```typescript
// Cria 1 insert por item ao invés de usar createMany
const creates = items.map((item) => prisma.movimentacaoEstoque.create({...}));
return Promise.all(creates);
```

### ALTO 3: Mark Expired Roda em Cada Listagem

**Arquivos:** `orcamento.service.ts:37`, `pix.service.ts:64`
**Impacto:** Bulk update antes de cada listagem

```typescript
export async function listOrcamentos(query) {
  await markExpired(); // UPDATE em todos expirados ANTES de listar
  const [data, total] = await Promise.all([...]);
}
```

### MÉDIO 1: Prisma Log 'query' em Dev

**Arquivo:** `src/lib/prisma.ts:13`
**Impacto:** +10-30ms overhead por query em dev

```typescript
log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
```

### MÉDIO 2: Zero Cache HTTP nas APIs

**Impacto:** Browser refaz request toda vez

Nenhum endpoint retorna `Cache-Control` headers. Listagens de clientes/produtos que mudam raramente poderiam cachear por 30-300s.

### MÉDIO 3: Indexes Faltando

**Arquivo:** `prisma/schema.prisma`

Indexes que existem (bom):
- `[tenantId, name]` em Cliente, Fornecedor, Produto
- `[tenantId, status]` em ContaPagar, ContaReceber, Venda, PixCharge
- `[tenantId, dueDate]` em ContaPagar, ContaReceber
- `[tenantId, createdAt]` em Venda, Orcamento, MovimentacaoEstoque

Indexes que **faltam**:
- `[tenantId, clientId]` em ContaReceber (join com Cliente)
- `[tenantId, saleId]` em ContaReceber (join com Venda)
- `[tenantId, supplierId]` em ContaPagar (join com Fornecedor)
- `[tenantId, status, paidDate]` em ContaPagar (aggregate com filtro composto)
- `[tenantId, status, receivedDate]` em ContaReceber (aggregate com filtro composto)
- `[externalId]` em PixCharge (webhook lookup)

### MÉDIO 4: Confirmação de Venda = 4+N Queries

**Arquivo:** `src/modules/vendas/venda.service.ts:30-80`

1. `findUnique` - busca venda
2. `count` - próximo número sequencial
3. `update` - atualiza status
4. `create` - cria ContaReceber
5. N x `create` - registra saída estoque (1 por item)

### MÉDIO 5: Conversão Orçamento → Venda = 6+ Queries

**Arquivo:** `src/modules/vendas/orcamento.service.ts:120-161`

Encadeia `createVenda` → `confirmVenda` → `update orcamento` sem transação.

### BAIXO: Nota Fiscal = 7 Queries

**Arquivo:** `src/modules/fiscal/nota-fiscal.service.ts`

Cada emissão (NFe/NFSe/NFCe): findUnique + findFirst + findUnique + findUnique + upsert + create + update.

---

## FRONTEND - Problemas Encontrados

### CRÍTICO 1: 30 de 34 Páginas São 'use client'

**Impacto:** Perde SSR/streaming do Next.js 15, bundle JS maior, hydration overhead

Todas as páginas de listagem e formulários são Client Components. O ciclo é sempre:
render esqueleto → loading → fetch API → re-render com dados

### CRÍTICO 2: Zero Caching de Dados (sem SWR/React-Query)

**Impacto:** Refetch completo a cada navegação

```typescript
// Padrão atual: useEffect + fetch manual
useEffect(() => {
  async function fetchAll() {
    const [dashRes, alertRes] = await Promise.all([
      fetch('/api/v1/dashboard'),
      fetch('/api/v1/alertas'),
    ]);
  }
  fetchAll();
}, []);
```

Sem staleTime, sem cache, sem revalidação em background, sem deduplicação.

### CRÍTICO 3: Zero Dynamic Imports

**Impacto:** Todo o bundle carrega de uma vez

Recharts (~100KB+), formulários grandes (446 linhas, 410 linhas) carregam eagerly.

### ALTO 1: useTenant Fetch em Cada Mount

**Arquivo:** `src/hooks/use-tenant.ts`
**Impacto:** Request extra a cada navegação

Busca `/api/v1/tenants` toda vez que um componente monta, sem cache.

### ALTO 2: Sentry com 100% Trace Sampling

**Arquivos:** `sentry.client.config.ts`, `sentry.server.config.ts`

```typescript
tracesSampleRate: 1.0,        // 100% das transações!
replaysSessionSampleRate: 0.1,
replaysOnErrorSampleRate: 1.0,
```

**Impacto:** Overhead de tracing em CADA request client e server.

### ALTO 3: SessionProvider Envolve Todo o Dashboard

**Arquivo:** `src/app/(dashboard)/layout.tsx`
**Impacto:** Re-renders em cascata ao mudar estado da sessão

Header, Sidebar, BottomNav, Fab, OfflineBanner, InstallBanner - todos renderizados em cada page load.

### MÉDIO 1: Zero React.memo / useMemo

**Impacto:** Re-renders desnecessários em componentes de lista e dashboard

- `SummaryCard`, `UpcomingSection` no dashboard
- Itens de lista sem memoização
- Formatação de datas inline em cada render

### MÉDIO 2: Sem next/image

**Impacto:** Imagens (se usadas) sem otimização, lazy-load ou WebP

### MÉDIO 3: Google Fonts no Root Layout

**Arquivo:** `src/app/layout.tsx`
**Impacto:** Possível recurso bloqueante no carregamento inicial

### BAIXO (BOM): Debounce Implementado

300ms de debounce nos inputs de busca. Padrão correto com `setTimeout` + cleanup.

### BAIXO (BOM): Zustand é Leve

Estado global com Zustand é uma boa escolha de performance.

---

## Latência Estimada por Operação

| Operação | Queries (tenant + dados) | Tempo Estimado |
|----------|--------------------------|----------------|
| Abrir qualquer listagem | 1 + 2 | ~150-240ms |
| Buscar/filtrar (cada keystroke) | 1 + 2 | ~150-240ms |
| Abrir formulário com autocomplete | 1 + 1 | ~100-160ms |
| Dashboard | 1 + 15 | ~500-1200ms |
| Alertas | 1 + 11 | ~400-900ms |
| Confirmar venda (5 itens) | 1 + 9 | ~300-700ms |
| Processar lembretes (100 contas) | 1 + 200 | ~6-16 segundos |

---

## Plano de Ação - Ordenado por Impacto/Esforço

### Fase 1: Quick Wins (impacto imediato, risco baixo)

#### Ação 1.1: Usar tenantId do JWT ao invés de query no banco
- **Arquivo:** `src/core/tenant/tenant.middleware.ts`
- **O quê:** Expor `activeTenantId` do token JWT na session e usar direto no `withTenantApi`
- **Também:** `src/core/auth/auth.ts` - incluir `activeTenantId` no objeto session
- **Economia:** ~50ms em CADA request (51 endpoints)
- **Risco:** Baixo - fallback para query se não tiver no JWT

#### Ação 1.2: Remover log 'query' do Prisma em dev
- **Arquivo:** `src/lib/prisma.ts:13`
- **O quê:** Mudar para `['error', 'warn']`
- **Economia:** ~10-30ms por query em dev
- **Risco:** Zero

#### Ação 1.3: Adicionar indexes compostos faltantes
- **Arquivo:** `prisma/schema.prisma`
- **O quê:** Adicionar indexes listados na seção "Indexes que faltam"
- **Economia:** Queries de aggregate/join passam de scan para index lookup
- **Risco:** Zero (migration apenas adiciona)

#### Ação 1.4: Reduzir Sentry tracesSampleRate
- **Arquivos:** `sentry.client.config.ts`, `sentry.server.config.ts`
- **O quê:** Mudar `tracesSampleRate` de `1.0` para `0.1` ou `0.2`
- **Economia:** Menos overhead de instrumentação em cada request
- **Risco:** Menos dados de performance no Sentry (0.1 = 10% é suficiente)

### Fase 2: Caching (maior ganho de percepção de velocidade)

#### Ação 2.1: Implementar SWR ou React-Query no frontend
- **Escopo:** Todos os hooks de fetch
- **O quê:** Substituir `useEffect + fetch` por SWR com `staleTime` e `revalidateOnFocus`
- **Economia:** Navegação entre páginas usa cache, refetch em background
- **Risco:** Médio - precisa testar invalidação

#### Ação 2.2: Cache HTTP nas respostas de API
- **Escopo:** Endpoints de listagem e dashboard
- **O quê:** Adicionar `Cache-Control: private, max-age=30` (dashboard) e `max-age=300` (listas)
- **Economia:** Browser reutiliza resposta sem request
- **Risco:** Baixo - dados podem ter até 30s de atraso

#### Ação 2.3: Cache in-memory no dashboard/alertas
- **Arquivos:** `dashboard.service.ts`, `alerta.service.ts`
- **O quê:** `unstable_cache` do Next.js ou Map com TTL de 30-60s
- **Economia:** 26 queries viram 0 por 30-60 segundos
- **Risco:** Baixo - dados financeiros de 1 min atrás são aceitáveis

#### Ação 2.4: Cachear resultado do useTenant
- **Arquivo:** `src/hooks/use-tenant.ts`
- **O quê:** Guardar em sessionStorage ou usar SWR com staleTime longo
- **Economia:** Elimina 1 request por navegação
- **Risco:** Baixo

### Fase 3: Consolidação de Queries (reduz carga no banco)

#### Ação 3.1: Consolidar dashboard em menos queries
- **Arquivo:** `dashboard.service.ts`
- **O quê:** Raw SQL com `CASE WHEN` para calcular hoje/semana/mês em 1 query por tabela
- **Exemplo:** 10 aggregates em ContaReceber/ContaPagar → 2 raw queries
- **Economia:** 15 queries → ~4 queries
- **Risco:** Médio - precisa manter e testar SQL raw

#### Ação 3.2: Consolidar dashboard + alertas
- **Arquivos:** `dashboard.service.ts`, `alerta.service.ts`
- **O quê:** Unificar em 1 endpoint que retorna tudo, reaproveitando cálculos de saldo
- **Economia:** Elimina 4 queries duplicadas de saldo
- **Risco:** Baixo

#### Ação 3.3: Batch no processamento de lembretes
- **Arquivo:** `src/modules/whatsapp/lembrete.service.ts`
- **O quê:** Buscar todas as mensagens já enviadas em 1 query (WHERE IN), depois filtrar em memória
- **Economia:** 100+ queries → 1 query
- **Risco:** Baixo

#### Ação 3.4: Usar createMany no estoque
- **Arquivo:** `src/modules/estoque/estoque.service.ts`
- **O quê:** Substituir `Promise.all(items.map(create))` por `createMany`
- **Economia:** N queries → 1 query
- **Risco:** Zero

#### Ação 3.5: Mover markExpired para background/cron
- **Arquivos:** `orcamento.service.ts`, `pix.service.ts`
- **O quê:** Remover `await markExpired()` da listagem, executar via cron/serverless
- **Economia:** 1 bulk update a menos por listagem
- **Risco:** Baixo - itens expirados podem aparecer por alguns minutos

### Fase 4: Frontend Architecture (maior esforço, maior ganho a longo prazo)

#### Ação 4.1: Dynamic imports para Recharts e formulários grandes
- **O quê:** `const CashFlowChart = dynamic(() => import('./cash-flow-chart'), { ssr: false })`
- **Economia:** ~100KB+ a menos no bundle inicial do dashboard
- **Risco:** Baixo

#### Ação 4.2: Migrar páginas de listagem para Server Components
- **O quê:** Separar data fetching (Server) de interação (Client)
- **Economia:** Menos JS no client, streaming com Suspense
- **Risco:** Alto - requer refatoração significativa

#### Ação 4.3: Adicionar React.memo nos componentes de lista
- **O quê:** Memo em `SummaryCard`, cards de listagem, `UpcomingSection`
- **Economia:** Menos re-renders
- **Risco:** Baixo

#### Ação 4.4: Reduzir escopo do SessionProvider
- **Arquivo:** `src/app/(dashboard)/layout.tsx`
- **O quê:** Mover SessionProvider para envolver apenas componentes que precisam
- **Economia:** Menos re-renders em cascata
- **Risco:** Médio

---

## Estimativa de Ganho por Fase

| Fase | Esforço | Ganho Estimado | Risco |
|------|---------|----------------|-------|
| Fase 1: Quick Wins | 1-2 horas | ~30% mais rápido em tudo | Baixo |
| Fase 2: Caching | 3-5 horas | ~50% mais rápido (percepção) | Baixo-Médio |
| Fase 3: Consolidação | 4-6 horas | ~40% menos carga no banco | Médio |
| Fase 4: Frontend | 8-16 horas | ~30% menos JS, melhor UX | Alto |

**Recomendação:** Implementar Fases 1 e 2 primeiro. Juntas resolvem ~80% da lentidão percebida com esforço relativamente baixo.
