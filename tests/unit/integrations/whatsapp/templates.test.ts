import { describe, it, expect } from 'vitest';
import { renderTemplate, WHATSAPP_TEMPLATES, getTemplateIds } from '@/integrations/whatsapp/templates';

describe('WhatsApp Templates', () => {
  it('should have all required templates', () => {
    expect(WHATSAPP_TEMPLATES).toHaveProperty('cobranca_pix');
    expect(WHATSAPP_TEMPLATES).toHaveProperty('nfe_emitida');
    expect(WHATSAPP_TEMPLATES).toHaveProperty('lembrete_vencimento');
    expect(WHATSAPP_TEMPLATES).toHaveProperty('orcamento');
  });

  it('should return template ids', () => {
    const ids = getTemplateIds();
    expect(ids).toContain('cobranca_pix');
    expect(ids).toContain('nfe_emitida');
    expect(ids).toContain('lembrete_vencimento');
    expect(ids).toContain('orcamento');
  });

  describe('renderTemplate', () => {
    it('should render cobranca_pix template', () => {
      const result = renderTemplate('cobranca_pix', {
        nome: 'Joao',
        valor: 'R$ 50,00',
        link_pix: 'https://pix.example.com/123',
      });
      expect(result).toContain('Joao');
      expect(result).toContain('R$ 50,00');
      expect(result).toContain('https://pix.example.com/123');
    });

    it('should render nfe_emitida template', () => {
      const result = renderTemplate('nfe_emitida', {
        nome: 'Maria',
        numero: '001',
        link_pdf: 'https://pdf.example.com/nfe/001',
      });
      expect(result).toContain('Maria');
      expect(result).toContain('#001');
      expect(result).toContain('https://pdf.example.com/nfe/001');
    });

    it('should render lembrete_vencimento template', () => {
      const result = renderTemplate('lembrete_vencimento', {
        nome: 'Pedro',
        valor: 'R$ 100,00',
        data: '15/03/2026',
        link_pix: 'https://pix.example.com/456',
      });
      expect(result).toContain('Pedro');
      expect(result).toContain('R$ 100,00');
      expect(result).toContain('15/03/2026');
    });

    it('should render orcamento template', () => {
      const result = renderTemplate('orcamento', {
        nome: 'Ana',
        valor: 'R$ 200,00',
        link: 'https://erp.example.com/orc/789',
      });
      expect(result).toContain('Ana');
      expect(result).toContain('R$ 200,00');
    });

    it('should throw for unknown template', () => {
      expect(() => renderTemplate('unknown_template', {})).toThrow('Template "unknown_template" nao encontrado');
    });
  });
});
