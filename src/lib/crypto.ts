import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { env } from '@/lib/env';

const ALGORITHM = 'aes-256-gcm';

function deriveKey(): Buffer {
  return createHash('sha256').update(env.NEXTAUTH_SECRET).digest();
}

export function encryptString(plaintext: string): string {
  const key = deriveKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptString(ciphertext: string): string {
  const key = deriveKey();
  const [ivHex, authTagHex, encrypted] = ciphertext.split(':');

  if (!ivHex || !authTagHex || encrypted === undefined) {
    throw new Error('Invalid ciphertext format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export interface CertificateInfo {
  valid: boolean;
  expiry: Date | null;
  subject: string | null;
  error?: string;
}

export async function parseCertificate(pfxBase64: string, password: string): Promise<CertificateInfo> {
  try {
    const forge = await import('node-forge');
    const pfxDer = forge.util.decode64(pfxBase64);
    const asn1 = forge.asn1.fromDer(pfxDer);
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, password);

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certs = certBags[forge.pki.oids.certBag];

    if (!certs || certs.length === 0) {
      return { valid: false, expiry: null, subject: null, error: 'Nenhum certificado encontrado no arquivo' };
    }

    const cert = certs[0].cert;
    if (!cert) {
      return { valid: false, expiry: null, subject: null, error: 'Certificado invalido' };
    }

    const expiry = cert.validity.notAfter;
    const now = new Date();

    if (expiry < now) {
      return {
        valid: false,
        expiry,
        subject: cert.subject.getField('CN')?.value ?? null,
        error: 'Certificado expirado',
      };
    }

    return {
      valid: true,
      expiry,
      subject: cert.subject.getField('CN')?.value ?? null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao processar certificado';
    return { valid: false, expiry: null, subject: null, error: message };
  }
}
