/**
 * Validates a Brazilian CNPJ number.
 * Accepts formatted (XX.XXX.XXX/XXXX-XX) or unformatted (14 digits).
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');

  if (cleaned.length !== 14) return false;

  // Reject known invalid patterns (all same digit)
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  // Validate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cleaned[12]) !== digit1) return false;

  // Validate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cleaned[13]) !== digit2) return false;

  return true;
}

/**
 * Formats a CNPJ string to XX.XXX.XXX/XXXX-XX pattern.
 */
export function formatCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 14);
  return cleaned
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}
