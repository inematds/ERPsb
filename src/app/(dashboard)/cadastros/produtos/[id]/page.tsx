'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, ShoppingCart, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { formatCurrency } from '@/lib/formatters';

interface Produto {
  id: string;
  name: string;
  type: string;
  sellPrice: number;
  costPrice: number | null;
  unit: string;
  barcode: string | null;
  ncm: string | null;
  description: string | null;
  stockMin: number | null;
  trackStock: boolean;
  active: boolean;
  createdAt: string;
}

export default function ProdutoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProduto = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/produtos/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setProduto(json.data);
      } else {
        toast.error('Produto nao encontrado');
        router.push('/cadastros/produtos');
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchProduto();
  }, [fetchProduto]);

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editingField || !produto) return;

    try {
      const res = await fetch(`/api/v1/produtos/${produto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [editingField]: editValue }),
      });

      if (res.ok) {
        const json = await res.json();
        setProduto(json.data);
        toast.success('Campo atualizado');
      } else {
        toast.error('Erro ao atualizar');
      }
    } finally {
      cancelEdit();
    }
  };

  const toggleActive = async () => {
    if (!produto) return;
    const res = await fetch(`/api/v1/produtos/${produto.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !produto.active }),
    });
    if (res.ok) {
      const json = await res.json();
      setProduto(json.data);
      toast.success(json.data.active ? 'Produto ativado' : 'Produto desativado');
    }
  };

  const handleDelete = async () => {
    if (!produto) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/produtos/${produto.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Produto desativado');
        router.push('/cadastros/produtos');
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

  if (!produto) return null;

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
        <Button variant="ghost" size="sm" onClick={() => router.push('/cadastros/produtos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold flex-1">{produto.name}</h1>
        <Badge variant={produto.type === 'PRODUTO' ? 'default' : 'secondary'}>
          {produto.type === 'PRODUTO' ? 'Produto' : 'Servico'}
        </Badge>
      </div>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">Informacoes</h2>
        {renderField('Nome', 'name', produto.name)}
        <div className="flex items-center justify-between py-2 border-b px-2">
          <span className="text-sm text-muted-foreground">Preco de Venda</span>
          <span className="text-sm font-medium">{formatCurrency(produto.sellPrice)}</span>
        </div>
        {produto.costPrice !== null && (
          <div className="flex items-center justify-between py-2 border-b px-2">
            <span className="text-sm text-muted-foreground">Preco de Custo</span>
            <span className="text-sm font-medium">{formatCurrency(produto.costPrice)}</span>
          </div>
        )}
        <div className="flex items-center justify-between py-2 border-b px-2">
          <span className="text-sm text-muted-foreground">Unidade</span>
          <span className="text-sm font-medium">{produto.unit}</span>
        </div>
        {renderField('Codigo de Barras', 'barcode', produto.barcode)}
        {renderField('NCM', 'ncm', produto.ncm)}
        {renderField('Descricao', 'description', produto.description)}
        <div className="flex items-center justify-between py-2 border-b px-2">
          <span className="text-sm text-muted-foreground">Estoque Minimo</span>
          <span className="text-sm font-medium">{produto.stockMin ?? 0}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b px-2">
          <span className="text-sm text-muted-foreground">Controla Estoque</span>
          <span className="text-sm font-medium">{produto.trackStock ? 'Sim' : 'Nao'}</span>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button
          variant={produto.active ? 'outline' : 'default'}
          className="flex-1"
          onClick={toggleActive}
        >
          {produto.active ? 'Desativar' : 'Ativar'}
        </Button>
      </div>

      <Card className="p-4">
        <EmptyState
          icon={ShoppingCart}
          title="Historico de Vendas"
          description="As vendas deste produto aparecerão aqui"
        />
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir produto
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir produto?</DialogTitle>
            <DialogDescription>
              O produto {produto.name} sera desativado. Voce podera reativa-lo depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Desativando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
