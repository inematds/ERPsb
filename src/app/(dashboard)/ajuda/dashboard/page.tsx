import Link from 'next/link';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function DashboardAjudaPage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl">
      <Link href="/ajuda" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Voltar para Ajuda
      </Link>

      <h1 className="text-xl font-bold flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5" /> Dashboard
      </h1>

      <p className="text-muted-foreground">
        O Dashboard e a tela principal do ERPsb. Ele mostra um resumo completo da saude financeira do seu negocio.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Semaforo financeiro</h2>
        <p>
          O semaforo indica a situacao geral do seu negocio com cores:
        </p>
        <div className="space-y-2">
          <Card className="p-3 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <p className="text-sm"><strong>Verde:</strong> Tudo bem! Saldo positivo, contas em dia.</p>
          </Card>
          <Card className="p-3 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <p className="text-sm"><strong>Amarelo:</strong> Atencao! Contas vencendo em breve ou saldo apertado.</p>
          </Card>
          <Card className="p-3 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <p className="text-sm"><strong>Vermelho:</strong> Cuidado! Contas vencidas ou saldo negativo.</p>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Saldo e resumo</h2>
        <p>
          Veja o saldo atual da sua empresa e um resumo de receitas e despesas de hoje, da semana e do mes. Tudo atualizado em tempo real.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contas pendentes</h2>
        <p>
          Lista as proximas contas a pagar e a receber, organizadas por data de vencimento. Assim voce nunca esquece um pagamento.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Grafico de fluxo de caixa</h2>
        <p>
          O grafico mostra as entradas e saidas dos ultimos 30 dias, ajudando a visualizar tendencias e planejar os proximos dias.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Alertas proativos</h2>
        <p>
          O sistema gera alertas automaticos quando identifica situacoes importantes, como:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Contas vencidas ou prestes a vencer</li>
          <li>Estoque abaixo do minimo</li>
          <li>Queda nas vendas</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">&quot;Quanto posso retirar?&quot;</h2>
        <p>
          O Dashboard calcula automaticamente quanto voce pode retirar com seguranca, considerando o saldo atual menos as contas a pagar pendentes.
        </p>
      </section>

      <div className="pt-4">
        <Link href="/" className="text-sm text-primary hover:underline">
          Ir para o Dashboard →
        </Link>
      </div>
    </div>
  );
}
