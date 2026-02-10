import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function FiscalAjudaPage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl">
      <Link href="/ajuda" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Voltar para Ajuda
      </Link>

      <h1 className="text-xl font-bold flex items-center gap-2">
        <FileText className="h-5 w-5" /> Fiscal
      </h1>

      <p className="text-muted-foreground">
        Emita notas fiscais diretamente pelo ERPsb. O sistema suporta NFe, NFSe e NFCe, e ja esta preparado para a reforma tributaria (CBS/IBS 2026).
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tipos de nota fiscal</h2>
        <div className="space-y-2">
          <Card className="p-3">
            <p className="text-sm"><strong>NFe (Nota Fiscal Eletronica):</strong> Para venda de produtos (mercadorias). Obrigatoria para comercio.</p>
          </Card>
          <Card className="p-3">
            <p className="text-sm"><strong>NFSe (Nota Fiscal de Servico):</strong> Para prestacao de servicos. Emissao via NFSe Nacional.</p>
          </Card>
          <Card className="p-3">
            <p className="text-sm"><strong>NFCe (Nota Fiscal do Consumidor):</strong> Para vendas ao consumidor final no varejo (substitui o cupom fiscal).</p>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Configuracao inicial</h2>
        <p>
          Antes de emitir notas, voce precisa configurar:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Dados fiscais da empresa (CNPJ, Inscricao Estadual, regime tributario)</li>
          <li>Certificado digital A1 (arquivo .pfx)</li>
          <li>Ambiente: homologacao (testes) ou producao</li>
        </ol>
        <Card className="p-3 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm"><strong>Importante:</strong> Comece em &quot;homologacao&quot; para testar sem valor fiscal. Mude para &quot;producao&quot; quando estiver tudo certo.</p>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Emitindo uma nota</h2>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Acesse Fiscal e clique em &quot;Emitir nota&quot;</li>
          <li>Selecione o tipo (NFe, NFSe ou NFCe)</li>
          <li>Preencha os dados (ou vincule a uma venda existente)</li>
          <li>Confirme e aguarde o processamento</li>
          <li>Acompanhe o status (processando, autorizada, rejeitada)</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Reforma tributaria (CBS/IBS)</h2>
        <p>
          O ERPsb ja inclui os campos para CBS e IBS nos documentos fiscais, preparando seu negocio para a transicao que comeca em 2026.
        </p>
      </section>

      <div className="pt-4">
        <Link href="/fiscal" className="text-sm text-primary hover:underline">
          Ir para Fiscal →
        </Link>
      </div>
    </div>
  );
}
