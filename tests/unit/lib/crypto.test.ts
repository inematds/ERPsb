import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    NEXTAUTH_SECRET: 'test-secret-key-for-crypto-tests-minimum-length',
  },
}));

import { encryptString, decryptString } from '@/lib/crypto';

describe('Crypto', () => {
  describe('encryptString / decryptString', () => {
    it('should encrypt and decrypt round-trip', () => {
      const plaintext = 'Hello, World! Dados sensíveis do certificado.';
      const encrypted = encryptString(plaintext);
      const decrypted = decryptString(encrypted);

      expect(decrypted).toBe(plaintext);
      expect(encrypted).not.toBe(plaintext);
    });

    it('should produce different ciphertext each time (random IV)', () => {
      const plaintext = 'same-input';
      const encrypted1 = encryptString(plaintext);
      const encrypted2 = encryptString(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
      expect(decryptString(encrypted1)).toBe(plaintext);
      expect(decryptString(encrypted2)).toBe(plaintext);
    });

    it('should handle empty string', () => {
      const encrypted = encryptString('');
      const decrypted = decryptString(encrypted);
      expect(decrypted).toBe('');
    });

    it('should handle long strings', () => {
      const longString = 'A'.repeat(10000);
      const encrypted = encryptString(longString);
      const decrypted = decryptString(encrypted);
      expect(decrypted).toBe(longString);
    });

    it('should throw on tampered ciphertext', () => {
      const encrypted = encryptString('secret');
      const parts = encrypted.split(':');
      parts[2] = 'tampered' + parts[2];
      const tampered = parts.join(':');

      expect(() => decryptString(tampered)).toThrow();
    });

    it('should throw on invalid format', () => {
      expect(() => decryptString('invalid')).toThrow('Invalid ciphertext format');
    });
  });
});
