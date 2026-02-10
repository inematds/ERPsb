import Link from 'next/link';
import {
  HelpCircle,
  Rocket,
  LayoutDashboard,
  Users,
  Wallet,
  ShoppingCart,
  QrCode,
  FileText,
  Package,
  MessageCircle,
  Settings,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const SECTIONS = [
  {
    href: '/ajuda/primeiros-passos',
    label: 'Primeiros Passos',
    description: 'Como comecar a usar o ERPsb',
    icon: Rocket,
  },
  {
    href: '/ajuda/dashboard',
    label: 'Dashboard',
    description: 'Semaforo, saldo, alertas e graficos',
    icon: LayoutDashboard,
  },
  {
    href: '/ajuda/cadastros',
    label: 'Cadastros',
    description: 'Clientes, fornecedores e produtos',
    icon: Users,
  },
  {
    href: '/ajuda/financeiro',
    label: 'Financeiro',
    description: 'Contas a pagar, receber e fluxo de caixa',
    icon: Wallet,
  },
  {
    href: '/ajuda/vendas',
    label: 'Vendas',
    description: 'Venda rapida e orcamentos',
    icon: ShoppingCart,
  },
  {
    href: '/ajuda/pix',
    label: 'PIX',
    description: 'Cobranca PIX com QR code',
    icon: QrCode,
  },
  {
    href: '/ajuda/fiscal',
    label: 'Fiscal',
    description: 'NFe, NFSe, NFCe e certificado digital',
    icon: FileText,
  },
  {
    href: '/ajuda/estoque',
    label: 'Estoque',
    description: 'Entradas, saidas e alertas de minimo',
    icon: Package,
  },
  {
    href: '/ajuda/whatsapp',
    label: 'WhatsApp',
    description: 'Mensagens, templates e lembretes',
    icon: MessageCircle,
  },
  {
    href: '/ajuda/configuracoes',
    label: 'Configuracoes',
    description: 'Formas de pagamento, lembretes e dados da empresa',
    icon: Settings,
  },
];

export default function AjudaPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <HelpCircle className="h-5 w-5" /> Ajuda
      </h1>
      <p className="text-sm text-muted-foreground">
        Aprenda a usar cada modulo do ERPsb. Clique em um topico para ver a documentacao completa.
      </p>

      <div className="grid gap-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{section.label}</p>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
