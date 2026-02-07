'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { parseCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface Cliente {
  id: string;
  name: string;
}

const CATEGORIES = [
  { value: 'VENDAS', label: 'Vendas' },
  { value: 'SERVICOS', label: 'Servicos' },
  { value: 'OUTROS', label: 'Outros' },
];

export default function NovaContaReceberPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('VENDAS');
  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [clients, setClients] = useState<Cliente[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [notes, setNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clientSearch.length >= 2) {
      const timer = setTimeout(async () => {
        const res = await fetch(`/api/v1/clientes?search=${encodeURIComponent(clientSearch)}&pageSize=5`);
        if (res.ok) {
          const json = await res.json();
          setClients(json.data);
          setShowClientDropdown(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setClients([]);
      setShowClientDropdown(false);
    }
  }, [clientSearch]);

  const handleSubmit = async () => {
    const amount = parseCurrency(amountDisplay);
    if (!description || !amount || !dueDate) {
      toast.error('Preencha os campos obrigatorios');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/v1/contas-receber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount,
          dueDate,
          category,
          clientId: clientId || null,
          notes: notes || null,
        }),
      });

      if (res.ok) {
        toast.success('Conta criada com sucesso');
        router.push('/financeiro/contas-receber');
      } else {
        const json = await res.json();
        toast.error(json.error || 'Erro ao criar conta');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/financeiro/contas-receber">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Nova Conta a Receber</h1>
      </div>

      <Card className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Descricao *</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Venda de produto"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Valor *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              R$
            </span>
            <Input
              value={amountDisplay}
              onChange={(e) => setAmountDisplay(e.target.value)}
              placeholder="0,00"
              className="pl-10"
              inputMode="decimal"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Vencimento *</label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="text-sm font-medium block mb-1">Cliente</label>
          <Input
            value={clientSearch}
            onChange={(e) => {
              setClientSearch(e.target.value);
              setClientId('');
            }}
            placeholder="Buscar cliente..."
          />
          {showClientDropdown && clients.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
              {clients.map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => {
                    setClientId(c.id);
                    setClientSearch(c.name);
                    setShowClientDropdown(false);
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-muted-foreground"
        >
          {showDetails ? 'Menos detalhes' : 'Mais detalhes'}
        </Button>

        {showDetails && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="text-sm font-medium block mb-1">Notas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                placeholder="Observacoes adicionais..."
              />
            </div>
          </div>
        )}
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/financeiro/contas-receber">Cancelar</Link>
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={saving || !description || !amountDisplay || !dueDate}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}
