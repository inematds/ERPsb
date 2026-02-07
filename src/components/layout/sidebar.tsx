'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Wallet,
  ShoppingCart,
  FileText,
  Settings,
  Package,
  Users,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/vendas/nova', label: 'Vendas', icon: ShoppingCart },
  { href: '/fiscal', label: 'Fiscal', icon: FileText },
  { href: '/cadastros', label: 'Cadastros', icon: Users },
  { href: '/estoque', label: 'Estoque', icon: Package },
  { href: '/configuracoes', label: 'Configuracoes', icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-30 w-60 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center px-6 border-b">
        <Link href="/" className="text-xl font-bold">
          ERPsb
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
