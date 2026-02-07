'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Upload, Trash2, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConfigFiscal {
  id: string;
  regimeTributario: string | null;
  inscricaoEstadual: string | null;
  inscricaoMunicipal: string | null;
  ambiente: string;
  serieNFe: number;
  serieNFSe: number;
  serieNFCe: number;
  ultimoNumeroNFe: number;
  ultimoNumeroNFSe: number;
  ultimoNumeroNFCe: number;
  hasCertificate: boolean;
  certificateExpiry: string | null;
}

interface CertificateStatus {
  hasCertificate: boolean;
  expiry: string | null;
  daysUntilExpiry: number | null;
  isExpiring: boolean;
  isExpired: boolean;
}

const REGIMES = [
  { value: 'MEI', label: 'MEI', description: 'Faturamento ate R$ 81.000/ano. Isento da maioria dos impostos.' },
  { value: 'SIMPLES_NACIONAL', label: 'Simples Nacional', description: 'Faturamento ate R$ 4,8 milhoes/ano. Impostos unificados em guia unica.' },
  { value: 'LUCRO_PRESUMIDO', label: 'Lucro Presumido', description: 'Faturamento ate R$ 78 milhoes/ano. Base de calculo presumida.' },
  { value: 'LUCRO_REAL', label: 'Lucro Real', description: 'Obrigatorio acima de R$ 78 milhoes/ano. Impostos sobre lucro real.' },
];

export default function ConfigFiscalPage() {
  const [config, setConfig] = useState<ConfigFiscal | null>(null);
  const [certStatus, setCertStatus] = useState<CertificateStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    regimeTributario: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    ambiente: 'homologacao',
    serieNFe: 1,
    serieNFSe: 1,
    serieNFCe: 1,
  });

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/config-fiscal');
      if (!res.ok) throw new Error('Erro ao carregar configuracao');
      const json = await res.json();
      if (json.data) {
        setConfig(json.data);
        setFormData({
          regimeTributario: json.data.regimeTributario ?? '',
          inscricaoEstadual: json.data.inscricaoEstadual ?? '',
          inscricaoMunicipal: json.data.inscricaoMunicipal ?? '',
          ambiente: json.data.ambiente ?? 'homologacao',
          serieNFe: json.data.serieNFe ?? 1,
          serieNFSe: json.data.serieNFSe ?? 1,
          serieNFCe: json.data.serieNFCe ?? 1,
        });
      }
      setCertStatus(json.certificateStatus ?? null);
    } catch {
      setError('Erro ao carregar configuracao fiscal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const body = {
        ...formData,
        regimeTributario: formData.regimeTributario || undefined,
        inscricaoEstadual: formData.inscricaoEstadual || null,
        inscricaoMunicipal: formData.inscricaoMunicipal || null,
      };
      const res = await fetch('/api/v1/config-fiscal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Erro ao salvar');
      }
      setSuccess('Configuracao salva com sucesso');
      fetchConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleCertificateUpload(file: File) {
    setUploadingCert(true);
    setError(null);
    setSuccess(null);

    const password = prompt('Digite a senha do certificado digital:');
    if (!password) {
      setUploadingCert(false);
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/v1/config-fiscal/certificado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateData: base64, certificatePassword: password }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Erro ao enviar certificado');
      }

      setSuccess('Certificado enviado com sucesso');
      fetchConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar certificado');
    } finally {
      setUploadingCert(false);
    }
  }

  async function handleRemoveCertificate() {
    if (!confirm('Tem certeza que deseja remover o certificado digital?')) return;

    try {
      const res = await fetch('/api/v1/config-fiscal/certificado', { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao remover certificado');
      setSuccess('Certificado removido');
      fetchConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover');
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-5 w-5" /> Configuracao Fiscal
        </h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Settings className="h-5 w-5" /> Configuracao Fiscal
      </h1>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>
      )}

      {/* Regime Tributario */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Regime Tributario</h2>
        <div className="grid gap-2">
          {REGIMES.map((regime) => (
            <button
              key={regime.value}
              type="button"
              onClick={() => setFormData((f) => ({ ...f, regimeTributario: regime.value }))}
              className={`text-left p-3 rounded-lg border-2 transition-colors ${
                formData.regimeTributario === regime.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{regime.label}</div>
              <div className="text-xs text-gray-500 mt-1">{regime.description}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Inscricoes */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Inscricoes</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Inscricao Estadual</label>
            <input
              type="text"
              value={formData.inscricaoEstadual}
              onChange={(e) => setFormData((f) => ({ ...f, inscricaoEstadual: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Ex: 123456789"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Inscricao Municipal</label>
            <input
              type="text"
              value={formData.inscricaoMunicipal}
              onChange={(e) => setFormData((f) => ({ ...f, inscricaoMunicipal: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Ex: 987654321"
            />
          </div>
        </div>
      </Card>

      {/* Ambiente */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Ambiente</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData((f) => ({ ...f, ambiente: 'homologacao' }))}
            className={`flex-1 p-3 rounded-lg border-2 text-center text-sm ${
              formData.ambiente === 'homologacao'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200'
            }`}
          >
            <Shield className="h-4 w-4 mx-auto mb-1" />
            Homologacao (Testes)
          </button>
          <button
            type="button"
            onClick={() => setFormData((f) => ({ ...f, ambiente: 'producao' }))}
            className={`flex-1 p-3 rounded-lg border-2 text-center text-sm ${
              formData.ambiente === 'producao'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200'
            }`}
          >
            <CheckCircle className="h-4 w-4 mx-auto mb-1" />
            Producao
          </button>
        </div>
        {formData.ambiente === 'producao' && (
          <p className="text-xs text-orange-600">
            Em producao, notas fiscais emitidas tem validade fiscal real.
          </p>
        )}
      </Card>

      {/* Series */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Series de Numeracao</h2>
        <div className="grid grid-cols-3 gap-3">
          {(['NFe', 'NFSe', 'NFCe'] as const).map((tipo) => {
            const serieKey = `serie${tipo}` as keyof typeof formData;
            return (
              <div key={tipo}>
                <label className="block text-xs text-gray-600 mb-1">Serie {tipo}</label>
                <input
                  type="number"
                  value={formData[serieKey]}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, [serieKey]: parseInt(e.target.value) || 1 }))
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  min={1}
                  max={999}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Certificado Digital */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Certificado Digital A1</h2>

        {certStatus?.hasCertificate ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {certStatus.isExpired ? (
                <Badge className="bg-red-100 text-red-800">Expirado</Badge>
              ) : certStatus.isExpiring ? (
                <Badge className="bg-yellow-100 text-yellow-800">Expira em breve</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">Valido</Badge>
              )}
              {certStatus.expiry && (
                <span className="text-sm text-gray-600">
                  Vence em: {new Date(certStatus.expiry).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>

            {certStatus.isExpiring && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-sm text-yellow-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Certificado expira em {certStatus.daysUntilExpiry} dias. Renove em breve.
              </div>
            )}

            {certStatus.isExpired && (
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-sm text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Certificado expirado. Emissao de notas fiscais nao sera possivel.
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCert}
              >
                <Upload className="h-4 w-4 mr-1" />
                Substituir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveCertificate}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remover
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Nenhum certificado digital configurado. Envie seu certificado A1 (.pfx) para emitir notas fiscais.
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCert}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadingCert ? 'Enviando...' : 'Enviar Certificado A1 (.pfx)'}
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pfx,.p12"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCertificateUpload(file);
            e.target.value = '';
          }}
        />
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full"
      >
        {saving ? 'Salvando...' : 'Salvar Configuracoes'}
      </Button>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
