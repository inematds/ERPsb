import { describe, it, expect } from 'vitest';
import { validateCNPJ, formatCNPJ } from '@/lib/validators';

describe('validateCNPJ', () => {
  it('should validate a correct CNPJ', () => {
    // Valid CNPJ: 11.222.333/0001-81
    expect(validateCNPJ('11222333000181')).toBe(true);
  });

  it('should validate a formatted CNPJ', () => {
    expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
  });

  it('should reject a CNPJ with wrong check digits', () => {
    expect(validateCNPJ('11222333000182')).toBe(false);
  });

  it('should reject a CNPJ with all same digits', () => {
    expect(validateCNPJ('11111111111111')).toBe(false);
    expect(validateCNPJ('00000000000000')).toBe(false);
  });

  it('should reject a CNPJ with wrong length', () => {
    expect(validateCNPJ('1122233300018')).toBe(false);
    expect(validateCNPJ('112223330001811')).toBe(false);
    expect(validateCNPJ('')).toBe(false);
  });
});

describe('formatCNPJ', () => {
  it('should format a raw CNPJ string', () => {
    expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('should handle partial input', () => {
    expect(formatCNPJ('112')).toBe('11.2');
    expect(formatCNPJ('11222333')).toBe('11.222.333');
  });

  it('should strip non-numeric characters', () => {
    expect(formatCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81');
  });
});
