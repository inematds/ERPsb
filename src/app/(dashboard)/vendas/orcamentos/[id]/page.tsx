'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  ShoppingCart,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface OrcamentoItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrcamentoDetail {
  id: string;
  number: number | null;
  items: OrcamentoItem[];
  subtotal: number;
  discount: number;
  total: number;
  validUntil: string;
  status: string;
  notes: string | null;
  createdAt: string;
  client: { id: string; name: string; phone: string };
  sale: { id: string; number: number; status: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  APROVADO: 'bg-blue-100 text-blue-800',
  CONVERTIDO: 'bg-green-100 text-green-800',
  EXPIRADO: 'bg-gray-100 text-gray-800',
  RECUSADO: 'bg-red-100 text-red-800',
};

export default function OrcamentoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [orcamento, setOrcamento] = useState<OrcamentoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [refusing, setRefusing] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/v1/orcamentos/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setOrcamento(json.data);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  const handleConvert = async () => {
    if (!confirm('Converter este orcamento em venda? A venda sera confirmada automaticamente.')) return;

    setConverting(true);
    try {
      const res = await fetch(`/api/v1/orcamentos/${params.id}/converter`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        toast.success('Orcamento convertido em venda!');
        router.push(`/vendas/${json.data.id}`);
      } else {
        const json = await res.json();
        toast.error(json.error || 'Erro ao converter');
      }
    } finally {
      setConverting(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const res = await fetch(`/api/v1/orcamentos/${params.id}/duplicar`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        toast.success('Orcamento duplicado!');
        router.push(`/vendas/orcamentos/${json.data.id}`);
      } else {
        const json = await res.json();
        toast.error(json.error || 'Erro ao duplicar');
      }
    } finally {
      setDuplicating(false);
    }
  };

  const handleRefuse = async () => {
    if (!confirm('Tem certeza que deseja recusar este orcamento?')) return;

    setRefusing(true);
    try {
      const res = await fetch(`/api/v1/orcamentos/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RECUSADO' }),
      });
      if (res.ok) {
        const json = await res.json();
        setOrcamento({ ...orcamento!, ...json.data });
        toast.success('Orcamento recusado');
      } else {
        const json = await res.json();
        toast.error(json.error || 'Erro ao recusar');
      }
    } finally {
      setRefusing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="h-40 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">Orcamento nao encontrado</h1>
        <Button asChild>
          <Link href="/vendas/orcamentos">Voltar</Link>
        </Button>
      </div>
    );
  }

  const items = orcamento.items as OrcamentoItem[];
  const dateStr = new Date(orcamento.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const validStr = new Date(orcamento.validUntil).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const canConvert = orcamento.status === 'PENDENTE' || orcamento.status === 'APROVADO';

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vendas/orcamentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">
          {orcamento.number ? `Orcamento #${orcamento.number}` : 'Orcamento'}
        </h1>
        <Badge className={STATUS_COLORS[orcamento.status]}>{orcamento.status}</Badge>
      </div>

      {/* Status banners */}
      {orcamento.status === 'CONVERTIDO' && orcamento.sale && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-3 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div className="flex-1">
              <p className="font-semibold text-green-800">Convertido em venda!</p>
              <p className="text-sm text-green-700">
                Venda #{orcamento.sale.number}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/vendas/${orcamento.sale.id}`}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver Venda
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {orcamento.status === 'EXPIRADO' && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="py-3 flex items-center gap-3">
            <Clock className="h-6 w-6 text-gray-600" />
            <div>
              <p className="font-semibold text-gray-800">Orcamento expirado</p>
              <p className="text-sm text-gray-600">Validade: {validStr}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {orcamento.status === 'RECUSADO' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-3 flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Orcamento recusado</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quote info */}
      <Card>
        <CardContent className="py-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Data</span>
            <span>{dateStr}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cliente</span>
            <span>{orcamento.client.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valido ate</span>
            <span>{validStr}</span>
          </div>
          {orcamento.notes && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Obs</span>
              <span className="text-right max-w-[60%]">{orcamento.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Itens ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="py-0 pb-3 space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground ml-1">
                  x{item.quantity} ({formatCurrency(item.unitPrice)})
                </span>
              </div>
              <span className="font-medium">{formatCurrency(item.total)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="py-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(orcamento.subtotal)}</span>
          </div>
          {orcamento.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Desconto</span>
              <span className="text-red-600">-{formatCurrency(orcamento.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-1">
            <span>Total</span>
            <span>{formatCurrency(orcamento.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {canConvert && (
          <Button
            className="w-full h-12 text-base"
            size="lg"
            onClick={handleConvert}
            disabled={converting}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {converting ? 'Convertendo...' : 'Converter em Venda'}
          </Button>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDuplicate}
            disabled={duplicating}
          >
            <Copy className="h-4 w-4 mr-1" />
            {duplicating ? 'Duplicando...' : 'Duplicar'}
          </Button>
          {orcamento.status === 'PENDENTE' && (
            <Button
              variant="outline"
              className="text-red-600"
              onClick={handleRefuse}
              disabled={refusing}
            >
              {refusing ? 'Recusando...' : 'Recusar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
