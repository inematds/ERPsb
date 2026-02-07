import { describe, it, expect } from 'vitest';
import { determineTenantType, suggestPlan } from '@/lib/constants';

describe('determineTenantType', () => {
  it('should return INFORMAL when no CNPJ', () => {
    expect(determineTenantType(false, 'ATE_5K')).toBe('INFORMAL');
    expect(determineTenantType(false, 'ACIMA_100K')).toBe('INFORMAL');
  });

  it('should return MEI for low revenue with CNPJ', () => {
    expect(determineTenantType(true, 'ATE_5K')).toBe('MEI');
    expect(determineTenantType(true, '5K_20K')).toBe('MEI');
  });

  it('should return ME for higher revenue with CNPJ', () => {
    expect(determineTenantType(true, '20K_100K')).toBe('ME');
    expect(determineTenantType(true, 'ACIMA_100K')).toBe('ME');
  });
});

describe('suggestPlan', () => {
  it('should return FREE for ATE_5K', () => {
    expect(suggestPlan('ATE_5K')).toBe('FREE');
  });

  it('should return STARTER for 5K_20K', () => {
    expect(suggestPlan('5K_20K')).toBe('STARTER');
  });

  it('should return GROWTH for 20K_100K', () => {
    expect(suggestPlan('20K_100K')).toBe('GROWTH');
  });

  it('should return PRO for ACIMA_100K', () => {
    expect(suggestPlan('ACIMA_100K')).toBe('PRO');
  });

  it('should return FREE for unknown value', () => {
    expect(suggestPlan('UNKNOWN')).toBe('FREE');
  });
});
