import { env } from '@/lib/env';

const MERCADO_PAGO_API = 'https://api.mercadopago.com';

interface CreatePaymentResponse {
  externalId: string;
  qrCode: string;
  qrCodeText: string;
  paymentLink: string;
}

interface PaymentStatusResponse {
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  paidAt: string | null;
}

function getMockData(amount: number, description: string): CreatePaymentResponse {
  const mockId = `MOCK-${Date.now()}`;
  const mockQrText = `00020126580014br.gov.bcb.pix0136mock-pix-key-${mockId}5204000053039865802BR5913MOCK EMPRESA6008BRASILIA62070503***6304`;
  // Simple placeholder base64 for a tiny 1x1 white PNG as QR code mock
  const mockQrCode = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

  return {
    externalId: mockId,
    qrCode: mockQrCode,
    qrCodeText: mockQrText,
    paymentLink: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=${mockId}`,
  };
}

function mapMercadoPagoStatus(status: string): PaymentStatusResponse['status'] {
  switch (status) {
    case 'approved':
      return 'PAID';
    case 'pending':
    case 'in_process':
    case 'authorized':
      return 'PENDING';
    case 'expired':
      return 'EXPIRED';
    case 'cancelled':
    case 'rejected':
    case 'refunded':
    case 'charged_back':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
}

export async function createPixPayment(
  amount: number,
  description: string,
  expirationMinutes: number,
): Promise<CreatePaymentResponse> {
  const token = env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token) {
    return getMockData(amount, description);
  }

  const expirationDate = new Date(Date.now() + expirationMinutes * 60 * 1000);

  const response = await fetch(`${MERCADO_PAGO_API}/v1/payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `pix-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    },
    body: JSON.stringify({
      transaction_amount: amount / 100, // centavos to reais
      description,
      payment_method_id: 'pix',
      payer: { email: 'customer@example.com' },
      date_of_expiration: expirationDate.toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mercado Pago API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  return {
    externalId: String(data.id),
    qrCode: data.point_of_interaction?.transaction_data?.qr_code_base64 ?? '',
    qrCodeText: data.point_of_interaction?.transaction_data?.qr_code ?? '',
    paymentLink: data.point_of_interaction?.transaction_data?.ticket_url ?? '',
  };
}

export async function getPaymentStatus(externalId: string): Promise<PaymentStatusResponse> {
  const token = env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token) {
    return { status: 'PENDING', paidAt: null };
  }

  const response = await fetch(`${MERCADO_PAGO_API}/v1/payments/${externalId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Mercado Pago API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    status: mapMercadoPagoStatus(data.status),
    paidAt: data.date_approved ?? null,
  };
}

export async function cancelPayment(externalId: string): Promise<void> {
  const token = env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token) {
    return; // Mock mode - no-op
  }

  const response = await fetch(`${MERCADO_PAGO_API}/v1/payments/${externalId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'cancelled' }),
  });

  if (!response.ok) {
    throw new Error(`Mercado Pago API error: ${response.status}`);
  }
}
