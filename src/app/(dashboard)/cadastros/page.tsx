import Link from 'next/link';
import { Users, Building2, Package, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PageHelp } from '@/components/shared/page-help';

const SECTIONS = [
  {
    href: '/cadastros/clientes',
    label: 'Clientes',
    description: 'Gerencie seus clientes e contatos',
    icon: Users,
  },
  {
    href: '/cadastros/fornecedores',
    label: 'Fornecedores',
    description: 'Cadastre e gerencie fornecedores',
    icon: Building2,
  },
  {
    href: '/cadastros/produtos',
    label: 'Produtos e Servicos',
    description: 'Catalogo de produtos e servicos',
    icon: Package,
  },
  {
    href: '/configuracoes/formas-pagamento',
    label: 'Formas de Pagamento',
    description: 'Configure as formas de pagamento aceitas',
    icon: CreditCard,
  },
];

export default function CadastrosPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5" /> Cadastros
        </h1>
        <PageHelp title="Cadastros" description="Gerencie seus clientes, fornecedores e produtos. Cadastros sao a base para vendas, financeiro e notas fiscais." helpHref="/ajuda/cadastros" />
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
