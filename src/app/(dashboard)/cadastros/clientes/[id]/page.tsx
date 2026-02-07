'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, ShoppingCart, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { toast } from 'sonner';

interface Address {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface Cliente {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  document: string | null;
  address: Address | null;
  notes: string | null;
  createdAt: string;
}

export default function ClienteDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCliente = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/clientes/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setCliente(json.data);
      } else {
        toast.error('Cliente nao encontrado');
        router.push('/cadastros/clientes');
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchCliente();
  }, [fetchCliente]);

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editingField || !cliente) return;

    try {
      const res = await fetch(`/api/v1/clientes/${cliente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [editingField]: editValue }),
      });

      if (res.ok) {
        const json = await res.json();
        setCliente(json.data);
        toast.success('Campo atualizado');
      } else {
        toast.error('Erro ao atualizar');
      }
    } finally {
      cancelEdit();
    }
  };

  const handleDelete = async () => {
    if (!cliente) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/clientes/${cliente.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Cliente excluido');
        router.push('/cadastros/clientes');
      } else {
        toast.error('Erro ao excluir');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <CardSkeleton />
      </div>
    );
  }

  if (!cliente) return null;

  const renderField = (label: string, field: string, value: string | null) => (
    <div
      className="flex items-center justify-between py-2 border-b cursor-pointer hover:bg-accent/50 px-2 rounded"
      onClick={() => startEdit(field, value || '')}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      {editingField === field ? (
        <div className="flex items-center gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-48"
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={saveEdit}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelEdit}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <span className="text-sm font-medium">{value || '-'}</span>
      )}
    </div>
  );

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/cadastros/clientes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold flex-1">{cliente.name}</h1>
      </div>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">Dados do Cliente</h2>
        {renderField('Nome', 'name', cliente.name)}
        {renderField('Telefone', 'phone', cliente.phone)}
        {renderField('Email', 'email', cliente.email)}
        {renderField('CPF/CNPJ', 'document', cliente.document)}
        {renderField('Observacoes', 'notes', cliente.notes)}
      </Card>

      {cliente.address && (
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">Endereco</h2>
          <p className="text-sm">
            {[
              cliente.address.street,
              cliente.address.number,
              cliente.address.neighborhood,
              cliente.address.city,
              cliente.address.state,
              cliente.address.zipCode,
            ]
              .filter(Boolean)
              .join(', ') || '-'}
          </p>
        </Card>
      )}

      <Card className="p-4">
        <EmptyState
          icon={ShoppingCart}
          title="Historico de Vendas"
          description="As vendas deste cliente aparecerão aqui"
        />
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir cliente
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir cliente?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {cliente.name}? Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Confirmar exclusao'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
