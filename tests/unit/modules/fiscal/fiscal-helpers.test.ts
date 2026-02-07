import { describe, it, expect } from 'vitest';
import {
  getRegimeDefaults,
  REGIMES_INFO,
  REGIMES_TRIBUTARIOS,
  CFOP_TABLE,
  CST_ICMS_TABLE,
  CSOSN_TABLE,
} from '@/modules/fiscal/fiscal.helpers';

describe('Fiscal Helpers', () => {
  describe('getRegimeDefaults', () => {
    it('should return MEI defaults with CSOSN 102', () => {
      const defaults = getRegimeDefaults('MEI');
      expect(defaults.csosn).toBe('102');
      expect(defaults.cfopVendaInterna).toBe('5102');
      expect(defaults.cfopServico).toBe('5933');
    });

    it('should return Simples Nacional defaults with CSOSN 101', () => {
      const defaults = getRegimeDefaults('SIMPLES_NACIONAL');
      expect(defaults.csosn).toBe('101');
      expect(defaults.cfopVendaInterna).toBe('5102');
    });

    it('should return Lucro Presumido defaults without CSOSN', () => {
      const defaults = getRegimeDefaults('LUCRO_PRESUMIDO');
      expect(defaults.csosn).toBeNull();
      expect(defaults.cstPadrao).toBe('00');
    });

    it('should return Lucro Real defaults without CSOSN', () => {
      const defaults = getRegimeDefaults('LUCRO_REAL');
      expect(defaults.csosn).toBeNull();
      expect(defaults.cstPadrao).toBe('00');
    });

    it('should return defaults for all regimes', () => {
      for (const regime of REGIMES_TRIBUTARIOS) {
        const defaults = getRegimeDefaults(regime);
        expect(defaults).toBeDefined();
        expect(defaults.cfopVendaInterna).toBeTruthy();
        expect(defaults.cfopVendaInterestadual).toBeTruthy();
        expect(defaults.cfopServico).toBeTruthy();
      }
    });
  });

  describe('REGIMES_INFO', () => {
    it('should have info for all regimes', () => {
      for (const regime of REGIMES_TRIBUTARIOS) {
        expect(REGIMES_INFO[regime]).toBeDefined();
        expect(REGIMES_INFO[regime].label).toBeTruthy();
        expect(REGIMES_INFO[regime].description).toBeTruthy();
      }
    });
  });

  describe('CFOP_TABLE', () => {
    it('should contain essential CFOPs', () => {
      const codes = CFOP_TABLE.map((c) => c.code);
      expect(codes).toContain('5102');
      expect(codes).toContain('6102');
      expect(codes).toContain('5933');
    });

    it('should have descriptions for all entries', () => {
      for (const cfop of CFOP_TABLE) {
        expect(cfop.code).toBeTruthy();
        expect(cfop.description).toBeTruthy();
      }
    });
  });

  describe('CST_ICMS_TABLE', () => {
    it('should contain standard CSTs', () => {
      const codes = CST_ICMS_TABLE.map((c) => c.code);
      expect(codes).toContain('00');
      expect(codes).toContain('40');
      expect(codes).toContain('41');
      expect(codes).toContain('60');
    });
  });

  describe('CSOSN_TABLE', () => {
    it('should contain standard CSOSNs', () => {
      const codes = CSOSN_TABLE.map((c) => c.code);
      expect(codes).toContain('101');
      expect(codes).toContain('102');
      expect(codes).toContain('500');
    });
  });
});
