import Link from 'next/link';
import { Wallet, Receipt, HandCoins, QrCode } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PageHelp } from '@/components/shared/page-help';

const SECTIONS = [
  {
    href: '/financeiro/contas-pagar',
    label: 'Contas a Pagar',
    description: 'Gerencie suas despesas e pagamentos',
    icon: Receipt,
  },
  {
    href: '/financeiro/contas-receber',
    label: 'Contas a Receber',
    description: 'Acompanhe seus recebimentos',
    icon: HandCoins,
  },
  {
    href: '/financeiro/pix',
    label: 'Cobranças PIX',
    description: 'Gere e acompanhe cobranças via PIX',
    icon: QrCode,
  },
];

export default function FinanceiroPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wallet className="h-5 w-5" /> Financeiro
        </h1>
        <PageHelp title="Financeiro" description="Controle suas contas a pagar e receber. Acompanhe o fluxo de caixa e saiba quanto pode retirar." helpHref="/ajuda/financeiro" />
      </div>

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
