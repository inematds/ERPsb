import { describe, it, expect } from 'vitest';
import { sendWhatsAppSchema, listMessagesQuerySchema } from '@/modules/whatsapp/whatsapp.schema';

describe('WhatsApp Schema', () => {
  describe('sendWhatsAppSchema', () => {
    it('should accept valid input', () => {
      const result = sendWhatsAppSchema.safeParse({
        phone: '5511999999999',
        templateId: 'cobranca_pix',
        templateVars: { nome: 'Joao', valor: 'R$ 50,00', link_pix: '' },
      });
      expect(result.success).toBe(true);
    });

    it('should accept input with clientId', () => {
      const result = sendWhatsAppSchema.safeParse({
        phone: '5511999999999',
        clientId: 'client-123',
        templateId: 'nfe_emitida',
        templateVars: { nome: 'Maria', numero: '001', link_pdf: '' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing phone', () => {
      const result = sendWhatsAppSchema.safeParse({
        templateId: 'cobranca_pix',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short phone', () => {
      const result = sendWhatsAppSchema.safeParse({
        phone: '123',
        templateId: 'cobranca_pix',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing templateId', () => {
      const result = sendWhatsAppSchema.safeParse({
        phone: '5511999999999',
      });
      expect(result.success).toBe(false);
    });

    it('should default templateVars to empty object', () => {
      const result = sendWhatsAppSchema.safeParse({
        phone: '5511999999999',
        templateId: 'cobranca_pix',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.templateVars).toEqual({});
      }
    });
  });

  describe('listMessagesQuerySchema', () => {
    it('should apply defaults', () => {
      const result = listMessagesQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    it('should accept valid type filter', () => {
      const result = listMessagesQuerySchema.safeParse({ type: 'cobranca' });
      expect(result.success).toBe(true);
    });

    it('should accept valid status filter', () => {
      const result = listMessagesQuerySchema.safeParse({ status: 'SENT' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const result = listMessagesQuerySchema.safeParse({ type: 'INVALID' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const result = listMessagesQuerySchema.safeParse({ status: 'INVALID' });
      expect(result.success).toBe(false);
    });

    it('should coerce page from string', () => {
      const result = listMessagesQuerySchema.safeParse({ page: '2', pageSize: '10' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(10);
      }
    });
  });
});
