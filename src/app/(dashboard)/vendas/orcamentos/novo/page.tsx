'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, parseCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface Produto {
  id: string;
  name: string;
  sellPrice: number;
  type: string;
  barcode: string | null;
}

interface Cliente {
  id: string;
  name: string;
  phone: string;
}

interface OrcamentoItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function NovoOrcamentoPage() {
  const router = useRouter();

  // Product search
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<Produto[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Client search
  const [clientSearch, setClientSearch] = useState('');
  const [clients, setClients] = useState<Cliente[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Cart
  const [items, setItems] = useState<OrcamentoItem[]>([]);
  const [discountDisplay, setDiscountDisplay] = useState('');

  // Quote fields
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  // State
  const [saving, setSaving] = useState(false);

  // Product search with debounce
  useEffect(() => {
    if (productSearch.length >= 2) {
      const timer = setTimeout(async () => {
        const res = await fetch(
          `/api/v1/produtos?search=${encodeURIComponent(productSearch)}&pageSize=5&active=true`,
        );
        if (res.ok) {
          const json = await res.json();
          setProducts(json.data);
          setShowProductDropdown(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setProducts([]);
      setShowProductDropdown(false);
    }
  }, [productSearch]);

  // Client search with debounce
  useEffect(() => {
    if (clientSearch.length >= 2) {
      const timer = setTimeout(async () => {
        const res = await fetch(
          `/api/v1/clientes?search=${encodeURIComponent(clientSearch)}&pageSize=5`,
        );
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

  const addProduct = useCallback((product: Produto) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
            : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: product.sellPrice,
          total: product.sellPrice,
        },
      ];
    });
    setProductSearch('');
    setShowProductDropdown(false);
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty, total: newQty * item.unitPrice };
        })
        .filter(Boolean) as OrcamentoItem[],
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = parseCurrency(discountDisplay) || 0;
  const total = Math.max(0, subtotal - discount);

  const handleSave = async () => {
    if (items.length === 0) {
      toast.error('Adicione pelo menos 1 item');
      return;
    }
    if (!selectedClientId) {
      toast.error('Selecione um cliente');
      return;
    }
    if (!validUntil) {
      toast.error('Informe a data de validade');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/v1/orcamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          items,
          discount,
          validUntil,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || 'Erro ao criar orcamento');
        return;
      }

      const { data: orcamento } = await res.json();
      toast.success('Orcamento salvo!');
      router.push(`/vendas/orcamentos/${orcamento.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vendas/orcamentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Novo Orcamento</h1>
      </div>

      {/* Client (required) */}
      <Card>
        <CardContent className="py-3">
          <label className="text-sm font-medium block mb-1">
            Cliente <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setSelectedClientId(null);
              }}
              placeholder="Buscar cliente por nome ou telefone..."
            />
            {showClientDropdown && clients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                {clients.map((c) => (
                  <button
                    key={c.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setSelectedClientId(c.id);
                      setClientSearch(c.name);
                      setShowClientDropdown(false);
                    }}
                  >
                    {c.name} - {c.phone}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Search */}
      <Card>
        <CardContent className="py-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Buscar produto ou servico..."
              className="pl-9"
            />
            {showProductDropdown && products.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                {products.map((p) => (
                  <button
                    key={p.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex justify-between items-center"
                    onClick={() => addProduct(p)}
                  >
                    <span>
                      {p.name}
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        {p.type === 'SERVICO' ? 'Servico' : 'Produto'}
                      </Badge>
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(p.sellPrice)}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {showProductDropdown && products.length === 0 && productSearch.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-3">
                <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cart Items */}
      {items.length > 0 && (
        <Card>
          <CardContent className="py-3 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.unitPrice)} x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.productId, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.productId, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <span className="text-sm font-semibold w-20 text-right">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Validity & Notes */}
      <Card>
        <CardContent className="py-3 space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">
              Valido ate <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Observacoes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas ou condicoes do orcamento..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Discount */}
      {items.length > 0 && (
        <Card>
          <CardContent className="py-3">
            <label className="text-sm font-medium block mb-1">Desconto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                R$
              </span>
              <Input
                value={discountDisplay}
                onChange={(e) => setDiscountDisplay(e.target.value)}
                placeholder="0,00"
                className="pl-10"
                inputMode="decimal"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total */}
      {items.length > 0 && (
        <Card className="bg-primary/5">
          <CardContent className="py-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Desconto</span>
                  <span className="text-red-600">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-1">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button
        className="w-full h-12 text-base"
        size="lg"
        onClick={handleSave}
        disabled={saving || items.length === 0 || !selectedClientId || !validUntil}
      >
        {saving ? 'Salvando...' : 'Salvar Orcamento'}
      </Button>
    </div>
  );
}
