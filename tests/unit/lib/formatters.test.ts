import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrency } from '@/lib/formatters';

describe('formatCurrency', () => {
  it('should format centavos to BRL', () => {
    expect(formatCurrency(1050)).toBe('R$\u00a010,50');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('R$\u00a00,00');
  });

  it('should format large values', () => {
    expect(formatCurrency(999900)).toBe('R$\u00a09.999,00');
  });
});

describe('parseCurrency', () => {
  it('should parse BRL string to centavos', () => {
    expect(parseCurrency('10,50')).toBe(1050);
  });

  it('should parse with R$ prefix', () => {
    expect(parseCurrency('R$ 10,50')).toBe(1050);
  });

  it('should return 0 for invalid input', () => {
    expect(parseCurrency('')).toBe(0);
    expect(parseCurrency('abc')).toBe(0);
  });

  it('should handle whole numbers', () => {
    expect(parseCurrency('100')).toBe(10000);
  });
});
