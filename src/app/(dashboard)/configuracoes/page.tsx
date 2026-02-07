'use client';

import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTenant } from '@/hooks/use-tenant';

export default function ConfiguracoesPage() {
  const { data: session } = useSession();
  const { activeTenantName, tenants, switchTenant } = useTenant();

  const user = session?.user;
  const initials = (user?.name ?? '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuracoes</h1>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Minha Empresa</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nome</span>
            <span className="font-medium">{activeTenantName ?? '-'}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Meu Perfil</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{user?.name ?? '-'}</p>
              <p className="text-muted-foreground">{user?.email ?? '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {tenants.length > 1 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Alternar Empresa</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {tenants.map((t) => (
              <button
                key={t.tenantId}
                onClick={() => !t.isActive && switchTenant(t.tenantId)}
                disabled={t.isActive}
                className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                  t.isActive
                    ? 'border-primary bg-primary/5 font-medium'
                    : 'hover:bg-muted'
                }`}
              >
                {t.name}
                {t.isActive && (
                  <span className="ml-2 text-xs text-muted-foreground">(ativa)</span>
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Sobre</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versao</span>
            <span>0.1.0</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Button
        variant="destructive"
        className="w-full"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        Sair da conta
      </Button>
    </div>
  );
}
