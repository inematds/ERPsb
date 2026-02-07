'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QrCode, Copy, Share2, RefreshCw, XCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface PixChargeDetail {
  id: string;
  externalId: string | null;
  amount: number;
  qrCode: string | null;
  qrCodeText: string | null;
  paymentLink: string | null;
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
    case 'PENDING': return 'Aguardando Pagamento';
    case 'EXPIRED': return 'Expirado';
    case 'CANCELLED': return 'Cancelado';
    default: return status;
  }
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR');
}

export default function PixChargeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [charge, setCharge] = useState<PixChargeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchCharge = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/pix/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setCharge(json.data);
      } else {
        toast.error('Cobranca nao encontrada');
        router.push('/financeiro/pix');
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchCharge();
  }, [fetchCharge]);

  // Auto-refresh for pending charges every 10 seconds
  useEffect(() => {
    if (charge?.status !== 'PENDING') return;
    const interval = setInterval(() => {
      handleCheckStatus(true);
    }, 10000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge?.status]);

  const handleCheckStatus = async (silent = false) => {
    if (!silent) setIsChecking(true);
    try {
      const res = await fetch(`/api/v1/pix/${params.id}/status`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setCharge(json.data);
        if (!silent && json.data.status === 'PAID') {
          toast.success('Pagamento confirmado!');
        } else if (!silent && json.data.status === 'PENDING') {
          toast.info('Pagamento ainda pendente');
        }
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/v1/pix/${params.id}/cancelar`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setCharge(json.data);
        toast.success('Cobranca cancelada');
      } else {
        toast.error('Erro ao cancelar cobranca');
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCopyPixCode = async () => {
    if (!charge?.qrCodeText) return;
    try {
      await navigator.clipboard.writeText(charge.qrCodeText);
      toast.success('Codigo PIX copiado!');
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleShare = async () => {
    if (!charge) return;
    const text = charge.qrCodeText
      ? `Cobranca PIX: ${formatCurrency(charge.amount)}\n\nCodigo PIX:\n${charge.qrCodeText}`
      : `Cobranca PIX: ${formatCurrency(charge.amount)}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Cobranca PIX', text });
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('Dados copiados para compartilhar');
      } catch {
        toast.error('Erro ao compartilhar');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">Cobranca PIX</h1>
        <ListSkeleton />
      </div>
    );
  }

  if (!charge) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/financeiro/pix')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Cobranca PIX</h1>
      </div>

      {/* Status Banner */}
      <Card className={`p-4 ${
        charge.status === 'PAID' ? 'bg-green-50 border-green-200' :
        charge.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200' :
        charge.status === 'EXPIRED' ? 'bg-red-50 border-red-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <Badge className={`${getStatusColor(charge.status)} mb-2`}>
              {getStatusLabel(charge.status)}
            </Badge>
            <p className="text-2xl font-bold">{formatCurrency(charge.amount)}</p>
          </div>
          <QrCode className="h-8 w-8 text-muted-foreground" />
        </div>
      </Card>

      {/* QR Code */}
      {charge.status === 'PENDING' && charge.qrCode && (
        <Card className="p-6 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Escaneie o QR code com o app do banco
          </p>
          <div className="bg-white p-4 rounded-lg border">
            <img
              src={`data:image/png;base64,${charge.qrCode}`}
              alt="QR Code PIX"
              className="w-64 h-64 object-contain"
            />
          </div>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyPixCode}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar codigo
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
          {charge.paymentLink && (
            <a
              href={charge.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Abrir link de pagamento
            </a>
          )}
        </Card>
      )}

      {/* Payment confirmed */}
      {charge.status === 'PAID' && (
        <Card className="p-4 bg-green-50 border-green-200 text-center">
          <p className="font-medium text-green-800">Pagamento confirmado!</p>
          {charge.paidAt && (
            <p className="text-sm text-green-600 mt-1">
              Recebido em {formatDateTime(charge.paidAt)}
            </p>
          )}
        </Card>
      )}

      {/* Details */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Detalhes</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Descricao</span>
            <span>{charge.contaReceber.description}</span>
          </div>
          {charge.contaReceber.client && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <span>{charge.contaReceber.client.name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Criado em</span>
            <span>{formatDateTime(charge.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expira em</span>
            <span>{formatDateTime(charge.expiresAt)}</span>
          </div>
          {charge.externalId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Externo</span>
              <span className="text-xs font-mono">{charge.externalId}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {charge.status === 'PENDING' && (
          <>
            <Button
              variant="outline"
              onClick={() => handleCheckStatus(false)}
              disabled={isChecking}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Verificando...' : 'Verificar pagamento'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {isCancelling ? 'Cancelando...' : 'Cancelar cobranca'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
