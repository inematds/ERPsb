'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface NotaFiscal {
  id: string;
  type: string;
  numero: number | null;
  serie: number | null;
  chaveAcesso: string | null;
  status: string;
  errorMessage: string | null;
  pdfUrl: string | null;
  emitidaEm: string | null;
  canceladaEm: string | null;
  motivoCancelamento: string | null;
  createdAt: string;
  sale: {
    id: string;
    number: number | null;
    total: number;
    client: { id: string; name: string } | null;
  } | null;
}

interface Meta {
  total: number;
  page: number;
  pageSize: number;
}

const TYPE_TABS = [
  { value: '', label: 'Todas' },
  { value: 'NFE', label: 'NFe' },
  { value: 'NFSE', label: 'NFSe' },
  { value: 'NFCE', label: 'NFCe' },
];

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'AUTORIZADA', label: 'Autorizadas' },
  { value: 'PROCESSANDO', label: 'Processando' },
  { value: 'REJEITADA', label: 'Rejeitadas' },
  { value: 'CANCELADA', label: 'Canceladas' },
];

function getStatusColor(status: string): string {
  switch (status) {
    case 'AUTORIZADA': return 'bg-green-100 text-green-800';
    case 'PROCESSANDO': return 'bg-yellow-100 text-yellow-800';
    case 'REJEITADA': return 'bg-red-100 text-red-800';
    case 'CANCELADA': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'NFE': return 'bg-blue-100 text-blue-800';
    case 'NFSE': return 'bg-purple-100 text-purple-800';
    case 'NFCE': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export default function NotasFiscaisPage() {
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchNotas = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/v1/notas-fiscais?${params}`);
      if (res.ok) {
        const json = await res.json();
        setNotas(json.data ?? []);
        setMeta(json.meta ?? { total: 0, page: 1, pageSize: 20 });
      } else {
        toast.error('Erro ao carregar notas fiscais');
      }
    } catch {
      toast.error('Erro ao carregar notas fiscais');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => { fetchNotas(); }, [fetchNotas]);

  const handleCancelar = async (id: string) => {
    const motivo = prompt('Informe o motivo do cancelamento (minimo 15 caracteres):');
    if (!motivo || motivo.length < 15) {
      toast.error('Motivo deve ter pelo menos 15 caracteres');
      return;
    }

    try {
      const res = await fetch(`/api/v1/notas-fiscais/${id}/cancelar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo }),
      });
      if (res.ok) {
        toast.success('Nota cancelada com sucesso');
        fetchNotas(meta.page);
      } else {
        const json = await res.json();
        toast.error(json.error ?? 'Erro ao cancelar');
      }
    } catch {
      toast.error('Erro ao cancelar nota');
    }
  };

  const handleCheckStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/notas-fiscais/${id}/status`, { method: 'POST' });
      if (res.ok) {
        toast.success('Status atualizado');
        fetchNotas(meta.page);
      }
    } catch {
      toast.error('Erro ao verificar status');
    }
  };

  const totalPages = Math.ceil(meta.total / meta.pageSize);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5" /> Notas Fiscais
        </h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/fiscal/config">Configuracao</Link>
        </Button>
      </div>

      {/* Type Filter */}
      <div className="flex gap-1 overflow-x-auto">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setTypeFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              typeFilter === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-1 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              statusFilter === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : notas.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma nota fiscal"
          description="As notas fiscais emitidas aparecerao aqui."
        />
      ) : (
        <div className="space-y-2">
          {notas.map((nota) => (
            <Card key={nota.id} className="p-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(nota.type)}>{nota.type}</Badge>
                    <Badge className={getStatusColor(nota.status)}>{nota.status}</Badge>
                    {nota.numero && (
                      <span className="text-sm text-muted-foreground">
                        #{nota.numero}
                      </span>
                    )}
                  </div>
                  {nota.sale && (
                    <div className="text-sm">
                      <span className="font-medium">
                        Venda {nota.sale.number ? `#${nota.sale.number}` : ''} -
                        {' '}{formatCurrency(nota.sale.total)}
                      </span>
                      {nota.sale.client && (
                        <span className="text-muted-foreground"> - {nota.sale.client.name}</span>
                      )}
                    </div>
                  )}
                  {nota.errorMessage && nota.status === 'REJEITADA' && (
                    <div className="text-xs text-red-600 bg-red-50 p-1.5 rounded">
                      {nota.errorMessage}
                    </div>
                  )}
                  {nota.motivoCancelamento && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded">
                      Cancelamento: {nota.motivoCancelamento}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(nota.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="flex gap-1">
                  {nota.status === 'PROCESSANDO' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCheckStatus(nota.id)}
                    >
                      Verificar
                    </Button>
                  )}
                  {nota.status === 'AUTORIZADA' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleCancelar(nota.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => fetchNotas(meta.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {meta.page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= totalPages}
            onClick={() => fetchNotas(meta.page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
