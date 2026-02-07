'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Bell, LogOut, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTenant } from '@/hooks/use-tenant';
import { useNotificationStore } from '@/stores/notification-store';

export function Header() {
  const { data: session } = useSession();
  const { activeTenantName } = useTenant();
  const notificationCount = useNotificationStore((s) => s.count);

  const userName = session?.user?.name ?? '';
  const userImage = session?.user?.image ?? '';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 lg:pl-64">
      <div className="font-semibold text-sm truncate max-w-[200px]">
        {activeTenantName ?? 'ERPsb'}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/notificacoes"
          className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] px-1 text-[10px] flex items-center justify-center"
            >
              {notificationCount > 99 ? '99+' : notificationCount}
            </Badge>
          )}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/configuracoes" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuracoes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
