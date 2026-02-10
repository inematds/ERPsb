import Link from 'next/link';
import { Users, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function CadastrosAjudaPage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl">
      <Link href="/ajuda" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Voltar para Ajuda
      </Link>

      <h1 className="text-xl font-bold flex items-center gap-2">
        <Users className="h-5 w-5" /> Cadastros
      </h1>

      <p className="text-muted-foreground">
        Os cadastros sao a base do sistema. Aqui voce registra clientes, fornecedores e produtos que serao usados em vendas, compras e no financeiro.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Clientes</h2>
        <p>
          Cadastre os dados dos seus clientes para usar nas vendas e cobrancas. Os campos sao progressivos - comece apenas com nome e telefone, e complete os demais dados depois.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Nome e telefone (obrigatorios)</li>
          <li>E-mail, CPF/CNPJ, endereco (opcionais)</li>
          <li>Busca rapida por nome ou telefone</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Fornecedores</h2>
        <p>
          Registre seus fornecedores para vincular as contas a pagar. Assim voce sabe exatamente quanto deve para cada um.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Razao social / nome fantasia</li>
          <li>CNPJ, telefone, e-mail</li>
          <li>Vinculo automatico com contas a pagar</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Produtos e servicos</h2>
        <p>
          Cadastre seus produtos e servicos com preco de venda. Eles aparecem na hora de fazer uma venda ou orcamento.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Nome, descricao, preco de venda</li>
          <li>Preco de custo (para calculo de margem)</li>
          <li>Controle de estoque (opcional)</li>
          <li>Codigo de barras / SKU (opcional)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Formas de pagamento</h2>
        <p>
          Configure as formas de pagamento aceitas no seu negocio (PIX, dinheiro, debito, credito). Para cartao de credito, voce pode definir a taxa cobrada pela maquininha.
        </p>
        <Card className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <p className="text-sm"><strong>Dica:</strong> As formas de pagamento ja vem pre-configuradas (PIX, Dinheiro, Debito, Credito). Voce so precisa ajustar se quiser mudar as taxas.</p>
        </Card>
      </section>

      <div className="pt-4">
        <Link href="/cadastros" className="text-sm text-primary hover:underline">
          Ir para Cadastros →
        </Link>
      </div>
    </div>
  );
}
