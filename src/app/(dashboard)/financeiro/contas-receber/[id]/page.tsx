'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { formatCurrency, parseCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface ContaReceber {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  receivedDate: string | null;
  status: string;
  category: string;
  clientId: string | null;
  client: { id: string; name: string } | null;
  notes: string | null;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  VENDAS: 'Vendas',
  SERVICOS: 'Servicos',
  OUTROS: 'Outros',
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'RECEBIDO': return 'bg-green-100 text-green-800';
    case 'VENCIDO': return 'bg-red-100 text-red-800';
    case 'CANCELADO': return 'bg-gray-100 text-gray-600';
    default: return 'bg-yellow-100 text-yellow-800';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function ContaReceberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [conta, setConta] = useState<ContaReceber | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const fetchConta = useCallback(async () => {
    const res = await fetch(`/api/v1/contas-receber/${id}`);
    if (res.ok) {
      const json = await res.json();
      setConta(json.data);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    fetchConta();
  }, [fetchConta]);

  const handleFieldSave = async (field: string, value: unknown) => {
    const res = await fetch(`/api/v1/contas-receber/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      const json = await res.json();
      setConta(json.data);
      toast.success('Atualizado');
    }
    setEditingField(null);
  };

  const handleMarkAsReceived = async () => {
    setShowReceiveDialog(false);
    const res = await fetch(`/api/v1/contas-receber/${id}/receber`, { method: 'POST' });
    if (res.ok) {
      toast.success('Conta marcada como recebida');
      fetchConta();
    }
  };

  const handleCancel = async () => {
    setShowCancelDialog(false);
    const res = await fetch(`/api/v1/contas-receber/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Conta cancelada');
      router.push('/financeiro/contas-receber');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/financeiro/contas-receber"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-xl font-bold">Conta a Receber</h1>
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (!conta) {
    return (
      <div className="p-4">
        <p className="text-center text-muted-foreground">Conta nao encontrada</p>
      </div>
    );
  }

  const isPending = conta.status === 'PENDENTE' || conta.status === 'VENCIDO';

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/financeiro/contas-receber"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-xl font-bold">Conta a Receber</h1>
        </div>
        <Badge className={getStatusColor(conta.status)}>{conta.status}</Badge>
      </div>

      <Card className="p-4 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Descricao</label>
          {editingField === 'description' ? (
            <div className="flex gap-2">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFieldSave('description', editValue);
                  if (e.key === 'Escape') setEditingField(null);
                }}
              />
              <Button size="sm" variant="ghost" onClick={() => handleFieldSave('description', editValue)}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p
              className="font-medium cursor-pointer hover:text-primary"
              onClick={() => { setEditingField('description'); setEditValue(conta.description); }}
            >
              {conta.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Valor</label>
            {editingField === 'amount' ? (
              <div className="flex gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFieldSave('amount', parseCurrency(editValue));
                    if (e.key === 'Escape') setEditingField(null);
                  }}
                />
                <Button size="sm" variant="ghost" onClick={() => handleFieldSave('amount', parseCurrency(editValue))}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p
                className="font-semibold text-lg cursor-pointer hover:text-primary"
                onClick={() => { setEditingField('amount'); setEditValue((conta.amount / 100).toFixed(2).replace('.', ',')); }}
              >
                {formatCurrency(conta.amount)}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Vencimento</label>
            <p className="font-medium">{formatDate(conta.dueDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Categoria</label>
            <p>{CATEGORY_LABELS[conta.category] || conta.category}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Cliente</label>
            <p>{conta.client?.name || '-'}</p>
          </div>
        </div>

        {conta.receivedDate && (
          <div>
            <label className="text-xs text-muted-foreground">Data do recebimento</label>
            <p>{formatDate(conta.receivedDate)}</p>
          </div>
        )}

        {conta.notes && (
          <div>
            <label className="text-xs text-muted-foreground">Notas</label>
            <p className="text-sm">{conta.notes}</p>
          </div>
        )}
      </Card>

      {isPending && (
        <div className="space-y-2">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 text-red-600 border-red-200"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancelar Conta
            </Button>
            <Button className="flex-1" onClick={() => setShowReceiveDialog(true)}>
              <Check className="h-4 w-4 mr-1" />
              Marcar como Recebido
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" disabled title="Em breve">
              Cobrar via PIX
            </Button>
            <Button variant="outline" className="flex-1" disabled title="Em breve">
              Lembrar via WhatsApp
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar recebimento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Deseja marcar esta conta de {formatCurrency(conta.amount)} como recebida?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiveDialog(false)}>Nao</Button>
            <Button onClick={handleMarkAsReceived}>Sim, recebido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar conta</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja cancelar esta conta? Esta acao nao pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Nao</Button>
            <Button variant="destructive" onClick={handleCancel}>Sim, cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
