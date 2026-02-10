'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Package, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { PageHelp } from '@/components/shared/page-help';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface Produto {
  id: string;
  name: string;
  type: string;
  sellPrice: number;
  active: boolean;
  unit: string;
}

interface Meta {
  total: number;
  page: number;
  pageSize: number;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pageSize: 20 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProdutos = useCallback(async (searchTerm: string, page: number, type: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (type) params.set('type', type);
      params.set('page', String(page));
      params.set('pageSize', '20');

      const res = await fetch(`/api/v1/produtos?${params}`);
      if (res.ok) {
        const json = await res.json();
        setProdutos(json.data);
        setMeta(json.meta);
      } else {
        toast.error('Erro ao carregar produtos');
      }
    } catch {
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProdutos(search, 1, typeFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter, fetchProdutos]);

  const handlePageChange = (newPage: number) => {
    fetchProdutos(search, newPage, typeFilter);
  };

  const totalPages = Math.ceil(meta.total / meta.pageSize);

  if (isLoading && produtos.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Produtos e Servicos</h1>
            <PageHelp title="Produtos" description="Cadastre produtos e servicos com preco de venda e custo. Ative o controle de estoque para produtos fisicos." helpHref="/ajuda/cadastros" />
          </div>
        </div>
        <ListSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Produtos e Servicos</h1>
          <PageHelp title="Produtos" description="Cadastre produtos e servicos com preco de venda e custo. Ative o controle de estoque para produtos fisicos." helpHref="/ajuda/cadastros" />
        </div>
        <Button asChild size="sm">
          <Link href="/cadastros/produtos/novo">
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Link>
        </Button>
      </div>

      {meta.total > 0 || search || typeFilter ? (
        <>
          <div className="flex gap-2">
            {['', 'PRODUTO', 'SERVICO'].map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(t)}
              >
                {t === '' ? 'Todos' : t === 'PRODUTO' ? 'Produtos' : 'Servicos'}
              </Button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou codigo de barras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <ListSkeleton />
          ) : produtos.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhum item encontrado"
              description="Tente buscar com outros termos ou limpe os filtros."
            />
          ) : (
            <div className="space-y-2">
              {produtos.map((p) => (
                <Link key={p.id} href={`/cadastros/produtos/${p.id}`}>
                  <Card className="p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(p.sellPrice)} / {p.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={p.type === 'PRODUTO' ? 'default' : 'secondary'}>
                          {p.type === 'PRODUTO' ? 'Produto' : 'Servico'}
                        </Badge>
                        {!p.active && (
                          <Badge variant="outline" className="text-muted-foreground">
                            Inativo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">
                {meta.total} ite{meta.total !== 1 ? 'ns' : 'm'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm">
                  {meta.page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page >= totalPages}
                >
                  Proximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Package}
          title="Nenhum produto cadastrado"
          description="Cadastre seu primeiro produto ou servico para comecar a vender"
          actionLabel="Cadastrar produto"
          actionHref="/cadastros/produtos/novo"
        />
      )}
    </div>
  );
}
