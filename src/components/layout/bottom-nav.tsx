'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, ShoppingCart, FileText, Menu } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/vendas/nova', label: 'Vender', icon: ShoppingCart },
  { href: '/fiscal', label: 'Fiscal', icon: FileText },
  { href: '/configuracoes', label: 'Menu', icon: Menu },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex h-16 items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
