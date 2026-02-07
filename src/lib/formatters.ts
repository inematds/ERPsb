const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(centavos: number): string {
  return currencyFormatter.format(centavos / 100);
}

export function parseCurrency(display: string): number {
  const cleaned = display.replace(/[^\d,.-]/g, '').replace(',', '.');
  const value = parseFloat(cleaned);
  if (isNaN(value)) return 0;
  return Math.round(value * 100);
}
