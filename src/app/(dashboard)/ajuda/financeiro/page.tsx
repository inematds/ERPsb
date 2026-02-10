import Link from 'next/link';
import { Wallet, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function FinanceiroAjudaPage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl">
      <Link href="/ajuda" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Voltar para Ajuda
      </Link>

      <h1 className="text-xl font-bold flex items-center gap-2">
        <Wallet className="h-5 w-5" /> Financeiro
      </h1>

      <p className="text-muted-foreground">
        O modulo financeiro e o coracao do ERPsb. Aqui voce controla tudo que entra e sai do seu caixa.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contas a pagar</h2>
        <p>
          Registre todas as despesas do negocio: aluguel, fornecedores, contas de consumo, etc. O sistema avisa quando uma conta esta vencendo.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Descricao, valor, data de vencimento</li>
          <li>Vinculo com fornecedor (opcional)</li>
          <li>Status: pendente, pago ou vencido</li>
          <li>Baixa manual com registro da data de pagamento</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contas a receber</h2>
        <p>
          Acompanhe tudo que seus clientes devem. As contas a receber sao criadas automaticamente ao registrar uma venda, mas voce tambem pode criar manualmente.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Vinculo automatico com vendas</li>
          <li>Cobranca via PIX com QR code</li>
          <li>Baixa automatica ao receber pagamento PIX</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Fluxo de caixa</h2>
        <p>
          Veja o historico de entradas e saidas em um grafico de 30 dias. Ideal para identificar periodos de maior e menor movimento.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">&quot;Quanto posso retirar?&quot;</h2>
        <p>
          Essa e a pergunta que todo empreendedor faz. O ERPsb calcula automaticamente:
        </p>
        <Card className="p-3 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <p className="text-sm"><strong>Saldo disponivel para retirada</strong> = Saldo atual - Contas a pagar pendentes</p>
        </Card>
        <p className="text-sm text-muted-foreground">
          Assim voce sabe exatamente quanto pode tirar sem comprometer o pagamento das contas.
        </p>
      </section>

      <div className="pt-4">
        <Link href="/financeiro" className="text-sm text-primary hover:underline">
          Ir para Financeiro →
        </Link>
      </div>
    </div>
  );
}
