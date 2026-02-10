import Link from 'next/link';
import { Rocket, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PrimeirosPassosPage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl">
      <Link href="/ajuda" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Voltar para Ajuda
      </Link>

      <h1 className="text-xl font-bold flex items-center gap-2">
        <Rocket className="h-5 w-5" /> Primeiros Passos
      </h1>

      <p className="text-muted-foreground">
        Bem-vindo ao ERPsb! Este guia vai te ajudar a configurar sua conta e comecar a usar o sistema em poucos minutos.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. Login</h2>
        <p>
          Acesse o ERPsb e faca login com sua conta Google. E simples e seguro - nao precisa criar senha.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. Criar sua empresa</h2>
        <p>
          Na primeira vez que acessar, o sistema vai te guiar por um wizard rapido de 5 perguntas:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Nome da empresa</li>
          <li>Tipo de negocio (comercio, servicos, etc.)</li>
          <li>Se tem CNPJ ou nao</li>
          <li>Faturamento mensal aproximado</li>
          <li>O que mais precisa controlar</li>
        </ul>
        <Card className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <p className="text-sm"><strong>Dica:</strong> Voce pode usar o ERPsb mesmo sem CNPJ! O sistema funciona no &quot;modo informal&quot; para quem ainda nao formalizou.</p>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">3. Primeiros cadastros</h2>
        <p>
          Comece cadastrando seus produtos e clientes mais frequentes. Nao precisa cadastrar tudo de uma vez - va adicionando conforme usar o sistema.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">4. Primeira venda</h2>
        <p>
          Va em <strong>Vendas</strong>, selecione o cliente e os produtos, escolha a forma de pagamento e confirme. Pronto! Sua primeira venda esta registrada e o financeiro ja foi atualizado automaticamente.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">5. Acompanhe pelo Dashboard</h2>
        <p>
          O Dashboard mostra um resumo visual do seu negocio com cores de semaforo: verde (tudo bem), amarelo (atencao) e vermelho (cuidado). Acesse diariamente para ter controle total.
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
