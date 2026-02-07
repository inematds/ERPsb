'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { parseCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface Fornecedor {
  id: string;
  name: string;
}

const CATEGORIES = [
  { value: 'ALUGUEL', label: 'Aluguel' },
  { value: 'FUNCIONARIOS', label: 'Funcionarios' },
  { value: 'FORNECEDORES', label: 'Fornecedores' },
  { value: 'IMPOSTOS', label: 'Impostos' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'SERVICOS', label: 'Servicos' },
  { value: 'OUTROS', label: 'Outros' },
];

export default function NovaContaPagarPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('OUTROS');
  const [supplierId, setSupplierId] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [suppliers, setSuppliers] = useState<Fornecedor[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [notes, setNotes] = useState('');
  const [recurrent, setRecurrent] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('MENSAL');
  const [showDetails, setShowDetails] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (supplierSearch.length >= 2) {
      const timer = setTimeout(async () => {
        const res = await fetch(`/api/v1/fornecedores?search=${encodeURIComponent(supplierSearch)}&pageSize=5`);
        if (res.ok) {
          const json = await res.json();
          setSuppliers(json.data);
          setShowSupplierDropdown(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuppliers([]);
      setShowSupplierDropdown(false);
    }
  }, [supplierSearch]);

  const handleSubmit = async () => {
    const amount = parseCurrency(amountDisplay);
    if (!description || !amount || !dueDate) {
      toast.error('Preencha os campos obrigatorios');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/v1/contas-pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount,
          dueDate,
          category,
          supplierId: supplierId || null,
          notes: notes || null,
          recurrent,
          recurrenceType: recurrent ? recurrenceType : null,
        }),
      });

      if (res.ok) {
        toast.success('Conta criada com sucesso');
        router.push('/financeiro/contas-pagar');
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
          <Link href="/financeiro/contas-pagar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Nova Conta a Pagar</h1>
      </div>

      <Card className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Descricao *</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Aluguel do mes"
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
          <label className="text-sm font-medium block mb-1">Fornecedor</label>
          <Input
            value={supplierSearch}
            onChange={(e) => {
              setSupplierSearch(e.target.value);
              setSupplierId('');
            }}
            placeholder="Buscar fornecedor..."
          />
          {showSupplierDropdown && suppliers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
              {suppliers.map((s) => (
                <button
                  key={s.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => {
                    setSupplierId(s.id);
                    setSupplierSearch(s.name);
                    setShowSupplierDropdown(false);
                  }}
                >
                  {s.name}
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

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Conta recorrente</label>
              <Switch
                checked={recurrent}
                onCheckedChange={setRecurrent}
                size="sm"
              />
            </div>

            {recurrent && (
              <div>
                <label className="text-sm font-medium block mb-1">Tipo de recorrencia</label>
                <select
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="MENSAL">Mensal</option>
                  <option value="SEMANAL">Semanal</option>
                </select>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/financeiro/contas-pagar">Cancelar</Link>
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
