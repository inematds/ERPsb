import { describe, it, expect } from 'vitest';
import { createContaReceberSchema, listContaReceberQuerySchema } from '@/modules/financeiro/conta-receber.schema';

describe('createContaReceberSchema', () => {
  it('should validate with required fields', () => {
    const result = createContaReceberSchema.safeParse({
      description: 'Venda produto',
      amount: 50000,
      dueDate: '2026-03-15',
      category: 'VENDAS',
    });
    expect(result.success).toBe(true);
  });

  it('should validate with all fields', () => {
    const result = createContaReceberSchema.safeParse({
      description: 'Consultoria',
      amount: 100000,
      dueDate: '2026-04-01',
      category: 'SERVICOS',
      clientId: 'client1',
      notes: 'Pagamento referente ao contrato',
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative amount', () => {
    const result = createContaReceberSchema.safeParse({
      description: 'Test',
      amount: -100,
      dueDate: '2026-03-01',
      category: 'VENDAS',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid category', () => {
    const result = createContaReceberSchema.safeParse({
      description: 'Test',
      amount: 1000,
      dueDate: '2026-03-01',
      category: 'INVALID',
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid categories', () => {
    for (const cat of ['VENDAS', 'SERVICOS', 'OUTROS']) {
      const result = createContaReceberSchema.safeParse({
        description: 'Test',
        amount: 1000,
        dueDate: '2026-03-01',
        category: cat,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('listContaReceberQuerySchema', () => {
  it('should use defaults', () => {
    const result = listContaReceberQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('should accept status filter', () => {
    const result = listContaReceberQuerySchema.parse({ status: 'PENDENTE' });
    expect(result.status).toBe('PENDENTE');
  });

  it('should accept RECEBIDO status', () => {
    const result = listContaReceberQuerySchema.parse({ status: 'RECEBIDO' });
    expect(result.status).toBe('RECEBIDO');
  });
});
