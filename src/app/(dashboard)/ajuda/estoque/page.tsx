import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function EstoqueAjudaPage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl">
      <Link href="/ajuda" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Voltar para Ajuda
      </Link>

      <h1 className="text-xl font-bold flex items-center gap-2">
        <Package className="h-5 w-5" /> Estoque
      </h1>

      <p className="text-muted-foreground">
        Controle o estoque dos seus produtos de forma simples. Saiba exatamente o que tem disponivel e receba alertas quando um item estiver acabando.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Entradas</h2>
        <p>
          Registre a entrada de produtos quando receber mercadoria do fornecedor. A entrada aumenta o saldo em estoque do produto.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Saidas automaticas</h2>
        <p>
          Quando voce confirma uma venda, o estoque dos produtos vendidos e reduzido automaticamente. Nao precisa dar baixa manual.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Ajustes manuais</h2>
        <p>
          Perdeu ou encontrou produtos? Use o ajuste manual para corrigir o saldo do estoque. O sistema registra o motivo do ajuste no historico.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Alerta de estoque minimo</h2>
        <p>
          Defina uma quantidade minima para cada produto. Quando o estoque ficar abaixo desse limite, o sistema gera um alerta no Dashboard.
        </p>
        <Card className="p-3 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm"><strong>Exemplo:</strong> Se voce define o minimo de &quot;Camiseta P&quot; como 5 unidades, ao chegar em 4 ou menos o sistema avisa.</p>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Historico de movimentacoes</h2>
        <p>
          Consulte todas as entradas, saidas e ajustes de cada produto. Util para conferir divergencias e entender o que aconteceu com o estoque.
        </p>
      </section>

      <div className="pt-4">
        <Link href="/estoque" className="text-sm text-primary hover:underline">
          Ir para Estoque →
        </Link>
      </div>
    </div>
  );
}
