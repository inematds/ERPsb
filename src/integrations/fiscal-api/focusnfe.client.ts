import { env } from '@/lib/env';

function getBaseUrl(ambiente: string): string {
  if (ambiente === 'producao') {
    return 'https://api.focusnfe.com.br/v2';
  }
  return 'https://homologacao.focusnfe.com.br/v2';
}

function getAuthHeader(): string {
  const token = env.FOCUS_NFE_TOKEN ?? '';
  return 'Basic ' + Buffer.from(`${token}:`).toString('base64');
}

export interface FocusNFeResponse {
  status: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave_nfe?: string;
  numero?: string;
  serie?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_danfe?: string;
  requisicao_nota_fiscal?: Record<string, unknown>;
}

export interface FocusNFeMockResponse extends FocusNFeResponse {
  mock: boolean;
}

function getMockCreateResponse(ref: string): FocusNFeMockResponse {
  return {
    mock: true,
    status: 'autorizado',
    status_sefaz: '100',
    mensagem_sefaz: 'Autorizado o uso da NF-e (MOCK)',
    chave_nfe: `35260200000000000100550010000000011${ref.slice(0, 9).padStart(9, '0')}`,
    numero: '1',
    serie: '1',
    caminho_xml_nota_fiscal: `/mock/xml/${ref}.xml`,
    caminho_danfe: `/mock/danfe/${ref}.pdf`,
  };
}

function getMockStatusResponse(ref: string): FocusNFeMockResponse {
  return {
    mock: true,
    status: 'autorizado',
    status_sefaz: '100',
    mensagem_sefaz: 'Autorizado o uso da NF-e (MOCK)',
    chave_nfe: `35260200000000000100550010000000011${ref.slice(0, 9).padStart(9, '0')}`,
    caminho_xml_nota_fiscal: `/mock/xml/${ref}.xml`,
    caminho_danfe: `/mock/danfe/${ref}.pdf`,
  };
}

export async function createNFe(
  ref: string,
  nfeData: Record<string, unknown>,
  ambiente: string = 'homologacao',
): Promise<FocusNFeResponse> {
  const token = env.FOCUS_NFE_TOKEN;

  if (!token) {
    return getMockCreateResponse(ref);
  }

  const baseUrl = getBaseUrl(ambiente);
  const response = await fetch(`${baseUrl}/nfe?ref=${encodeURIComponent(ref)}`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nfeData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Focus NFe API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function getNFeStatus(
  ref: string,
  ambiente: string = 'homologacao',
): Promise<FocusNFeResponse> {
  const token = env.FOCUS_NFE_TOKEN;

  if (!token) {
    return getMockStatusResponse(ref);
  }

  const baseUrl = getBaseUrl(ambiente);
  const response = await fetch(`${baseUrl}/nfe/${encodeURIComponent(ref)}`, {
    headers: { 'Authorization': getAuthHeader() },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Focus NFe API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function cancelNFe(
  ref: string,
  motivo: string,
  ambiente: string = 'homologacao',
): Promise<FocusNFeResponse> {
  const token = env.FOCUS_NFE_TOKEN;

  if (!token) {
    return { status: 'cancelado', mensagem_sefaz: 'Cancelamento autorizado (MOCK)' };
  }

  const baseUrl = getBaseUrl(ambiente);
  const response = await fetch(`${baseUrl}/nfe/${encodeURIComponent(ref)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ justificativa: motivo }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Focus NFe API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ==================== NFSe ====================

function getMockNFSeCreateResponse(ref: string): FocusNFeMockResponse {
  return {
    mock: true,
    status: 'autorizado',
    numero: '1',
    caminho_xml_nota_fiscal: `/mock/xml/nfse-${ref}.xml`,
    caminho_danfe: `/mock/danfe/nfse-${ref}.pdf`,
  };
}

export async function createNFSe(
  ref: string,
  nfseData: Record<string, unknown>,
  ambiente: string = 'homologacao',
): Promise<FocusNFeResponse> {
  const token = env.FOCUS_NFE_TOKEN;

  if (!token) {
    return getMockNFSeCreateResponse(ref);
  }

  const baseUrl = getBaseUrl(ambiente);
  const response = await fetch(`${baseUrl}/nfse?ref=${encodeURIComponent(ref)}`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nfseData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Focus NFe API error (NFSe): ${response.status} - ${error}`);
  }

  return response.json();
}

export async function getNFSeStatus(
  ref: string,
  ambiente: string = 'homologacao',
): Promise<FocusNFeResponse> {
  const token = env.FOCUS_NFE_TOKEN;

  if (!token) {
    return getMockNFSeCreateResponse(ref);
  }

  const baseUrl = getBaseUrl(ambiente);
  const response = await fetch(`${baseUrl}/nfse/${encodeURIComponent(ref)}`, {
    headers: { 'Authorization': getAuthHeader() },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Focus NFe API error (NFSe): ${response.status} - ${error}`);
  }

  return response.json();
}

export async function cancelNFSe(
  ref: string,
  motivo: string,
  ambiente: string = 'homologacao',
): Promise<FocusNFeResponse> {
  const token = env.FOCUS_NFE_TOKEN;

  if (!token) {
    return { status: 'cancelado', mensagem_sefaz: 'Cancelamento NFSe autorizado (MOCK)' };
  }

  const baseUrl = getBaseUrl(ambiente);
  const response = await fetch(`${baseUrl}/nfse/${encodeURIComponent(ref)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ justificativa: motivo }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Focus NFe API error (NFSe): ${response.status} - ${error}`);
  }

  return response.json();
}

export function mapFocusStatus(status: string): 'PROCESSANDO' | 'AUTORIZADA' | 'REJEITADA' | 'CANCELADA' {
  switch (status) {
    case 'autorizado':
      return 'AUTORIZADA';
    case 'cancelado':
      return 'CANCELADA';
    case 'erro_autorizacao':
    case 'rejeitado':
      return 'REJEITADA';
    case 'processando_autorizacao':
    default:
      return 'PROCESSANDO';
  }
}
