import { env } from '@/lib/env';

export interface WhatsAppSendResult {
  success: boolean;
  externalId?: string;
  error?: string;
  mock?: boolean;
}

export interface WhatsAppStatusResult {
  status: string;
  deliveredAt?: string;
  readAt?: string;
  mock?: boolean;
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string,
): Promise<WhatsAppSendResult> {
  const token = env.WHATSAPP_API_TOKEN;
  const apiUrl = env.WHATSAPP_API_URL;

  if (!token || !apiUrl) {
    return {
      success: true,
      externalId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mock: true,
    };
  }

  try {
    const response = await fetch(`${apiUrl}/message/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': token,
      },
      body: JSON.stringify({
        number: phone,
        text: message,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `API error: ${response.status} - ${error}` };
    }

    const data = await response.json();
    return {
      success: true,
      externalId: data.key?.id ?? data.id ?? `ext-${Date.now()}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro ao enviar WhatsApp',
    };
  }
}

export async function getWhatsAppMessageStatus(
  externalId: string,
): Promise<WhatsAppStatusResult> {
  const token = env.WHATSAPP_API_TOKEN;
  const apiUrl = env.WHATSAPP_API_URL;

  if (!token || !apiUrl) {
    return { status: 'DELIVERED', mock: true };
  }

  try {
    const response = await fetch(`${apiUrl}/message/status/${encodeURIComponent(externalId)}`, {
      headers: { 'apikey': token },
    });

    if (!response.ok) {
      return { status: 'UNKNOWN' };
    }

    const data = await response.json();
    return {
      status: data.status ?? 'UNKNOWN',
      deliveredAt: data.deliveredAt,
      readAt: data.readAt,
    };
  } catch {
    return { status: 'UNKNOWN' };
  }
}
