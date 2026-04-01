import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const ENCODING = 'base64';
const PREFIX = 'enc:';

function getEncryptionKey(): Buffer {
  const key = process.env.FIELD_ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error(
      'FIELD_ENCRYPTION_KEY environment variable is required (min 32 chars).',
    );
  }
  return crypto.scryptSync(key, 'noowe-field-enc', 32);
}

/**
 * Encrypts a string value using AES-256-GCM.
 * Returns prefixed ciphertext: "enc:<iv>:<authTag>:<ciphertext>" in base64.
 */
export function encryptField(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
  encrypted += cipher.final(ENCODING);

  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
}

/**
 * Decrypts a value previously encrypted with encryptField().
 * Returns plaintext. If value is not encrypted (no prefix), returns as-is.
 */
export function decryptField(ciphertext: string): string {
  if (!ciphertext?.startsWith(PREFIX)) {
    return ciphertext;
  }

  const key = getEncryptionKey();
  const parts = ciphertext.slice(PREFIX.length).split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted field format');
  }

  const [ivB64, authTagB64, encryptedB64] = parts;
  const iv = Buffer.from(ivB64, ENCODING);
  const authTag = Buffer.from(authTagB64, ENCODING);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedB64, ENCODING, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * TypeORM transformer for transparent field encryption/decryption.
 * Usage: @Column({ transformer: encryptedTransformer })
 */
export const encryptedTransformer = {
  to(value: string | null): string | null {
    if (!value) return value;
    if (value.startsWith(PREFIX)) return value;
    return encryptField(value);
  },
  from(value: string | null): string | null {
    if (!value) return value;
    return decryptField(value);
  },
};

/**
 * TypeORM transformer for encrypted JSON arrays (e.g., MFA backup codes).
 * Serializes array to JSON string, encrypts, then stores.
 */
export const encryptedArrayTransformer = {
  to(value: string[] | null): string | null {
    if (!value || value.length === 0) return null;
    const json = JSON.stringify(value);
    return encryptField(json);
  },
  from(value: string | null): string[] | null {
    if (!value) return null;
    const decrypted = decryptField(value);
    try {
      return JSON.parse(decrypted);
    } catch {
      // Legacy unencrypted data — return as comma-separated
      return decrypted.split(',');
    }
  },
};

/**
 * TypeORM transformer for encrypted JSONB objects (e.g., API credentials).
 * Serializes object to JSON string, encrypts, then stores as text.
 * Reads back: decrypts, parses JSON.
 * Falls back gracefully for legacy unencrypted JSONB data.
 */
export const encryptedJsonTransformer = {
  to(value: Record<string, any> | null): string | null {
    if (!value || Object.keys(value).length === 0) return null;
    const json = JSON.stringify(value);
    return encryptField(json);
  },
  from(value: string | Record<string, any> | null): Record<string, any> | null {
    if (!value) return null;
    // Already a parsed object (legacy unencrypted JSONB) — return as-is
    if (typeof value === 'object') return value;
    const decrypted = decryptField(value);
    try {
      return JSON.parse(decrypted);
    } catch {
      return {};
    }
  },
};
