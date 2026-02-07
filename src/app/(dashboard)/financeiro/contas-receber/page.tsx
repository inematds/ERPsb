'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { HandCoins, Plus, Search, ChevronLeft, ChevronRight, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface ContaReceber {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  receivedDate: string | null;
  status: string;
  category: string;
  client: { id: string; name: string } | null;
}

interface Meta {
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'PENDENTE', label: 'Pendentes' },
  { value: 'VENCIDO', label: 'Vencidos' },
  { value: 'RECEBIDO', label: 'Recebidos' },
];

function getStatusColor(status: string, dueDate: string): string {
  if (status === 'RECEBIDO') return 'bg-green-100 text-green-800';
  if (status === 'CANCELADO') return 'bg-gray-100 text-gray-600';
  if (status === 'VENCIDO') return 'bg-red-100 text-red-800';

  const due = new Date(dueDate);
  const today = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);

  if (due < today) return 'bg-red-100 text-red-800';
  if (due <= threeDaysFromNow) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-600';
}

function getStatusLabel(status: string, dueDate: string): string {
  if (status === 'RECEBIDO') return 'Recebido';
  if (status === 'CANCELADO') return 'Cancelado';
  if (status === 'VENCIDO') return 'Vencido';

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (due < today) return 'Vencido';

  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);
  if (due <= threeDaysFromNow) return 'Vence em breve';
  return 'Pendente';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function ContasReceberPage() {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pageSize: 20 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [totalPendente, setTotalPendente] = useState(0);

  const fetchContas = useCallback(
    async (searchTerm: string, page: number, status: string) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        params.set('page', String(page));
        params.set('pageSize', '20');
        if (status) params.set('status', status);

        const res = await fetch(`/api/v1/contas-receber?${params}`);
        if (res.ok) {
          const json = await res.json();
          setContas(json.data);
          setMeta(json.meta);

          const pending = json.data
            .filter((c: ContaReceber) => c.status === 'PENDENTE' || c.status === 'VENCIDO')
            .reduce((sum: number, c: ContaReceber) => sum + c.amount, 0);
          setTotalPendente(pending);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContas(search, 1, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, fetchContas]);

  const handlePageChange = (newPage: number) => {
    fetchContas(search, newPage, statusFilter);
  };

  const handleMarkAsReceived = async (id: string) => {
    const res = await fetch(`/api/v1/contas-receber/${id}/receber`, { method: 'POST' });
    if (res.ok) {
      toast.success('Conta marcada como recebida');
      fetchContas(search, meta.page, statusFilter);
    } else {
      toast.error('Erro ao marcar conta como recebida');
    }
  };

  const handleCobrarPix = async (contaReceberId: string) => {
    const res = await fetch('/api/v1/pix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contaReceberId }),
    });
    if (res.ok) {
      const json = await res.json();
      window.location.href = `/financeiro/pix/${json.data.id}`;
    } else {
      toast.error('Erro ao gerar cobranca PIX');
    }
  };

  const totalPages = Math.ceil(meta.total / meta.pageSize);

  if (isLoading && contas.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Contas a Receber</h1>
        </div>
        <ListSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Contas a Receber</h1>
        <Button asChild size="sm">
          <Link href="/financeiro/contas-receber/novo">
            <Plus className="h-4 w-4 mr-1" />
            Nova Conta
          </Link>
        </Button>
      </div>

      {totalPendente > 0 && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <p className="text-sm font-medium text-blue-800">
            Total a receber: {formatCurrency(totalPendente)}
          </p>
        </Card>
      )}

      {meta.total > 0 || search || statusFilter ? (
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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descricao..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <ListSkeleton />
          ) : contas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma conta encontrada
            </div>
          ) : (
            <div className="space-y-2">
              {contas.map((conta) => (
                <Link key={conta.id} href={`/financeiro/contas-receber/${conta.id}`}>
                  <Card className="p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{conta.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(conta.dueDate)}
                          </span>
                          {conta.client && (
                            <span className="text-xs text-muted-foreground">
                              {conta.client.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(conta.amount)}</p>
                          <Badge
                            className={`text-xs ${getStatusColor(conta.status, conta.dueDate)}`}
                          >
                            {getStatusLabel(conta.status, conta.dueDate)}
                          </Badge>
                        </div>
                        {(conta.status === 'PENDENTE' || conta.status === 'VENCIDO') && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCobrarPix(conta.id);
                              }}
                              title="Cobrar via PIX"
                            >
                              <QrCode className="h-4 w-4 text-purple-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMarkAsReceived(conta.id);
                              }}
                              title="Marcar como recebido"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                          </>
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
                {meta.total} conta{meta.total !== 1 ? 's' : ''}
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
          icon={HandCoins}
          title="Nenhuma conta a receber"
          description="Cadastre suas contas a receber para acompanhar seus recebimentos"
          actionLabel="Nova conta"
          actionHref="/financeiro/contas-receber/novo"
        />
      )}
    </div>
  );
}
