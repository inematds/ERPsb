import { describe, it, expect } from 'vitest';
import { createContaPagarSchema, listContaPagarQuerySchema } from '@/modules/financeiro/conta-pagar.schema';

describe('createContaPagarSchema', () => {
  it('should validate with required fields', () => {
    const result = createContaPagarSchema.safeParse({
      description: 'Aluguel',
      amount: 150000,
      dueDate: '2026-03-01',
      category: 'ALUGUEL',
    });
    expect(result.success).toBe(true);
  });

  it('should validate with all fields', () => {
    const result = createContaPagarSchema.safeParse({
      description: 'Pagamento fornecedor',
      amount: 50000,
      dueDate: '2026-03-15',
      category: 'FORNECEDORES',
      supplierId: 'sup1',
      notes: 'Nota fiscal 123',
      recurrent: true,
      recurrenceType: 'MENSAL',
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative amount', () => {
    const result = createContaPagarSchema.safeParse({
      description: 'Test',
      amount: -100,
      dueDate: '2026-03-01',
      category: 'OUTROS',
    });
    expect(result.success).toBe(false);
  });

  it('should reject zero amount', () => {
    const result = createContaPagarSchema.safeParse({
      description: 'Test',
      amount: 0,
      dueDate: '2026-03-01',
      category: 'OUTROS',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid category', () => {
    const result = createContaPagarSchema.safeParse({
      description: 'Test',
      amount: 1000,
      dueDate: '2026-03-01',
      category: 'INVALID',
    });
    expect(result.success).toBe(false);
  });

  it('should require recurrenceType when recurrent is true', () => {
    const result = createContaPagarSchema.safeParse({
      description: 'Test',
      amount: 1000,
      dueDate: '2026-03-01',
      category: 'ALUGUEL',
      recurrent: true,
    });
    expect(result.success).toBe(false);
  });

  it('should not require recurrenceType when recurrent is false', () => {
    const result = createContaPagarSchema.safeParse({
      description: 'Test',
      amount: 1000,
      dueDate: '2026-03-01',
      category: 'ALUGUEL',
      recurrent: false,
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid recurrence types', () => {
    const mensal = createContaPagarSchema.safeParse({
      description: 'Test',
      amount: 1000,
      dueDate: '2026-03-01',
      category: 'ALUGUEL',
      recurrent: true,
      recurrenceType: 'MENSAL',
    });
    expect(mensal.success).toBe(true);

    const semanal = createContaPagarSchema.safeParse({
      description: 'Test',
      amount: 1000,
      dueDate: '2026-03-01',
      category: 'ALUGUEL',
      recurrent: true,
      recurrenceType: 'SEMANAL',
    });
    expect(semanal.success).toBe(true);
  });
});

describe('listContaPagarQuerySchema', () => {
  it('should use defaults', () => {
    const result = listContaPagarQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('should accept status filter', () => {
    const result = listContaPagarQuerySchema.parse({ status: 'PENDENTE' });
    expect(result.status).toBe('PENDENTE');
  });

  it('should accept category filter', () => {
    const result = listContaPagarQuerySchema.parse({ category: 'ALUGUEL' });
    expect(result.category).toBe('ALUGUEL');
  });

  it('should accept date range', () => {
    const result = listContaPagarQuerySchema.parse({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });
    expect(result.startDate).toBe('2026-01-01');
    expect(result.endDate).toBe('2026-12-31');
  });
});
