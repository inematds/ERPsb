'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { toast } from 'sonner';

interface Cliente {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  document: string | null;
}

interface Meta {
  total: number;
  page: number;
  pageSize: number;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pageSize: 20 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showLgpdDialog, setShowLgpdDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fetchClientes = useCallback(async (searchTerm: string, page: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      params.set('page', String(page));
      params.set('pageSize', '20');

      const res = await fetch(`/api/v1/clientes?${params}`);
      if (res.ok) {
        const json = await res.json();
        setClientes(json.data);
        setMeta(json.meta);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClientes(search, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchClientes]);

  const handlePageChange = (newPage: number) => {
    fetchClientes(search, newPage);
  };

  const totalPages = Math.ceil(meta.total / meta.pageSize);

  const supportsContactPicker =
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    'ContactsManager' in window;

  const handleImportContacts = async () => {
    setShowLgpdDialog(false);

    if (!supportsContactPicker) {
      toast.error('Seu navegador nao suporta importacao de contatos. Use o Chrome no Android ou Safari no iOS.');
      return;
    }

    setIsImporting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      const contacts = await nav.contacts.select(['name', 'tel'], { multiple: true });

      if (!contacts || contacts.length === 0) {
        toast.info('Nenhum contato selecionado');
        return;
      }

      const mapped = contacts
        .filter((c: { name?: string[]; tel?: string[] }) => c.name?.[0] && c.tel?.[0])
        .map((c: { name: string[]; tel: string[] }) => ({
          name: c.name[0],
          phone: c.tel[0],
        }));

      if (mapped.length === 0) {
        toast.info('Nenhum contato valido encontrado');
        return;
      }

      const res = await fetch('/api/v1/clientes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: mapped }),
      });

      if (res.ok) {
        const json = await res.json();
        const { imported, duplicates } = json.data;
        toast.success(`${imported} contato${imported !== 1 ? 's' : ''} importado${imported !== 1 ? 's' : ''}${duplicates > 0 ? `, ${duplicates} duplicado${duplicates !== 1 ? 's' : ''} ignorado${duplicates !== 1 ? 's' : ''}` : ''}`);
        fetchClientes(search, 1);
      } else {
        toast.error('Erro ao importar contatos');
      }
    } catch {
      toast.error('Importacao cancelada ou nao suportada');
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading && clientes.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Clientes</h1>
        </div>
        <ListSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Clientes</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLgpdDialog(true)}
            disabled={isImporting}
          >
            <Upload className="h-4 w-4 mr-1" />
            {isImporting ? 'Importando...' : 'Importar'}
          </Button>
          <Button asChild size="sm">
            <Link href="/cadastros/clientes/novo">
              <Plus className="h-4 w-4 mr-1" />
              Novo Cliente
            </Link>
          </Button>
        </div>
      </div>

      {meta.total > 0 || search ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <ListSkeleton />
          ) : clientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cliente encontrado para &quot;{search}&quot;
            </div>
          ) : (
            <div className="space-y-2">
              {clientes.map((cliente) => (
                <Link key={cliente.id} href={`/cadastros/clientes/${cliente.id}`}>
                  <Card className="p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{cliente.name}</p>
                        <p className="text-sm text-muted-foreground">{cliente.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {cliente.document && (
                          <Badge variant="secondary" className="text-xs">
                            {cliente.document.length <= 11 ? 'CPF' : 'CNPJ'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">
                {meta.total} cliente{meta.total !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm">
                  {meta.page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page >= totalPages}
                >
                  Proximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          description="Cadastre seu primeiro cliente para comecar a vender"
          actionLabel="Cadastrar cliente"
          actionHref="/cadastros/clientes/novo"
        />
      )}

      <Dialog open={showLgpdDialog} onOpenChange={setShowLgpdDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Contatos</DialogTitle>
            <DialogDescription>
              Seus contatos serao usados exclusivamente para cadastro de clientes neste aplicativo.
              Nenhum dado sera compartilhado com terceiros. Os contatos importados ficam isolados
              na sua empresa e voce pode remove-los a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLgpdDialog(false)}>Cancelar</Button>
            <Button onClick={handleImportContacts}>Aceitar e Importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
