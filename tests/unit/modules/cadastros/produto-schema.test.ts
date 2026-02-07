import { describe, it, expect } from 'vitest';
import { createProdutoSchema, listProdutoQuerySchema } from '@/modules/cadastros/produto.schema';

describe('createProdutoSchema', () => {
  it('should validate with required fields', () => {
    const result = createProdutoSchema.safeParse({
      name: 'Camiseta',
      type: 'PRODUTO',
      sellPrice: 5990,
    });
    expect(result.success).toBe(true);
  });

  it('should validate with all fields', () => {
    const result = createProdutoSchema.safeParse({
      name: 'Consultoria',
      type: 'SERVICO',
      sellPrice: 15000,
      costPrice: 5000,
      unit: 'hr',
      barcode: '7891234567890',
      ncm: '61091000',
      description: 'Servico de consultoria',
      stockMin: 0,
      trackStock: false,
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative sellPrice', () => {
    const result = createProdutoSchema.safeParse({
      name: 'Test',
      type: 'PRODUTO',
      sellPrice: -100,
    });
    expect(result.success).toBe(false);
  });

  it('should reject zero sellPrice', () => {
    const result = createProdutoSchema.safeParse({
      name: 'Test',
      type: 'PRODUTO',
      sellPrice: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid NCM format', () => {
    const result = createProdutoSchema.safeParse({
      name: 'Test',
      type: 'PRODUTO',
      sellPrice: 1000,
      ncm: '123',
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid NCM', () => {
    const result = createProdutoSchema.safeParse({
      name: 'Test',
      type: 'PRODUTO',
      sellPrice: 1000,
      ncm: '12345678',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid type', () => {
    const result = createProdutoSchema.safeParse({
      name: 'Test',
      type: 'INVALID',
      sellPrice: 1000,
    });
    expect(result.success).toBe(false);
  });
});

describe('listProdutoQuerySchema', () => {
  it('should use defaults', () => {
    const result = listProdutoQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('should accept type filter', () => {
    const result = listProdutoQuerySchema.parse({ type: 'SERVICO' });
    expect(result.type).toBe('SERVICO');
  });

  it('should transform active string to boolean', () => {
    const result = listProdutoQuerySchema.parse({ active: 'true' });
    expect(result.active).toBe(true);
  });
});
