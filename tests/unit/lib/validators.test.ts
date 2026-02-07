import { describe, it, expect } from 'vitest';
import { validateCNPJ, formatCNPJ, validateCPF, formatCPF, isValidDocument } from '@/lib/validators';

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

describe('validateCPF', () => {
  it('should validate a correct CPF', () => {
    // Valid CPF: 529.982.247-25
    expect(validateCPF('52998224725')).toBe(true);
  });

  it('should validate a formatted CPF', () => {
    expect(validateCPF('529.982.247-25')).toBe(true);
  });

  it('should reject a CPF with wrong check digits', () => {
    expect(validateCPF('52998224726')).toBe(false);
  });

  it('should reject a CPF with all same digits', () => {
    expect(validateCPF('11111111111')).toBe(false);
    expect(validateCPF('00000000000')).toBe(false);
  });

  it('should reject a CPF with wrong length', () => {
    expect(validateCPF('5299822472')).toBe(false);
    expect(validateCPF('529982247250')).toBe(false);
    expect(validateCPF('')).toBe(false);
  });
});

describe('formatCPF', () => {
  it('should format a raw CPF string', () => {
    expect(formatCPF('52998224725')).toBe('529.982.247-25');
  });

  it('should handle partial input', () => {
    expect(formatCPF('529')).toBe('529');
    expect(formatCPF('5299')).toBe('529.9');
  });
});

describe('isValidDocument', () => {
  it('should validate a CPF (11 digits)', () => {
    expect(isValidDocument('52998224725')).toBe(true);
  });

  it('should validate a CNPJ (14 digits)', () => {
    expect(isValidDocument('11222333000181')).toBe(true);
  });

  it('should reject invalid CPF', () => {
    expect(isValidDocument('12345678901')).toBe(false);
  });

  it('should reject invalid CNPJ', () => {
    expect(isValidDocument('11222333000182')).toBe(false);
  });
});
