import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual as nodeTimingSafeEqual } from 'crypto';

/**
 * Cryptographic helper module for DARLEK CAAN engine
 * Provides secure hashing, token generation, HMAC verification, and secret masking.
 */

/**
 * Computes SHA-256 hash of the input string or buffer.
 */
export function sha256(data: string | Buffer | Uint8Array): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Computes HMAC-SHA256 signature for data given a secret key.
 */
export function hmacSha256(key: string, data: string): string {
  return createHmac('sha256', key).update(data).digest('hex');
}

/**
 * Generates a cryptographically secure random token (hex-encoded).
 * Defaults to 32 bytes (64 hex characters).
 */
export function generateSecureToken(bytes: number = 32): string {
  return randomBytes(bytes).toString('hex');
}

/**
 * Generates a standard RFC 4122 v4 UUID using crypto.
 */
export function generateUUID(): string {
  return randomUUID();
}

/**
 * Performs a constant-time equality check between two hex or ASCII strings
 * to protect against timing side-channel attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return nodeTimingSafeEqual(bufA, bufB);
}

/**
 * Masks sensitive keys or secrets, revealing only trailing or leading characters.
 */
export function maskSecret(secret: string, visibleChars: number = 4): string {
  if (!secret) return '';
  if (secret.length <= visibleChars * 2) {
    return '*'.repeat(secret.length);
  }
  const prefix = secret.slice(0, visibleChars);
  const suffix = secret.slice(-visibleChars);
  return `${prefix}${'*'.repeat(Math.max(4, secret.length - visibleChars * 2))}${suffix}`;
}

export const DarlekCrypto = {
  sha256,
  hmacSha256,
  generateSecureToken,
  generateUUID,
  timingSafeEqual,
  maskSecret,
};
