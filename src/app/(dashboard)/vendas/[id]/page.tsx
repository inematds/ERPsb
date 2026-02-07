'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Plus, FileText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface VendaItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface VendaDetail {
  id: string;
  number: number | null;
  items: VendaItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  notes: string | null;
  createdAt: string;
  client: { id: string; name: string; phone?: string } | null;
  paymentMethod: { id: string; name: string; type: string };
  contasReceber: { id: string; status: string; amount: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  RASCUNHO: 'bg-gray-100 text-gray-800',
  CONFIRMADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
};

export default function VendaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [venda, setVenda] = useState<VendaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [emittingNFe, setEmittingNFe] = useState(false);
  const [emittingNFSe, setEmittingNFSe] = useState(false);
  const [emittingNFCe, setEmittingNFCe] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/v1/vendas/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setVenda(json.data);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar esta venda?')) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/v1/vendas/${params.id}/cancelar`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setVenda(json.data);
        toast.success('Venda cancelada');
      } else {
        const json = await res.json();
        toast.error(json.error || 'Erro ao cancelar');
      }
    } finally {
      setCancelling(false);
    }
  };

  const handleEmitirNFe = async () => {
    setEmittingNFe(true);
    try {
      const res = await fetch('/api/v1/notas-fiscais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId: params.id }),
      });
      const json = await res.json();
      if (res.ok) {
        const status = json.data?.status;
        if (status === 'AUTORIZADA') {
          toast.success('NFe emitida com sucesso!');
        } else if (status === 'REJEITADA') {
          toast.error(`NFe rejeitada: ${json.data?.errorMessage ?? 'Erro desconhecido'}`);
        } else {
          toast.info('NFe em processamento...');
        }
      } else {
        toast.error(json.error || 'Erro ao emitir NFe');
      }
    } catch {
      toast.error('Erro ao emitir NFe');
    } finally {
      setEmittingNFe(false);
    }
  };

  const handleEmitirNFSe = async () => {
    setEmittingNFSe(true);
    try {
      const res = await fetch('/api/v1/notas-fiscais/emitir-nfse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId: params.id }),
      });
      const json = await res.json();
      if (res.ok) {
        const status = json.data?.status;
        if (status === 'AUTORIZADA') {
          toast.success('NFSe emitida com sucesso!');
        } else if (status === 'REJEITADA') {
          toast.error(`NFSe rejeitada: ${json.data?.errorMessage ?? 'Erro desconhecido'}`);
        } else {
          toast.info('NFSe em processamento...');
        }
      } else {
        toast.error(json.error || 'Erro ao emitir NFSe');
      }
    } catch {
      toast.error('Erro ao emitir NFSe');
    } finally {
      setEmittingNFSe(false);
    }
  };

  const handleEmitirNFCe = async () => {
    setEmittingNFCe(true);
    try {
      const res = await fetch('/api/v1/notas-fiscais/emitir-nfce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId: params.id }),
      });
      const json = await res.json();
      if (res.ok) {
        const status = json.data?.status;
        if (status === 'AUTORIZADA') {
          toast.success('NFCe emitida com sucesso!');
        } else if (status === 'REJEITADA') {
          toast.error(`NFCe rejeitada: ${json.data?.errorMessage ?? 'Erro desconhecido'}`);
        } else {
          toast.info('NFCe em processamento...');
        }
      } else {
        toast.error(json.error || 'Erro ao emitir NFCe');
      }
    } catch {
      toast.error('Erro ao emitir NFCe');
    } finally {
      setEmittingNFCe(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!venda?.client?.phone) {
      toast.error('Cliente sem telefone cadastrado');
      return;
    }
    setSendingWhatsApp(true);
    try {
      const res = await fetch('/api/v1/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: venda.client.phone,
          clientId: venda.client.id,
          templateId: 'cobranca_pix',
          templateVars: {
            nome: venda.client.name,
            valor: `R$ ${(venda.total / 100).toFixed(2).replace('.', ',')}`,
            link_pix: '',
          },
        }),
      });
      if (res.ok) {
        toast.success('Mensagem enviada pelo WhatsApp');
      } else {
        const json = await res.json();
        toast.error(json.error || 'Erro ao enviar WhatsApp');
      }
    } catch {
      toast.error('Erro ao enviar WhatsApp');
    } finally {
      setSendingWhatsApp(false);
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

  if (!venda) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">Venda nao encontrada</h1>
        <Button asChild>
          <Link href="/vendas">Voltar</Link>
        </Button>
      </div>
    );
  }

  const items = venda.items as VendaItem[];
  const dateStr = new Date(venda.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vendas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">
          {venda.number ? `Venda #${venda.number}` : 'Venda (rascunho)'}
        </h1>
        <Badge className={STATUS_COLORS[venda.status]}>{venda.status}</Badge>
      </div>

      {/* Confirmation banner */}
      {venda.status === 'CONFIRMADA' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-3 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Venda confirmada!</p>
              <p className="text-sm text-green-700">Conta a receber gerada automaticamente.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {venda.status === 'CANCELADA' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-3 flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Venda cancelada</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sale info */}
      <Card>
        <CardContent className="py-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Data</span>
            <span>{dateStr}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cliente</span>
            <span>{venda.client?.name || 'Nao informado'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pagamento</span>
            <span>{venda.paymentMethod.name}</span>
          </div>
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
            <span>{formatCurrency(venda.subtotal)}</span>
          </div>
          {venda.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Desconto</span>
              <span className="text-red-600">-{formatCurrency(venda.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-1">
            <span>Total</span>
            <span>{formatCurrency(venda.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="flex-1" asChild>
          <Link href="/vendas/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
          </Link>
        </Button>
        {venda.status === 'CONFIRMADA' && (
          <>
            <Button
              variant="outline"
              onClick={handleEmitirNFe}
              disabled={emittingNFe}
            >
              <FileText className="h-4 w-4 mr-1" />
              {emittingNFe ? 'Emitindo...' : 'NFe'}
            </Button>
            <Button
              variant="outline"
              onClick={handleEmitirNFSe}
              disabled={emittingNFSe}
            >
              <FileText className="h-4 w-4 mr-1" />
              {emittingNFSe ? 'Emitindo...' : 'NFSe'}
            </Button>
            <Button
              variant="outline"
              onClick={handleEmitirNFCe}
              disabled={emittingNFCe}
            >
              <FileText className="h-4 w-4 mr-1" />
              {emittingNFCe ? 'Emitindo...' : 'NFCe'}
            </Button>
            {venda.client?.phone && (
              <Button
                variant="outline"
                className="text-green-600"
                onClick={handleSendWhatsApp}
                disabled={sendingWhatsApp}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {sendingWhatsApp ? 'Enviando...' : 'WhatsApp'}
              </Button>
            )}
            <Button
              variant="outline"
              className="text-red-600"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelando...' : 'Cancelar'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
