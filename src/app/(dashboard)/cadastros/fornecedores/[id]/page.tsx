'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, ShoppingBag, Check, X } from 'lucide-react';
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

interface Fornecedor {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  document: string | null;
  address: Address | null;
  notes: string | null;
  createdAt: string;
}

export default function FornecedorDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFornecedor = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/fornecedores/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setFornecedor(json.data);
      } else {
        toast.error('Fornecedor nao encontrado');
        router.push('/cadastros/fornecedores');
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchFornecedor();
  }, [fetchFornecedor]);

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editingField || !fornecedor) return;

    try {
      const res = await fetch(`/api/v1/fornecedores/${fornecedor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [editingField]: editValue }),
      });

      if (res.ok) {
        const json = await res.json();
        setFornecedor(json.data);
        toast.success('Campo atualizado');
      } else {
        toast.error('Erro ao atualizar');
      }
    } finally {
      cancelEdit();
    }
  };

  const handleDelete = async () => {
    if (!fornecedor) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/fornecedores/${fornecedor.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Fornecedor excluido');
        router.push('/cadastros/fornecedores');
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

  if (!fornecedor) return null;

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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/cadastros/fornecedores')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold flex-1">{fornecedor.name}</h1>
      </div>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">
          Dados do Fornecedor
        </h2>
        {renderField('Nome', 'name', fornecedor.name)}
        {renderField('Telefone', 'phone', fornecedor.phone)}
        {renderField('Email', 'email', fornecedor.email)}
        {renderField('CPF/CNPJ', 'document', fornecedor.document)}
        {renderField('Observacoes', 'notes', fornecedor.notes)}
      </Card>

      {fornecedor.address && (
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">Endereco</h2>
          <p className="text-sm">
            {[
              fornecedor.address.street,
              fornecedor.address.number,
              fornecedor.address.neighborhood,
              fornecedor.address.city,
              fornecedor.address.state,
              fornecedor.address.zipCode,
            ]
              .filter(Boolean)
              .join(', ') || '-'}
          </p>
        </Card>
      )}

      <Card className="p-4">
        <EmptyState
          icon={ShoppingBag}
          title="Historico de Compras"
          description="As compras deste fornecedor aparecerão aqui"
        />
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir fornecedor
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir fornecedor?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {fornecedor.name}? Esta acao nao pode ser desfeita.
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
