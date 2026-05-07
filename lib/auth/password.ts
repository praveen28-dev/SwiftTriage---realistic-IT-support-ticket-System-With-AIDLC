/**
 * Password Hashing Utilities
 * 
 * Provides secure password hashing and verification using bcryptjs.
 * Implements constant-time comparison to prevent timing attacks.
 * 
 * Requirements Coverage:
 * - 3.1: Hash passwords using bcryptjs with minimum 12 salt rounds
 * - 3.2: Execute hashing on backend only
 * - 3.4: Use constant-time comparison for password verification
 * - Performance NFR 1: Complete hashing within 500ms at 95th percentile
 */

import bcrypt from 'bcryptjs';

/**
 * Configuration for password hashing
 */
export const PASSWORD_CONFIG = {
  /**
   * Default salt rounds for bcrypt hashing
   * Minimum: 12 (security requirement)
   * Maximum: 15 (configurable for higher security)
   */
  DEFAULT_SALT_ROUNDS: 12,
  MIN_SALT_ROUNDS: 12,
  MAX_SALT_ROUNDS: 15,
} as const;

/**
 * Get salt rounds from environment or use default
 * Validates that salt rounds are within acceptable range
 */
function getSaltRounds(): number {
  const envSaltRounds = process.env.BCRYPT_SALT_ROUNDS;
  
  if (!envSaltRounds) {
    return PASSWORD_CONFIG.DEFAULT_SALT_ROUNDS;
  }
  
  const saltRounds = parseInt(envSaltRounds, 10);
  
  if (isNaN(saltRounds)) {
    console.warn(
      `Invalid BCRYPT_SALT_ROUNDS value: ${envSaltRounds}. Using default: ${PASSWORD_CONFIG.DEFAULT_SALT_ROUNDS}`
    );
    return PASSWORD_CONFIG.DEFAULT_SALT_ROUNDS;
  }
  
  if (saltRounds < PASSWORD_CONFIG.MIN_SALT_ROUNDS) {
    console.warn(
      `BCRYPT_SALT_ROUNDS (${saltRounds}) is below minimum (${PASSWORD_CONFIG.MIN_SALT_ROUNDS}). Using minimum.`
    );
    return PASSWORD_CONFIG.MIN_SALT_ROUNDS;
  }
  
  if (saltRounds > PASSWORD_CONFIG.MAX_SALT_ROUNDS) {
    console.warn(
      `BCRYPT_SALT_ROUNDS (${saltRounds}) exceeds maximum (${PASSWORD_CONFIG.MAX_SALT_ROUNDS}). Using maximum.`
    );
    return PASSWORD_CONFIG.MAX_SALT_ROUNDS;
  }
  
  return saltRounds;
}

/**
 * Hash a password using bcryptjs with configured salt rounds
 * 
 * @param password - Plain text password to hash
 * @returns Promise resolving to bcrypt hash string
 * 
 * @throws {Error} If password is empty or hashing fails
 * 
 * @example
 * ```typescript
 * const hash = await hashPassword('MySecurePassword123');
 * // Returns: $2a$12$...
 * ```
 * 
 * Requirements:
 * - 3.1: Uses bcryptjs with minimum 12 salt rounds
 * - 3.2: Server-side only (never expose to client)
 * - Performance NFR 1: Completes within 500ms at 95th percentile
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty');
  }
  
  const saltRounds = getSaltRounds();
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against a bcrypt hash using constant-time comparison
 * 
 * @param password - Plain text password to verify
 * @param hash - Bcrypt hash to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 * 
 * @example
 * ```typescript
 * const isValid = await verifyPassword('MySecurePassword123', storedHash);
 * if (isValid) {
 *   // Password is correct
 * }
 * ```
 * 
 * Requirements:
 * - 3.4: Uses bcryptjs constant-time comparison to prevent timing attacks
 * - 3.5: Never reveals whether username or password was incorrect
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (!password || password.length === 0) {
    return false;
  }
  
  if (!hash || hash.length === 0) {
    return false;
  }
  
  try {
    // bcrypt.compare uses constant-time comparison internally
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    // Log error but return false to prevent information leakage
    console.error('Password verification failed:', error);
    return false;
  }
}
