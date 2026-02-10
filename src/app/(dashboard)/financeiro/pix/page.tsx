'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { QrCode, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { PageHelp } from '@/components/shared/page-help';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface PixCharge {
  id: string;
  amount: number;
  status: string;
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
  contaReceber: {
    id: string;
    description: string;
    amount: number;
    status: string;
    client: { id: string; name: string } | null;
  };
}

interface Meta {
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'PAID', label: 'Pagos' },
  { value: 'EXPIRED', label: 'Expirados' },
  { value: 'CANCELLED', label: 'Cancelados' },
];

function getStatusColor(status: string): string {
  switch (status) {
    case 'PAID': return 'bg-green-100 text-green-800';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'EXPIRED': return 'bg-red-100 text-red-800';
    case 'CANCELLED': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'PAID': return 'Pago';
    case 'PENDING': return 'Pendente';
    case 'EXPIRED': return 'Expirado';
    case 'CANCELLED': return 'Cancelado';
    default: return status;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR');
}

export default function PixChargesPage() {
  const [charges, setCharges] = useState<PixCharge[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pageSize: 20 });
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCharges = useCallback(
    async (page: number, status: string) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', '20');
        if (status) params.set('status', status);

        const res = await fetch(`/api/v1/pix?${params}`);
        if (res.ok) {
          const json = await res.json();
          setCharges(json.data);
          setMeta(json.meta);
        } else {
          toast.error('Erro ao carregar cobrancas PIX');
        }
      } catch {
        toast.error('Erro ao carregar cobrancas PIX');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchCharges(1, statusFilter);
  }, [statusFilter, fetchCharges]);

  const handlePageChange = (newPage: number) => {
    fetchCharges(newPage, statusFilter);
  };

  const totalPages = Math.ceil(meta.total / meta.pageSize);

  if (isLoading && charges.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Cobrancas PIX</h1>
            <PageHelp title="PIX" description="Gere cobrancas PIX com QR code para seus clientes. O pagamento e conciliado automaticamente via webhook." helpHref="/ajuda/pix" />
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
          <h1 className="text-xl font-bold">Cobrancas PIX</h1>
          <PageHelp title="PIX" description="Gere cobrancas PIX com QR code para seus clientes. O pagamento e conciliado automaticamente via webhook." helpHref="/ajuda/pix" />
        </div>
      </div>

      {meta.total > 0 || statusFilter ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab.value}
                variant={statusFilter === tab.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(tab.value)}
                className="shrink-0"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <ListSkeleton />
          ) : charges.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhuma cobranca encontrada"
              description="Altere os filtros para ver outras cobrancas."
            />
          ) : (
            <div className="space-y-2">
              {charges.map((charge) => (
                <Link key={charge.id} href={`/financeiro/pix/${charge.id}`}>
                  <Card className="p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {charge.contaReceber.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(charge.createdAt)}
                          </span>
                          {charge.contaReceber.client && (
                            <span className="text-xs text-muted-foreground">
                              {charge.contaReceber.client.name}
                            </span>
                          )}
                        </div>
                        {charge.status === 'PENDING' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Expira: {formatDateTime(charge.expiresAt)}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="font-semibold">{formatCurrency(charge.amount)}</p>
                        <Badge className={`text-xs ${getStatusColor(charge.status)}`}>
                          {getStatusLabel(charge.status)}
                        </Badge>
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
                {meta.total} cobranca{meta.total !== 1 ? 's' : ''}
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
          icon={QrCode}
          title="Nenhuma cobranca PIX"
          description="Gere cobrancas PIX a partir das suas contas a receber"
          actionLabel="Ir para Contas a Receber"
          actionHref="/financeiro/contas-receber"
        />
      )}
    </div>
  );
}
