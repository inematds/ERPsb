# 15. Coding Standards

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
