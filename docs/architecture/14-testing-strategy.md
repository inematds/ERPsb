# 14. Testing Strategy

### 14.1 Testing Pyramid

```
         E2E (Playwright)
        /        \
   Integration (Vitest + Prisma)
  /            \
Unit (Vitest)   Component (Vitest + RTL)
```

### 14.2 Coverage Targets

| Module | Unit | Integration | E2E |
|--------|------|-------------|-----|
| core/auth | 80% | Fluxo OAuth completo | Login + onboarding |
| core/tenant | 80% | RLS isolation test | Alternar empresa |
| modules/financeiro | 80% | Fluxo pagar/receber | Dashboard semaforo |
| modules/vendas | 70% | Venda → financeiro | Quick sale flow |
| modules/fiscal | 70% | Emissao NFe mock | - |
| integrations/pix | 70% | Webhook processing | Gerar PIX |
| UI components | - | - | Fluxos criticos |

### 14.3 Test Examples

**Unit Test (Service):**
```typescript
// tests/unit/modules/financeiro/dashboard.service.test.ts
import { describe, it, expect } from 'vitest';
import { calcularSemaforo } from '@/modules/financeiro/dashboard.service';

describe('calcularSemaforo', () => {
  it('retorna VERDE quando saldo cobre 30+ dias', () => {
    const result = calcularSemaforo({
      saldoAtual: 10000_00, // R$ 10.000
      mediaDespesasDiarias: 200_00, // R$ 200/dia
    });
    expect(result).toBe('VERDE'); // 10000/200 = 50 dias
  });

  it('retorna VERMELHO quando saldo negativo', () => {
    const result = calcularSemaforo({
      saldoAtual: -500_00,
      mediaDespesasDiarias: 200_00,
    });
    expect(result).toBe('VERMELHO');
  });
});
```

**Integration Test (API):**
```typescript
// tests/integration/api/clientes.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createTestContext } from '../helpers';

describe('POST /api/v1/clientes', () => {
  const ctx = createTestContext();

  it('cria cliente com campos minimos', async () => {
    const res = await ctx.api.post('/api/v1/clientes', {
      name: 'Joao Silva',
      phone: '11999998888',
    });
    expect(res.status).toBe(201);
    expect(res.data.data.name).toBe('Joao Silva');
    expect(res.data.data.tenantId).toBe(ctx.tenantId);
  });

  it('rejeita cliente sem nome', async () => {
    const res = await ctx.api.post('/api/v1/clientes', { phone: '11999998888' });
    expect(res.status).toBe(400);
    expect(res.data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

**E2E Test:**
```typescript
// tests/e2e/venda.spec.ts
import { test, expect } from '@playwright/test';

test('fluxo completo: cadastrar produto e realizar venda', async ({ page }) => {
  await page.goto('/cadastros/produtos');
  await page.click('[data-testid="novo-produto"]');
  await page.fill('[name="name"]', 'Corte de Cabelo');
  await page.fill('[name="sellPrice"]', '50,00');
  await page.click('[data-testid="salvar"]');
  await expect(page.getByText('Produto salvo')).toBeVisible();

  await page.goto('/vendas/nova');
  await page.fill('[data-testid="busca-produto"]', 'Corte');
  await page.click('[data-testid="produto-Corte de Cabelo"]');
  await page.click('[data-testid="confirmar-venda"]');
  await expect(page.getByText('Venda confirmada')).toBeVisible();
  await expect(page.getByText('R$ 50,00')).toBeVisible();
});
```

---
