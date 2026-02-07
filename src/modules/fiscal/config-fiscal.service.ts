import { prisma } from '@/lib/prisma';
import { encryptString, decryptString, parseCertificate } from '@/lib/crypto';
import type { UpdateConfigFiscal } from './config-fiscal.schema';

export async function getConfigFiscal(tenantId: string) {
  const config = await prisma.configFiscal.findUnique({
    where: { tenantId },
  });

  if (!config) return null;

  return {
    ...config,
    hasCertificate: !!config.certificateData,
    certificateData: undefined,
    certificatePassword: undefined,
  };
}

export async function upsertConfigFiscal(tenantId: string, data: UpdateConfigFiscal) {
  return prisma.configFiscal.upsert({
    where: { tenantId },
    create: { tenantId, ...data },
    update: data,
  });
}

export async function uploadCertificate(tenantId: string, base64Data: string, password: string) {
  const certInfo = await parseCertificate(base64Data, password);

  if (!certInfo.valid) {
    throw new Error(certInfo.error ?? 'Certificado invalido');
  }

  const encryptedData = encryptString(base64Data);
  const encryptedPassword = encryptString(password);

  await prisma.configFiscal.upsert({
    where: { tenantId },
    create: {
      tenantId,
      certificateData: encryptedData,
      certificatePassword: encryptedPassword,
      certificateExpiry: certInfo.expiry,
    },
    update: {
      certificateData: encryptedData,
      certificatePassword: encryptedPassword,
      certificateExpiry: certInfo.expiry,
    },
  });

  return {
    expiry: certInfo.expiry,
    subject: certInfo.subject,
  };
}

export async function removeCertificate(tenantId: string) {
  return prisma.configFiscal.update({
    where: { tenantId },
    data: {
      certificateData: null,
      certificatePassword: null,
      certificateExpiry: null,
    },
  });
}

export async function checkCertificateExpiry(tenantId: string): Promise<{
  hasCertificate: boolean;
  expiry: Date | null;
  daysUntilExpiry: number | null;
  isExpiring: boolean;
  isExpired: boolean;
}> {
  const config = await prisma.configFiscal.findUnique({
    where: { tenantId },
    select: { certificateExpiry: true, certificateData: true },
  });

  if (!config?.certificateData || !config.certificateExpiry) {
    return { hasCertificate: false, expiry: null, daysUntilExpiry: null, isExpiring: false, isExpired: false };
  }

  const now = new Date();
  const diffMs = config.certificateExpiry.getTime() - now.getTime();
  const daysUntilExpiry = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    hasCertificate: true,
    expiry: config.certificateExpiry,
    daysUntilExpiry,
    isExpiring: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
    isExpired: daysUntilExpiry <= 0,
  };
}

export async function incrementNumero(tenantId: string, tipo: 'NFe' | 'NFSe' | 'NFCe'): Promise<number> {
  const fieldMap = {
    NFe: 'ultimoNumeroNFe',
    NFSe: 'ultimoNumeroNFSe',
    NFCe: 'ultimoNumeroNFCe',
  } as const;

  const field = fieldMap[tipo];

  const config = await prisma.configFiscal.upsert({
    where: { tenantId },
    create: { tenantId, [field]: 1 },
    update: { [field]: { increment: 1 } },
  });

  return config[field];
}

export async function getDecryptedCertificate(tenantId: string): Promise<{
  data: string;
  password: string;
} | null> {
  const config = await prisma.configFiscal.findUnique({
    where: { tenantId },
    select: { certificateData: true, certificatePassword: true },
  });

  if (!config?.certificateData || !config.certificatePassword) {
    return null;
  }

  return {
    data: decryptString(config.certificateData),
    password: decryptString(config.certificatePassword),
  };
}
