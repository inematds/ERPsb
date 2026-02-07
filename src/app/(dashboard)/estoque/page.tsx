'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, Plus, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { toast } from 'sonner';

interface SaldoEstoque {
  productId: string;
  name: string;
  unit: string;
  saldo: number;
  stockMin: number;
  abaixoMinimo: boolean;
}

type Tab = 'saldos' | 'entrada' | 'ajuste';

export default function EstoquePage() {
  const [saldos, setSaldos] = useState<SaldoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('saldos');
  const [entradaProductId, setEntradaProductId] = useState('');
  const [entradaQty, setEntradaQty] = useState('');
  const [entradaNotes, setEntradaNotes] = useState('');
  const [ajusteProductId, setAjusteProductId] = useState('');
  const [ajusteQty, setAjusteQty] = useState('');
  const [ajusteNotes, setAjusteNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSaldos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/estoque');
      if (res.ok) {
        const json = await res.json();
        setSaldos(json.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSaldos(); }, [fetchSaldos]);

  const handleEntrada = async () => {
    if (!entradaProductId || !entradaQty) {
      toast.error('Selecione produto e quantidade');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/estoque/entrada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: entradaProductId,
          quantity: Number(entradaQty),
          notes: entradaNotes || undefined,
        }),
      });
      if (res.ok) {
        toast.success('Entrada registrada');
        setEntradaProductId('');
        setEntradaQty('');
        setEntradaNotes('');
        setTab('saldos');
        fetchSaldos();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Erro ao registrar entrada');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAjuste = async () => {
    if (!ajusteProductId || !ajusteQty || !ajusteNotes) {
      toast.error('Preencha produto, quantidade e motivo');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/estoque/ajuste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: ajusteProductId,
          quantity: Number(ajusteQty),
          notes: ajusteNotes,
        }),
      });
      if (res.ok) {
        toast.success('Ajuste registrado');
        setAjusteProductId('');
        setAjusteQty('');
        setAjusteNotes('');
        setTab('saldos');
        fetchSaldos();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Erro ao registrar ajuste');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const alertas = saldos.filter(s => s.abaixoMinimo && s.stockMin > 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5" /> Estoque
        </h1>
        {alertas.length > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {alertas.length} alerta{alertas.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {(['saldos', 'entrada', 'ajuste'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
              tab === t
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {t === 'saldos' ? 'Saldos' : t === 'entrada' ? 'Entrada' : 'Ajuste'}
          </button>
        ))}
      </div>

      {tab === 'saldos' && (
        <>
          {loading ? (
            <ListSkeleton rows={5} />
          ) : saldos.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nenhum produto com estoque"
              description="Cadastre produtos com controle de estoque ativo."
            />
          ) : (
            <div className="space-y-2">
              {saldos.map((item) => (
                <Card key={item.productId} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Min: {item.stockMin} {item.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${item.abaixoMinimo && item.stockMin > 0 ? 'text-red-600' : ''}`}>
                        {item.saldo}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.unit}</p>
                      {item.abaixoMinimo && item.stockMin > 0 && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Baixo
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'entrada' && (
        <Card>
          <CardHeader><CardTitle className="text-base"><Plus className="h-4 w-4 inline mr-1" />Entrada de Estoque</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <select
              value={entradaProductId}
              onChange={(e) => setEntradaProductId(e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="">Selecione o produto</option>
              {saldos.map((s) => (
                <option key={s.productId} value={s.productId}>{s.name}</option>
              ))}
            </select>
            <Input
              type="number"
              min={1}
              placeholder="Quantidade"
              value={entradaQty}
              onChange={(e) => setEntradaQty(e.target.value)}
            />
            <Input
              placeholder="Observacao (opcional)"
              value={entradaNotes}
              onChange={(e) => setEntradaNotes(e.target.value)}
            />
            <Button onClick={handleEntrada} disabled={submitting} className="w-full">
              {submitting ? 'Registrando...' : 'Registrar Entrada'}
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === 'ajuste' && (
        <Card>
          <CardHeader><CardTitle className="text-base"><ArrowUpDown className="h-4 w-4 inline mr-1" />Ajuste de Estoque</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <select
              value={ajusteProductId}
              onChange={(e) => setAjusteProductId(e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="">Selecione o produto</option>
              {saldos.map((s) => (
                <option key={s.productId} value={s.productId}>{s.name} (saldo: {s.saldo})</option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Quantidade (positivo ou negativo)"
              value={ajusteQty}
              onChange={(e) => setAjusteQty(e.target.value)}
            />
            <Input
              placeholder="Motivo do ajuste (obrigatorio)"
              value={ajusteNotes}
              onChange={(e) => setAjusteNotes(e.target.value)}
            />
            <Button onClick={handleAjuste} disabled={submitting} className="w-full">
              {submitting ? 'Registrando...' : 'Registrar Ajuste'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
