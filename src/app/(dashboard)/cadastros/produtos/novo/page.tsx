'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { parseCurrency } from '@/lib/formatters';

export default function NovoProdutoPage() {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: '',
    type: 'PRODUTO' as 'PRODUTO' | 'SERVICO',
    sellPrice: '',
    costPrice: '',
    unit: 'un',
    barcode: '',
    ncm: '',
    description: '',
    stockMin: '',
    trackStock: true,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-adjust defaults when type changes
      if (field === 'type') {
        if (value === 'SERVICO') {
          updated.unit = 'srv';
          updated.trackStock = false;
        } else {
          updated.unit = 'un';
          updated.trackStock = true;
        }
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (form.name.length < 2) newErrors.name = 'Nome deve ter pelo menos 2 caracteres';

    const sellPriceCentavos = parseCurrency(form.sellPrice);
    if (sellPriceCentavos <= 0) newErrors.sellPrice = 'Preco deve ser positivo';

    if (form.ncm && !/^\d{8}$/.test(form.ncm)) newErrors.ncm = 'NCM deve ter 8 digitos';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const costPriceCentavos = form.costPrice ? parseCurrency(form.costPrice) : null;
      const body = {
        name: form.name,
        type: form.type,
        sellPrice: sellPriceCentavos,
        costPrice: costPriceCentavos && costPriceCentavos > 0 ? costPriceCentavos : null,
        unit: form.unit,
        barcode: form.barcode || undefined,
        ncm: form.ncm || undefined,
        description: form.description || undefined,
        stockMin: form.stockMin ? parseInt(form.stockMin) : 0,
        trackStock: form.trackStock,
      };

      const res = await fetch('/api/v1/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Produto cadastrado com sucesso!');
        router.push('/cadastros/produtos');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao cadastrar produto');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold">Novo Produto/Servico</h1>

      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome *</label>
          <Input
            placeholder="Nome do produto ou servico"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'border-destructive' : ''}
            autoFocus
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo *</label>
          <div className="flex gap-2">
            {(['PRODUTO', 'SERVICO'] as const).map((t) => (
              <Button
                key={t}
                type="button"
                variant={form.type === t ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleChange('type', t)}
              >
                {t === 'PRODUTO' ? 'Produto' : 'Servico'}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Preco de Venda *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              R$
            </span>
            <Input
              placeholder="0,00"
              value={form.sellPrice}
              onChange={(e) => handleChange('sellPrice', e.target.value)}
              className={`pl-10 ${errors.sellPrice ? 'border-destructive' : ''}`}
              inputMode="decimal"
            />
          </div>
          {errors.sellPrice && <p className="text-xs text-destructive">{errors.sellPrice}</p>}
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full justify-between"
          onClick={() => setShowDetails(!showDetails)}
        >
          Mais detalhes
          {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showDetails && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Preco de Custo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  placeholder="0,00"
                  value={form.costPrice}
                  onChange={(e) => handleChange('costPrice', e.target.value)}
                  className="pl-10"
                  inputMode="decimal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Unidade de Medida</label>
              <select
                value={form.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="un">Unidade (un)</option>
                <option value="kg">Quilograma (kg)</option>
                <option value="hr">Hora (hr)</option>
                <option value="srv">Servico (srv)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Codigo de Barras</label>
              <Input
                placeholder="EAN/GTIN"
                value={form.barcode}
                onChange={(e) => handleChange('barcode', e.target.value)}
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">NCM</label>
              <Input
                placeholder="00000000 (8 digitos)"
                value={form.ncm}
                onChange={(e) => handleChange('ncm', e.target.value)}
                className={errors.ncm ? 'border-destructive' : ''}
                inputMode="numeric"
                maxLength={8}
              />
              {errors.ncm && <p className="text-xs text-destructive">{errors.ncm}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descricao</label>
              <textarea
                placeholder="Descricao do produto..."
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estoque Minimo</label>
              <Input
                placeholder="0"
                value={form.stockMin}
                onChange={(e) => handleChange('stockMin', e.target.value)}
                inputMode="numeric"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Controlar Estoque</label>
              <button
                type="button"
                role="switch"
                aria-checked={form.trackStock}
                onClick={() => handleChange('trackStock', !form.trackStock)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.trackStock ? 'bg-primary' : 'bg-input'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${form.trackStock ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        )}
      </Card>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push('/cadastros/produtos')}
        >
          Cancelar
        </Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}
