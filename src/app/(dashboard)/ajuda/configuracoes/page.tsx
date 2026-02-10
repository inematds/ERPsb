import Link from 'next/link';
import { Settings, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ConfiguracoesAjudaPage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl">
      <Link href="/ajuda" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Voltar para Ajuda
      </Link>

      <h1 className="text-xl font-bold flex items-center gap-2">
        <Settings className="h-5 w-5" /> Configuracoes
      </h1>

      <p className="text-muted-foreground">
        Personalize o ERPsb para o seu negocio. Configure formas de pagamento, lembretes e dados da empresa.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Formas de pagamento</h2>
        <p>
          Gerencie as formas de pagamento aceitas. Para cada forma, voce pode definir:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Nome (ex: PIX, Dinheiro, Credito Visa)</li>
          <li>Taxa percentual (ex: 2% para credito)</li>
          <li>Se esta ativa ou inativa</li>
        </ul>
        <Card className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <p className="text-sm"><strong>Dica:</strong> A taxa do cartao e descontada automaticamente no calculo do valor liquido da venda.</p>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Lembretes automaticos</h2>
        <p>
          Configure quando o sistema deve enviar lembretes de cobranca via WhatsApp:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Quantos dias antes do vencimento avisar</li>
          <li>Se deve avisar no dia do vencimento</li>
          <li>Se deve avisar apos o vencimento</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Dados da empresa</h2>
        <p>
          Mantenha os dados da sua empresa atualizados. Esses dados sao usados nas notas fiscais, orcamentos e cobrancas:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Razao social / nome fantasia</li>
          <li>CNPJ / CPF</li>
          <li>Endereco completo</li>
          <li>Telefone e e-mail</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Configuracao fiscal</h2>
        <p>
          Para emitir notas fiscais, configure:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Regime tributario (Simples Nacional, MEI, etc.)</li>
          <li>Inscricao Estadual / Municipal</li>
          <li>Certificado digital A1</li>
          <li>Ambiente (homologacao ou producao)</li>
        </ul>
      </section>

      <div className="pt-4">
        <Link href="/configuracoes" className="text-sm text-primary hover:underline">
          Ir para Configuracoes →
        </Link>
      </div>
    </div>
  );
}
