'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { toast } from 'sonner';

interface FormaPagamento {
  id: string;
  name: string;
  type: string;
  active: boolean;
  isDefault: boolean;
  installments: number;
  fee: number;
}

const TYPE_LABELS: Record<string, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  DEBITO: 'Debito',
  CREDITO: 'Credito',
  BOLETO: 'Boleto',
  OUTRO: 'Outro',
};

export default function FormasPagamentoPage() {
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('OUTRO');
  const [saving, setSaving] = useState(false);

  const fetchFormas = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/formas-pagamento');
      if (res.ok) {
        const json = await res.json();
        setFormas(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormas();
  }, [fetchFormas]);

  const handleToggle = async (id: string, currentActive: boolean) => {
    const res = await fetch(`/api/v1/formas-pagamento/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !currentActive }),
    });
    if (res.ok) {
      setFormas((prev) =>
        prev.map((f) => (f.id === id ? { ...f, active: !currentActive } : f)),
      );
    }
  };

  const handleFieldUpdate = async (id: string, field: string, value: string | number) => {
    const res = await fetch(`/api/v1/formas-pagamento/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      const json = await res.json();
      setFormas((prev) => prev.map((f) => (f.id === id ? json.data : f)));
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/v1/formas-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, type: newType }),
      });
      if (res.ok) {
        const json = await res.json();
        setFormas((prev) => [...prev, json.data]);
        setShowNewDialog(false);
        setNewName('');
        setNewType('OUTRO');
        toast.success('Forma de pagamento criada');
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/configuracoes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-xl font-bold">Formas de Pagamento</h1>
        </div>
        <ListSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/configuracoes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-xl font-bold">Formas de Pagamento</h1>
        </div>
        <Button size="sm" onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nova Forma
        </Button>
      </div>

      {formas.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Nenhuma forma de pagamento"
          description="Adicione formas de pagamento para usar nas vendas"
          actionLabel="Adicionar forma"
          onAction={() => setShowNewDialog(true)}
        />
      ) : (
        <div className="space-y-3">
          {formas.map((forma) => (
            <Card key={forma.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{forma.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {TYPE_LABELS[forma.type] || forma.type}
                  </Badge>
                  {forma.isDefault && (
                    <Badge variant="default" className="text-xs">Padrao</Badge>
                  )}
                </div>
                <Switch
                  checked={forma.active}
                  onCheckedChange={() => handleToggle(forma.id, forma.active)}
                  size="sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <label className="text-muted-foreground block mb-1">Nome</label>
                  <Input
                    defaultValue={forma.name}
                    className="h-8 text-sm"
                    onBlur={(e) => {
                      if (e.target.value !== forma.name) {
                        handleFieldUpdate(forma.id, 'name', e.target.value);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Taxa</label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      defaultValue={(forma.fee / 100).toFixed(2)}
                      step="0.01"
                      min="0"
                      className="h-8 text-sm"
                      onBlur={(e) => {
                        const newFee = Math.round(parseFloat(e.target.value || '0') * 100);
                        if (newFee !== forma.fee) {
                          handleFieldUpdate(forma.id, 'fee', newFee);
                        }
                      }}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Parcelas</label>
                  <Input
                    type="number"
                    defaultValue={forma.installments}
                    min="1"
                    className="h-8 text-sm"
                    onBlur={(e) => {
                      const val = parseInt(e.target.value || '1', 10);
                      if (val !== forma.installments) {
                        handleFieldUpdate(forma.id, 'installments', val);
                      }
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Forma de Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium block mb-1">Nome</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Transferencia bancaria"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Tipo</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="PIX">PIX</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="DEBITO">Debito</option>
                <option value="CREDITO">Credito</option>
                <option value="BOLETO">Boleto</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || !newName.trim()}>
              {saving ? 'Salvando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
