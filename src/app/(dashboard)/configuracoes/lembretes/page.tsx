'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface LembreteConfig {
  ativo: boolean;
  diasAntes: number;
  noDia: boolean;
  diasDepois: number;
}

export default function LembretesConfigPage() {
  const [config, setConfig] = useState<LembreteConfig>({
    ativo: false,
    diasAntes: 3,
    noDia: true,
    diasDepois: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/v1/whatsapp/lembretes');
        if (res.ok) {
          const json = await res.json();
          setConfig(json.data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/whatsapp/lembretes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        toast.success('Configuracao salva');
      } else {
        toast.error('Erro ao salvar');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleProcessar = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/v1/whatsapp/processar-lembretes', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        toast.success(`Lembretes processados: ${json.data.sent} enviados, ${json.data.skipped} ignorados`);
      } else {
        toast.error('Erro ao processar lembretes');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="h-40 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/configuracoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bell className="h-5 w-5" /> Lembretes Automaticos
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuracao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="ativo">Lembretes ativos</label>
            <Switch
              id="ativo"
              checked={config.ativo}
              onCheckedChange={(checked) => setConfig({ ...config, ativo: checked })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="diasAntes">Dias antes do vencimento</label>
            <Input
              id="diasAntes"
              type="number"
              min={0}
              max={30}
              value={config.diasAntes}
              onChange={(e) => setConfig({ ...config, diasAntes: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="noDia">Enviar no dia do vencimento</label>
            <Switch
              id="noDia"
              checked={config.noDia}
              onCheckedChange={(checked) => setConfig({ ...config, noDia: checked })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="diasDepois">Dias depois do vencimento</label>
            <Input
              id="diasDepois"
              type="number"
              min={0}
              max={30}
              value={config.diasDepois}
              onChange={(e) => setConfig({ ...config, diasDepois: Number(e.target.value) })}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Salvando...' : 'Salvar Configuracao'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <Button
            onClick={handleProcessar}
            disabled={processing || !config.ativo}
            variant="outline"
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {processing ? 'Processando...' : 'Processar Lembretes Agora'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Envia lembretes para todas as contas a receber pendentes conforme configuracao.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
