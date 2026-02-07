import { describe, it, expect } from 'vitest';
import {
  createFornecedorSchema,
  updateFornecedorSchema,
  listFornecedorQuerySchema,
} from '@/modules/cadastros/fornecedor.schema';

describe('createFornecedorSchema', () => {
  it('should validate with only name (required)', () => {
    const result = createFornecedorSchema.safeParse({ name: 'Fornecedor ABC' });
    expect(result.success).toBe(true);
  });

  it('should validate with all fields', () => {
    const result = createFornecedorSchema.safeParse({
      name: 'Fornecedor XYZ',
      phone: '11999998888',
      email: 'contato@xyz.com',
      document: '11222333000181',
      notes: 'Entrega rapida',
    });
    expect(result.success).toBe(true);
  });

  it('should reject name shorter than 2 chars', () => {
    const result = createFornecedorSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = createFornecedorSchema.safeParse({
      name: 'Fornecedor',
      email: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should accept empty optional fields', () => {
    const result = createFornecedorSchema.safeParse({
      name: 'Fornecedor',
      phone: '',
      email: '',
      document: '',
      notes: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateFornecedorSchema', () => {
  it('should accept partial updates', () => {
    const result = updateFornecedorSchema.safeParse({ name: 'Novo Nome' });
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const result = updateFornecedorSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('listFornecedorQuerySchema', () => {
  it('should use defaults when empty', () => {
    const result = listFornecedorQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('should reject pageSize over 100', () => {
    const result = listFornecedorQuerySchema.safeParse({ pageSize: '200' });
    expect(result.success).toBe(false);
  });
});
