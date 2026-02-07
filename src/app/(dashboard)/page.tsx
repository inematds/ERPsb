import { Users, ShoppingCart, Wallet } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export default function DashboardPage() {
  // TODO: Check if tenant has data (clients, sales, accounts) to show semaforo dashboard
  // For now, show empty state with CTAs for first actions

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bem-vindo ao ERPsb</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comece configurando sua empresa com as acoes abaixo
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EmptyState
          icon={Users}
          title="Cadastre seu primeiro cliente"
          description="Adicione clientes para comecar a vender e controlar suas financas"
          actionLabel="Adicionar cliente"
          actionHref="/cadastros/clientes"
        />
        <EmptyState
          icon={ShoppingCart}
          title="Faca sua primeira venda"
          description="Registre vendas e acompanhe seu faturamento em tempo real"
          actionLabel="Nova venda"
          actionHref="/vendas/nova"
        />
        <EmptyState
          icon={Wallet}
          title="Registre uma conta a pagar"
          description="Controle suas despesas e saiba exatamente para onde vai seu dinheiro"
          actionLabel="Nova despesa"
          actionHref="/financeiro/contas-pagar"
        />
      </div>
    </div>
  );
}
