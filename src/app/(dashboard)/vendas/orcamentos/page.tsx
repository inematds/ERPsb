'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface Orcamento {
  id: string;
  number: number | null;
  total: number;
  status: string;
  validUntil: string;
  createdAt: string;
  client: { id: string; name: string; phone: string };
  sale: { id: string; number: number } | null;
}

interface Meta {
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'PENDENTE', label: 'Pendentes' },
  { value: 'APROVADO', label: 'Aprovados' },
  { value: 'CONVERTIDO', label: 'Convertidos' },
  { value: 'EXPIRADO', label: 'Expirados' },
  { value: 'RECUSADO', label: 'Recusados' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  APROVADO: 'bg-blue-100 text-blue-800',
  CONVERTIDO: 'bg-green-100 text-green-800',
  EXPIRADO: 'bg-gray-100 text-gray-800',
  RECUSADO: 'bg-red-100 text-red-800',
};

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const loadOrcamentos = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', '20');
      if (status) params.set('status', status);
      if (search) params.set('search', search);

      const res = await fetch(`/api/v1/orcamentos?${params}`);
      if (res.ok) {
        const json = await res.json();
        setOrcamentos(json.data);
        setMeta(json.meta);
      } else {
        toast.error('Erro ao carregar orcamentos');
      }
    } catch {
      toast.error('Erro ao carregar orcamentos');
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    loadOrcamentos(1);
  }, [loadOrcamentos]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => loadOrcamentos(1), 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const totalPages = Math.ceil(meta.total / meta.pageSize);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Orcamentos</h1>
        <Button size="sm" asChild>
          <Link href="/vendas/orcamentos/novo">
            <Plus className="h-4 w-4 mr-1" />
            Novo Orcamento
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
      ) : orcamentos.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum orcamento encontrado"
          description="Crie seu primeiro orcamento para comecar."
          actionLabel="Novo Orcamento"
          actionHref="/vendas/orcamentos/novo"
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {meta.total} orcamento{meta.total !== 1 ? 's' : ''}
          </p>

          <div className="space-y-2">
            {orcamentos.map((orc) => {
              const dateStr = new Date(orc.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              });
              const validStr = new Date(orc.validUntil).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              });

              return (
                <Link key={orc.id} href={`/vendas/orcamentos/${orc.id}`}>
                  <Card className="p-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {orc.number ? `#${orc.number}` : 'Sem numero'}
                          </p>
                          <Badge className={`text-[10px] ${STATUS_COLORS[orc.status]}`}>
                            {orc.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {orc.client.name} · {dateStr} · Valido ate {validStr}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency(orc.total)}
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
                onClick={() => loadOrcamentos(meta.page - 1)}
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
                onClick={() => loadOrcamentos(meta.page + 1)}
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
