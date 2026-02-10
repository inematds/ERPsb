'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { PageHelp } from '@/components/shared/page-help';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface Venda {
  id: string;
  number: number | null;
  total: number;
  status: string;
  createdAt: string;
  client: { id: string; name: string } | null;
  paymentMethod: { id: string; name: string; type: string };
}

interface Meta {
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_TABS = [
  { value: '', label: 'Todas' },
  { value: 'CONFIRMADA', label: 'Confirmadas' },
  { value: 'CANCELADA', label: 'Canceladas' },
];

const STATUS_COLORS: Record<string, string> = {
  RASCUNHO: 'bg-gray-100 text-gray-800',
  CONFIRMADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
};

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const loadVendas = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', '20');
      if (status) params.set('status', status);
      if (search) params.set('search', search);

      const res = await fetch(`/api/v1/vendas?${params}`);
      if (res.ok) {
        const json = await res.json();
        setVendas(json.data);
        setMeta(json.meta);
      } else {
        toast.error('Erro ao carregar vendas');
      }
    } catch {
      toast.error('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    loadVendas(1);
  }, [loadVendas]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => loadVendas(1), 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const totalPages = Math.ceil(meta.total / meta.pageSize);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Vendas</h1>
          <PageHelp title="Vendas" description="Registre vendas de forma rapida — a meta e 30 segundos. Cada venda gera automaticamente uma conta a receber." helpHref="/ajuda/vendas" />
        </div>
        <Button size="sm" asChild>
          <Link href="/vendas/nova">
            <Plus className="h-4 w-4 mr-1" />
            Nova Venda
          </Link>
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={status === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatus(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente..."
          className="pl-9"
        />
      </div>

      {/* Results */}
      {loading ? (
        <ListSkeleton />
      ) : vendas.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhuma venda encontrada"
          description="Registre sua primeira venda para comecar."
          actionLabel="Nova Venda"
          actionHref="/vendas/nova"
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {meta.total} venda{meta.total !== 1 ? 's' : ''}
          </p>

          <div className="space-y-2">
            {vendas.map((venda) => {
              const dateStr = new Date(venda.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              });

              return (
                <Link key={venda.id} href={`/vendas/${venda.id}`}>
                  <Card className="p-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {venda.number ? `#${venda.number}` : 'Rascunho'}
                          </p>
                          <Badge className={`text-[10px] ${STATUS_COLORS[venda.status]}`}>
                            {venda.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {venda.client?.name || 'Sem cliente'} · {dateStr} · {venda.paymentMethod.name}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency(venda.total)}
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => loadVendas(meta.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {meta.page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= totalPages}
                onClick={() => loadVendas(meta.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
