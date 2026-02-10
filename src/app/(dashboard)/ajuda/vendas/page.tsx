import Link from 'next/link';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function VendasAjudaPage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl">
      <Link href="/ajuda" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Voltar para Ajuda
      </Link>

      <h1 className="text-xl font-bold flex items-center gap-2">
        <ShoppingCart className="h-5 w-5" /> Vendas
      </h1>

      <p className="text-muted-foreground">
        Registre vendas em poucos segundos. O sistema cuida automaticamente do financeiro e do estoque.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Venda rapida</h2>
        <p>
          O fluxo de venda foi pensado para ser o mais rapido possivel:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Selecione o cliente (ou venda sem cliente)</li>
          <li>Adicione os produtos e quantidades</li>
          <li>Escolha a forma de pagamento</li>
          <li>Confirme a venda</li>
        </ol>
        <Card className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <p className="text-sm"><strong>Dica:</strong> Ao confirmar, o sistema gera automaticamente a conta a receber e da baixa no estoque dos produtos.</p>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Orcamentos</h2>
        <p>
          Crie orcamentos para enviar ao cliente antes de fechar a venda. Quando o cliente aceitar, converta em venda com um clique.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Criar orcamento com produtos e precos</li>
          <li>Enviar pelo WhatsApp</li>
          <li>Converter em venda em 1 clique</li>
          <li>Duplicar orcamento para reutilizar</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">O que acontece ao confirmar uma venda?</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Uma conta a receber e criada automaticamente</li>
          <li>O estoque dos produtos e atualizado (se controlar estoque)</li>
          <li>Se o pagamento for PIX, uma cobranca com QR code pode ser gerada</li>
          <li>Se o pagamento for a vista (dinheiro/debito), a conta ja e marcada como recebida</li>
        </ul>
      </section>

      <div className="pt-4">
        <Link href="/vendas/nova" className="text-sm text-primary hover:underline">
          Ir para Vendas →
        </Link>
      </div>
    </div>
  );
}
