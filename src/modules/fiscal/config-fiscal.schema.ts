import { z } from 'zod';
import { REGIMES_TRIBUTARIOS } from './fiscal.helpers';

export const updateConfigFiscalSchema = z.object({
  regimeTributario: z.enum(REGIMES_TRIBUTARIOS).optional(),
  inscricaoEstadual: z.string().max(20).optional().nullable(),
  inscricaoMunicipal: z.string().max(20).optional().nullable(),
  ambiente: z.enum(['homologacao', 'producao']).optional(),
  serieNFe: z.number().int().min(1).max(999).optional(),
  serieNFSe: z.number().int().min(1).max(999).optional(),
  serieNFCe: z.number().int().min(1).max(999).optional(),
});

export type UpdateConfigFiscal = z.infer<typeof updateConfigFiscalSchema>;

export const uploadCertificateSchema = z.object({
  certificateData: z.string().min(1, 'Certificado e obrigatorio'),
  certificatePassword: z.string().min(1, 'Senha do certificado e obrigatoria'),
});

export type UploadCertificate = z.infer<typeof uploadCertificateSchema>;
