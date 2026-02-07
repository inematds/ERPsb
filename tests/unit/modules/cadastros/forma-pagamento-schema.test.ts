import { describe, it, expect } from 'vitest';
import { createFormaPagamentoSchema, updateFormaPagamentoSchema } from '@/modules/cadastros/forma-pagamento.schema';

describe('createFormaPagamentoSchema', () => {
  it('should validate with required fields', () => {
    const result = createFormaPagamentoSchema.safeParse({
      name: 'PIX',
      type: 'PIX',
    });
    expect(result.success).toBe(true);
  });

  it('should validate with all fields', () => {
    const result = createFormaPagamentoSchema.safeParse({
      name: 'Cartao de Credito',
      type: 'CREDITO',
      installments: 12,
      fee: 350,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = createFormaPagamentoSchema.safeParse({
      name: '',
      type: 'PIX',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid type', () => {
    const result = createFormaPagamentoSchema.safeParse({
      name: 'Test',
      type: 'INVALID',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative fee', () => {
    const result = createFormaPagamentoSchema.safeParse({
      name: 'Test',
      type: 'PIX',
      fee: -10,
    });
    expect(result.success).toBe(false);
  });

  it('should reject zero installments', () => {
    const result = createFormaPagamentoSchema.safeParse({
      name: 'Test',
      type: 'CREDITO',
      installments: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should default installments to 1 and fee to 0', () => {
    const result = createFormaPagamentoSchema.parse({
      name: 'Dinheiro',
      type: 'DINHEIRO',
    });
    expect(result.installments).toBe(1);
    expect(result.fee).toBe(0);
  });
});

describe('updateFormaPagamentoSchema', () => {
  it('should validate partial update', () => {
    const result = updateFormaPagamentoSchema.safeParse({
      active: false,
    });
    expect(result.success).toBe(true);
  });

  it('should validate isDefault update', () => {
    const result = updateFormaPagamentoSchema.safeParse({
      isDefault: true,
    });
    expect(result.success).toBe(true);
  });

  it('should validate empty object', () => {
    const result = updateFormaPagamentoSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
