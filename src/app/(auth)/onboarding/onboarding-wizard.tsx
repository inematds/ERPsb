'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCNPJ, validateCNPJ } from '@/lib/validators';
import {
  BUSINESS_TYPES,
  MONTHLY_REVENUE_RANGES,
  PAYMENT_METHODS,
} from '@/lib/constants';

interface OnboardingData {
  businessName: string;
  businessType: string;
  monthlyRevenue: string;
  hasCnpj: boolean | null;
  cnpj: string;
  paymentMethods: string[];
}

const TOTAL_STEPS = 5;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    businessType: '',
    monthlyRevenue: '',
    hasCnpj: null,
    cnpj: '',
    paymentMethods: [],
  });

  const progress = (step / TOTAL_STEPS) * 100;

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return data.businessName.trim().length > 0;
      case 2:
        return data.businessType.length > 0;
      case 3:
        return data.monthlyRevenue.length > 0;
      case 4:
        if (data.hasCnpj === null) return false;
        if (data.hasCnpj && data.cnpj) return validateCNPJ(data.cnpj);
        return data.hasCnpj === false;
      case 5:
        return data.paymentMethods.length > 0;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    await submitOnboarding();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Minha Empresa' }),
      });
      if (res.ok) {
        router.push('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: data.businessName.trim(),
          businessType: data.businessType,
          monthlyRevenue: data.monthlyRevenue,
          hasCnpj: data.hasCnpj,
          cnpj: data.hasCnpj ? data.cnpj.replace(/\D/g, '') : undefined,
          paymentMethods: data.paymentMethods,
        }),
      });
      if (res.ok) {
        router.push('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePaymentMethod = (method: string) => {
    setData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">ERPsb</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vamos configurar sua empresa
        </p>
      </div>

      <Progress value={progress} className="h-2" />
      <p className="text-center text-xs text-muted-foreground">
        Passo {step} de {TOTAL_STEPS}
      </p>

      <Card>
        <CardContent className="pt-6">
          <div className="min-h-[200px]">
            {step === 1 && (
              <StepBusinessName
                value={data.businessName}
                onChange={(v) => setData({ ...data, businessName: v })}
              />
            )}
            {step === 2 && (
              <StepBusinessType
                value={data.businessType}
                onChange={(v) => setData({ ...data, businessType: v })}
              />
            )}
            {step === 3 && (
              <StepRevenue
                value={data.monthlyRevenue}
                onChange={(v) => setData({ ...data, monthlyRevenue: v })}
              />
            )}
            {step === 4 && (
              <StepCnpj
                hasCnpj={data.hasCnpj}
                cnpj={data.cnpj}
                onHasCnpjChange={(v) => setData({ ...data, hasCnpj: v })}
                onCnpjChange={(v) => setData({ ...data, cnpj: v })}
              />
            )}
            {step === 5 && (
              <StepPaymentMethods
                selected={data.paymentMethods}
                onToggle={togglePaymentMethod}
              />
            )}
          </div>

          <div className="mt-6 flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="min-h-[48px] flex-1"
              >
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="min-h-[48px] flex-1"
            >
              {isSubmitting
                ? 'Salvando...'
                : step === TOTAL_STEPS
                  ? 'Concluir'
                  : 'Proximo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <button
        onClick={handleSkip}
        disabled={isSubmitting}
        className="block w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Pular e configurar depois
      </button>
    </div>
  );
}

function StepBusinessName({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Qual o nome do seu negocio?</h2>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: Padaria do Joao"
        autoFocus
        className="min-h-[48px] text-base"
        maxLength={255}
      />
    </div>
  );
}

function StepBusinessType({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Que tipo de negocio voce tem?</h2>
      <div className="grid grid-cols-2 gap-3">
        {BUSINESS_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`min-h-[48px] rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
              value === type.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepRevenue({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Quanto voce fatura por mes, mais ou menos?
      </h2>
      <div className="flex flex-col gap-3">
        {MONTHLY_REVENUE_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => onChange(range.value)}
            className={`min-h-[48px] rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
              value === range.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepCnpj({
  hasCnpj,
  cnpj,
  onHasCnpjChange,
  onCnpjChange,
}: {
  hasCnpj: boolean | null;
  cnpj: string;
  onHasCnpjChange: (v: boolean) => void;
  onCnpjChange: (v: string) => void;
}) {
  const cnpjValid = cnpj.length > 0 ? validateCNPJ(cnpj) : null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Voce tem CNPJ?</h2>
      <div className="flex gap-3">
        <button
          onClick={() => onHasCnpjChange(true)}
          className={`min-h-[48px] flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
            hasCnpj === true
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:border-primary/50'
          }`}
        >
          Sim
        </button>
        <button
          onClick={() => {
            onHasCnpjChange(false);
            onCnpjChange('');
          }}
          className={`min-h-[48px] flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
            hasCnpj === false
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:border-primary/50'
          }`}
        >
          Nao
        </button>
      </div>
      {hasCnpj && (
        <div className="space-y-2">
          <Input
            value={cnpj}
            onChange={(e) => onCnpjChange(formatCNPJ(e.target.value))}
            placeholder="XX.XXX.XXX/XXXX-XX"
            className={`min-h-[48px] text-base ${
              cnpjValid === true
                ? 'border-semaforo-green'
                : cnpjValid === false
                  ? 'border-destructive'
                  : ''
            }`}
            maxLength={18}
          />
          {cnpjValid === false && cnpj.length > 0 && (
            <p className="text-xs text-destructive">CNPJ invalido</p>
          )}
        </div>
      )}
    </div>
  );
}

function StepPaymentMethods({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (method: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Como voce cobra seus clientes hoje?
      </h2>
      <p className="text-sm text-muted-foreground">
        Selecione uma ou mais opcoes
      </p>
      <div className="flex flex-col gap-3">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.value}
            onClick={() => onToggle(method.value)}
            className={`min-h-[48px] rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
              selected.includes(method.value)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {method.label}
          </button>
        ))}
      </div>
    </div>
  );
}
