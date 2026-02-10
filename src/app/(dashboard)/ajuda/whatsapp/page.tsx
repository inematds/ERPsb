import Link from 'next/link';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function WhatsAppAjudaPage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl">
      <Link href="/ajuda" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Voltar para Ajuda
      </Link>

      <h1 className="text-xl font-bold flex items-center gap-2">
        <MessageCircle className="h-5 w-5" /> WhatsApp
      </h1>

      <p className="text-muted-foreground">
        Use o WhatsApp integrado para enviar cobrancas, orcamentos e lembretes automaticos para seus clientes.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Envio de mensagens</h2>
        <p>
          O ERPsb envia mensagens pelo WhatsApp Business API em situacoes como:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Cobranca PIX com link/QR code</li>
          <li>Envio de orcamento para aprovacao</li>
          <li>Notificacao de nota fiscal emitida</li>
          <li>Lembretes de contas a vencer</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Templates de mensagem</h2>
        <p>
          As mensagens seguem templates pre-aprovados pelo WhatsApp Business. Eles incluem os dados relevantes (valor, vencimento, link de pagamento) automaticamente.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Lembretes automaticos</h2>
        <p>
          Configure lembretes para avisar clientes sobre contas a vencer. O sistema envia automaticamente nos dias que voce definir.
        </p>
        <Card className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <p className="text-sm"><strong>Exemplo:</strong> Enviar lembrete 3 dias antes do vencimento e no dia do vencimento.</p>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Historico</h2>
        <p>
          Todas as mensagens enviadas ficam registradas no sistema, com status de entrega (enviado, entregue, lido).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Requisitos</h2>
        <Card className="p-3 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm"><strong>Importante:</strong> A integracao com WhatsApp requer uma conta WhatsApp Business API configurada. Consulte as configuracoes para ativar.</p>
        </Card>
      </section>

      <div className="pt-4">
        <Link href="/configuracoes" className="text-sm text-primary hover:underline">
          Ir para Configuracoes →
        </Link>
      </div>
    </div>
  );
}
