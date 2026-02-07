'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ShoppingCart, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const FAB_ACTIONS = [
  {
    href: '/vendas/nova',
    label: 'Nova Venda',
    icon: ShoppingCart,
  },
  {
    href: '/financeiro/contas-receber?new=true',
    label: 'Nova Cobranca',
    icon: ArrowDownCircle,
  },
  {
    href: '/financeiro/contas-pagar?new=true',
    label: 'Nova Despesa',
    icon: ArrowUpCircle,
  },
] as const;

export function Fab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
            <Plus className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle>Acao rapida</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {FAB_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.href}
                  variant="outline"
                  className="w-full justify-start gap-3 h-12 text-base"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link href={action.href}>
                    <Icon className="h-5 w-5" />
                    {action.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
