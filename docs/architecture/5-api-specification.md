# 5. API Specification

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
