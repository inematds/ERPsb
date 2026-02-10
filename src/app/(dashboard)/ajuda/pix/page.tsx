import Link from 'next/link';
import { QrCode, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PixAjudaPage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl">
      <Link href="/ajuda" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Voltar para Ajuda
      </Link>

      <h1 className="text-xl font-bold flex items-center gap-2">
        <QrCode className="h-5 w-5" /> PIX
      </h1>

      <p className="text-muted-foreground">
        Cobre seus clientes via PIX com QR code gerado automaticamente. Quando o cliente paga, o sistema da baixa sozinho.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Como funciona a cobranca PIX</h2>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Ao criar uma venda com pagamento PIX, um QR code e gerado</li>
          <li>Envie o QR code para o cliente (pelo WhatsApp ou mostrando na tela)</li>
          <li>O cliente paga escaneando o QR code com o app do banco</li>
          <li>O pagamento e confirmado automaticamente por webhook</li>
          <li>A conta a receber e baixada automaticamente</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Conciliacao automatica</h2>
        <p>
          O ERPsb usa a API do Mercado Pago para receber notificacoes de pagamento em tempo real. Quando o PIX e pago:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>O status da cobranca muda para &quot;pago&quot;</li>
          <li>A conta a receber vinculada e baixada</li>
          <li>O saldo no Dashboard e atualizado</li>
        </ul>
        <Card className="p-3 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <p className="text-sm"><strong>Sem trabalho manual:</strong> Voce nao precisa conferir se o PIX caiu. O sistema faz isso automaticamente.</p>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Cancelar cobranca</h2>
        <p>
          Se precisar cancelar uma cobranca PIX (por erro ou desistencia), basta acessar a cobranca e clicar em cancelar. Cobrancas ja pagas nao podem ser canceladas.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Requisitos</h2>
        <Card className="p-3 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm"><strong>Importante:</strong> Para usar cobranca PIX, e necessario configurar a integracao com o Mercado Pago nas configuracoes do sistema.</p>
        </Card>
      </section>

      <div className="pt-4">
        <Link href="/financeiro" className="text-sm text-primary hover:underline">
          Ir para Financeiro →
        </Link>
      </div>
    </div>
  );
}
