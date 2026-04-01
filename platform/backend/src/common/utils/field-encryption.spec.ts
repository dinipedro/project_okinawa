import {
  encryptField,
  decryptField,
  encryptedTransformer,
  encryptedArrayTransformer,
  encryptedJsonTransformer,
} from './field-encryption';

// Set a test encryption key before tests run
beforeAll(() => {
  process.env.FIELD_ENCRYPTION_KEY =
    'test-key-must-be-at-least-32-chars-long!!';
});

describe('field-encryption', () => {
  describe('encryptField / decryptField', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const plaintext = 'my-secret-api-key-123';
      const encrypted = encryptField(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).toMatch(/^enc:/);
      expect(encrypted).not.toContain(plaintext);

      const decrypted = decryptField(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should return null/empty for falsy values', () => {
      expect(encryptField(null as any)).toBe(null);
      expect(encryptField('' as any)).toBe('');
      expect(decryptField(null as any)).toBe(null);
    });

    it('should return unencrypted string as-is when decrypting', () => {
      const plain = 'not-encrypted';
      expect(decryptField(plain)).toBe(plain);
    });

    it('should produce different ciphertext each time (random IV)', () => {
      const plaintext = 'same-text';
      const enc1 = encryptField(plaintext);
      const enc2 = encryptField(plaintext);
      expect(enc1).not.toBe(enc2);

      // Both should decrypt to the same value
      expect(decryptField(enc1)).toBe(plaintext);
      expect(decryptField(enc2)).toBe(plaintext);
    });

    it('should throw on tampered ciphertext', () => {
      const encrypted = encryptField('secret');
      const tampered = encrypted.slice(0, -2) + 'XX';
      expect(() => decryptField(tampered)).toThrow();
    });
  });

  describe('encryptedTransformer', () => {
    it('should encrypt on .to() and decrypt on .from()', () => {
      const value = 'api-token-xyz';
      const stored = encryptedTransformer.to(value);
      expect(stored).toMatch(/^enc:/);

      const read = encryptedTransformer.from(stored);
      expect(read).toBe(value);
    });

    it('should pass through null values', () => {
      expect(encryptedTransformer.to(null)).toBeNull();
      expect(encryptedTransformer.from(null)).toBeNull();
    });

    it('should not double-encrypt already encrypted values', () => {
      const value = 'secret';
      const encrypted = encryptedTransformer.to(value);
      const doubleEncrypted = encryptedTransformer.to(encrypted);
      // Should be the same (not re-encrypted)
      expect(doubleEncrypted).toBe(encrypted);
    });
  });

  describe('encryptedArrayTransformer', () => {
    it('should encrypt array and decrypt back', () => {
      const arr = ['code1', 'code2', 'code3'];
      const stored = encryptedArrayTransformer.to(arr);
      expect(stored).toMatch(/^enc:/);

      const read = encryptedArrayTransformer.from(stored);
      expect(read).toEqual(arr);
    });

    it('should handle null/empty arrays', () => {
      expect(encryptedArrayTransformer.to(null)).toBeNull();
      expect(encryptedArrayTransformer.to([])).toBeNull();
      expect(encryptedArrayTransformer.from(null)).toBeNull();
    });
  });

  describe('encryptedJsonTransformer', () => {
    it('should encrypt JSON object and decrypt back', () => {
      const obj = { api_key: 'sk_live_123', webhook_token: 'whk_abc' };
      const stored = encryptedJsonTransformer.to(obj);
      expect(typeof stored).toBe('string');
      expect(stored).toMatch(/^enc:/);

      const read = encryptedJsonTransformer.from(stored);
      expect(read).toEqual(obj);
    });

    it('should handle null/empty objects', () => {
      expect(encryptedJsonTransformer.to(null)).toBeNull();
      expect(encryptedJsonTransformer.to({})).toBeNull();
      expect(encryptedJsonTransformer.from(null)).toBeNull();
    });

    it('should handle legacy unencrypted JSONB (object passed directly)', () => {
      const legacy = { api_key: 'old_key' };
      // When TypeORM reads JSONB it parses to object; transformer should handle this
      const read = encryptedJsonTransformer.from(legacy as any);
      expect(read).toEqual(legacy);
    });
  });
});
