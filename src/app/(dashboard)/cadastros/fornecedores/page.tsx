'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Truck, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';

interface Fornecedor {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  document: string | null;
}

interface Meta {
  total: number;
  page: number;
  pageSize: number;
}

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pageSize: 20 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchFornecedores = useCallback(async (searchTerm: string, page: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      params.set('page', String(page));
      params.set('pageSize', '20');

      const res = await fetch(`/api/v1/fornecedores?${params}`);
      if (res.ok) {
        const json = await res.json();
        setFornecedores(json.data);
        setMeta(json.meta);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFornecedores(search, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchFornecedores]);

  const handlePageChange = (newPage: number) => {
    fetchFornecedores(search, newPage);
  };

  const totalPages = Math.ceil(meta.total / meta.pageSize);

  if (isLoading && fornecedores.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Fornecedores</h1>
        </div>
        <ListSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Fornecedores</h1>
        <Button asChild size="sm">
          <Link href="/cadastros/fornecedores/novo">
            <Plus className="h-4 w-4 mr-1" />
            Novo Fornecedor
          </Link>
        </Button>
      </div>

      {meta.total > 0 || search ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <ListSkeleton />
          ) : fornecedores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum fornecedor encontrado para &quot;{search}&quot;
            </div>
          ) : (
            <div className="space-y-2">
              {fornecedores.map((f) => (
                <Link key={f.id} href={`/cadastros/fornecedores/${f.id}`}>
                  <Card className="p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{f.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {f.phone || f.email || 'Sem contato'}
                        </p>
                      </div>
                      {f.document && (
                        <Badge variant="secondary" className="text-xs">
                          {f.document.replace(/\D/g, '').length <= 11 ? 'CPF' : 'CNPJ'}
                        </Badge>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">
                {meta.total} fornecedor{meta.total !== 1 ? 'es' : ''}
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
          icon={Truck}
          title="Nenhum fornecedor cadastrado"
          description="Cadastre seu primeiro fornecedor para registrar compras"
          actionLabel="Cadastrar fornecedor"
          actionHref="/cadastros/fornecedores/novo"
        />
      )}
    </div>
  );
}
