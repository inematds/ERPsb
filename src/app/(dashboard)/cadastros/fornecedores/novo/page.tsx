'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { formatCPF, formatCNPJ } from '@/lib/validators';

function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 11);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
}

function formatDocument(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 11) return formatCPF(cleaned);
  return formatCNPJ(cleaned);
}

export default function NovoFornecedorPage() {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    document: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });

  const handleChange = (field: string, value: string) => {
    if (field === 'phone') {
      value = formatPhone(value);
    } else if (field === 'document') {
      value = formatDocument(value);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (form.name.length < 2) newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email invalido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const hasAddress = form.street || form.number || form.city;
      const body = {
        name: form.name,
        phone: form.phone.replace(/\D/g, '') || undefined,
        email: form.email || undefined,
        document: form.document.replace(/\D/g, '') || undefined,
        address: hasAddress
          ? {
              street: form.street,
              number: form.number,
              neighborhood: form.neighborhood,
              city: form.city,
              state: form.state,
              zipCode: form.zipCode,
            }
          : undefined,
        notes: form.notes || undefined,
      };

      const res = await fetch('/api/v1/fornecedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Fornecedor cadastrado com sucesso!');
        router.push('/cadastros/fornecedores');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao cadastrar fornecedor');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold">Novo Fornecedor</h1>

      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome *</label>
          <Input
            placeholder="Nome do fornecedor"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'border-destructive' : ''}
            autoFocus
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
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
              <label className="text-sm font-medium">Telefone</label>
              <Input
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                inputMode="tel"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                placeholder="email@exemplo.com"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
                inputMode="email"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CPF/CNPJ</label>
              <Input
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={form.document}
                onChange={(e) => handleChange('document', e.target.value)}
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Endereco</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Input
                    placeholder="Rua"
                    value={form.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Numero"
                  value={form.number}
                  onChange={(e) => handleChange('number', e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Bairro"
                  value={form.neighborhood}
                  onChange={(e) => handleChange('neighborhood', e.target.value)}
                />
                <Input
                  placeholder="Cidade"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Estado"
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  maxLength={2}
                />
                <Input
                  placeholder="CEP"
                  value={form.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observacoes</label>
              <textarea
                placeholder="Anotacoes sobre o fornecedor..."
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
        )}
      </Card>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push('/cadastros/fornecedores')}
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
