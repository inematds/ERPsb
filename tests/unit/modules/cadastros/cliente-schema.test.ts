import { describe, it, expect } from 'vitest';
import {
  createClienteSchema,
  updateClienteSchema,
  listClienteQuerySchema,
} from '@/modules/cadastros/cliente.schema';

describe('createClienteSchema', () => {
  it('should validate valid input with required fields', () => {
    const result = createClienteSchema.safeParse({
      name: 'Joao Silva',
      phone: '11999998888',
    });
    expect(result.success).toBe(true);
  });

  it('should validate input with all fields', () => {
    const result = createClienteSchema.safeParse({
      name: 'Maria Santos',
      phone: '11988887777',
      email: 'maria@email.com',
      document: '12345678901',
      address: {
        street: 'Rua A',
        number: '100',
        neighborhood: 'Centro',
        city: 'Sao Paulo',
        state: 'SP',
        zipCode: '01001000',
      },
      notes: 'Cliente VIP',
    });
    expect(result.success).toBe(true);
  });

  it('should reject name shorter than 2 chars', () => {
    const result = createClienteSchema.safeParse({
      name: 'J',
      phone: '11999998888',
    });
    expect(result.success).toBe(false);
  });

  it('should reject phone shorter than 8 chars', () => {
    const result = createClienteSchema.safeParse({
      name: 'Joao',
      phone: '1234',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email format', () => {
    const result = createClienteSchema.safeParse({
      name: 'Joao',
      phone: '11999998888',
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('should accept empty string for optional fields', () => {
    const result = createClienteSchema.safeParse({
      name: 'Joao',
      phone: '11999998888',
      email: '',
      document: '',
      notes: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateClienteSchema', () => {
  it('should accept partial updates', () => {
    const result = updateClienteSchema.safeParse({ name: 'Novo Nome' });
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const result = updateClienteSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('listClienteQuerySchema', () => {
  it('should use defaults when empty', () => {
    const result = listClienteQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('should coerce string numbers', () => {
    const result = listClienteQuerySchema.parse({ page: '2', pageSize: '50' });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(50);
  });

  it('should reject pageSize over 100', () => {
    const result = listClienteQuerySchema.safeParse({ pageSize: '200' });
    expect(result.success).toBe(false);
  });

  it('should accept search param', () => {
    const result = listClienteQuerySchema.parse({ search: 'joao' });
    expect(result.search).toBe('joao');
  });
});
