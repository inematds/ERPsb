export interface WhatsAppTemplate {
  id: string;
  type: string;
  text: string;
  vars: string[];
}

export const WHATSAPP_TEMPLATES: Record<string, WhatsAppTemplate> = {
  cobranca_pix: {
    id: 'cobranca_pix',
    type: 'cobranca',
    text: 'Ola {nome}! Segue sua cobranca de R$ {valor}: {link_pix}. Obrigado!',
    vars: ['nome', 'valor', 'link_pix'],
  },
  nfe_emitida: {
    id: 'nfe_emitida',
    type: 'nfe',
    text: 'Ola {nome}! Sua nota fiscal #{numero} foi emitida. Acesse: {link_pdf}',
    vars: ['nome', 'numero', 'link_pdf'],
  },
  lembrete_vencimento: {
    id: 'lembrete_vencimento',
    type: 'lembrete',
    text: 'Ola {nome}! Lembrete: sua conta de R$ {valor} vence em {data}. {link_pix}',
    vars: ['nome', 'valor', 'data', 'link_pix'],
  },
  orcamento: {
    id: 'orcamento',
    type: 'orcamento',
    text: 'Ola {nome}! Segue seu orcamento de R$ {valor}. Detalhes: {link}',
    vars: ['nome', 'valor', 'link'],
  },
};

export function renderTemplate(templateId: string, vars: Record<string, string>): string {
  const template = WHATSAPP_TEMPLATES[templateId];
  if (!template) throw new Error(`Template "${templateId}" nao encontrado`);

  let text = template.text;
  for (const [key, value] of Object.entries(vars)) {
    text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return text;
}

export function getTemplateIds(): string[] {
  return Object.keys(WHATSAPP_TEMPLATES);
}
