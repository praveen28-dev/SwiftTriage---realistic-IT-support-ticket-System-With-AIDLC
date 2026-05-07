/**
 * Unit Tests for Password Hashing Utilities
 * 
 * Tests password hashing and verification functionality including:
 * - Hash generation with salt randomness
 * - Password verification (correct and incorrect)
 * - Performance requirements (500ms at 95th percentile)
 * - Timing attack resistance (constant-time comparison)
 * - Configuration validation
 * 
 * Requirements Coverage:
 * - 3.1: Password hashing with bcryptjs
 * - 3.4: Constant-time comparison
 * - Performance NFR 1: Hashing completes within 500ms
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { hashPassword, verifyPassword, PASSWORD_CONFIG } from './password';

describe('Password Hashing Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'MySecurePassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });
    
    it('should produce different hashes for the same password (salt randomness)', async () => {
      const password = 'MySecurePassword123';
      
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
    });
    
    it('should throw error for empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow('Password cannot be empty');
    });
    
    it('should hash passwords with special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$/);
    });
    
    it('should hash long passwords', async () => {
      const password = 'a'.repeat(100);
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$/);
    });
    
    it('should complete hashing within 500ms at 95th percentile', async () => {
      const password = 'MySecurePassword123';
      const iterations = 20;
      const timings: number[] = [];
      
      // Run multiple iterations to get timing distribution
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await hashPassword(password);
        const endTime = performance.now();
        timings.push(endTime - startTime);
      }
      
      // Sort timings to calculate 95th percentile
      timings.sort((a, b) => a - b);
      const p95Index = Math.floor(iterations * 0.95);
      const p95Time = timings[p95Index];
      
      // Performance NFR 1: Should complete within 500ms at 95th percentile
      expect(p95Time).toBeLessThan(500);
    }, 15000); // Increase test timeout to allow for multiple iterations
  });
  
  describe('verifyPassword', () => {
    it('should verify correct password successfully', async () => {
      const password = 'MySecurePassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });
    
    it('should reject incorrect password', async () => {
      const correctPassword = 'MySecurePassword123';
      const incorrectPassword = 'WrongPassword456';
      const hash = await hashPassword(correctPassword);
      
      const isValid = await verifyPassword(incorrectPassword, hash);
      
      expect(isValid).toBe(false);
    });
    
    it('should reject password with slight variation', async () => {
      const password = 'MySecurePassword123';
      const hash = await hashPassword(password);
      
      // Test case sensitivity
      const isValid = await verifyPassword('mysecurepassword123', hash);
      
      expect(isValid).toBe(false);
    });
    
    it('should return false for empty password', async () => {
      const hash = await hashPassword('ValidPassword123');
      
      const isValid = await verifyPassword('', hash);
      
      expect(isValid).toBe(false);
    });
    
    it('should return false for empty hash', async () => {
      const isValid = await verifyPassword('ValidPassword123', '');
      
      expect(isValid).toBe(false);
    });
    
    it('should return false for invalid hash format', async () => {
      const isValid = await verifyPassword('ValidPassword123', 'invalid-hash');
      
      expect(isValid).toBe(false);
    });
    
    it('should handle special characters in password verification', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });
    
    it('should demonstrate constant-time comparison (timing attack resistance)', async () => {
      const password = 'MySecurePassword123';
      const hash = await hashPassword(password);
      
      // Test with completely wrong password
      const wrongPassword = 'X'.repeat(password.length);
      
      // Test with password that differs only in last character
      const almostCorrectPassword = password.slice(0, -1) + 'X';
      
      // Measure timing for both incorrect passwords
      const iterations = 10;
      const wrongTimings: number[] = [];
      const almostTimings: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        // Time completely wrong password
        const start1 = performance.now();
        await verifyPassword(wrongPassword, hash);
        const end1 = performance.now();
        wrongTimings.push(end1 - start1);
        
        // Time almost correct password
        const start2 = performance.now();
        await verifyPassword(almostCorrectPassword, hash);
        const end2 = performance.now();
        almostTimings.push(end2 - start2);
      }
      
      // Calculate average timings
      const avgWrong = wrongTimings.reduce((a, b) => a + b, 0) / iterations;
      const avgAlmost = almostTimings.reduce((a, b) => a + b, 0) / iterations;
      
      // Timing difference should be minimal (within 20% variance)
      // This demonstrates constant-time comparison behavior
      const timingDifference = Math.abs(avgWrong - avgAlmost);
      const maxAllowedDifference = Math.max(avgWrong, avgAlmost) * 0.2;
      
      expect(timingDifference).toBeLessThan(maxAllowedDifference);
    }, 10000); // Increase test timeout
  });
  
  describe('Configuration', () => {
    const originalEnv = process.env.BCRYPT_SALT_ROUNDS;
    
    afterEach(() => {
      // Restore original environment variable
      if (originalEnv !== undefined) {
        process.env.BCRYPT_SALT_ROUNDS = originalEnv;
      } else {
        delete process.env.BCRYPT_SALT_ROUNDS;
      }
    });
    
    it('should use default salt rounds when environment variable not set', async () => {
      delete process.env.BCRYPT_SALT_ROUNDS;
      
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      // Verify hash was created (indicates default salt rounds were used)
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$/);
      
      // bcrypt hash format includes salt rounds: $2a$12$...
      // Extract salt rounds from hash
      const saltRounds = parseInt(hash.split('$')[2], 10);
      expect(saltRounds).toBe(PASSWORD_CONFIG.DEFAULT_SALT_ROUNDS);
    });
    
    it('should use environment variable salt rounds when valid', async () => {
      process.env.BCRYPT_SALT_ROUNDS = '13';
      
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      // Extract salt rounds from hash
      const saltRounds = parseInt(hash.split('$')[2], 10);
      expect(saltRounds).toBe(13);
    });
    
    it('should enforce minimum salt rounds', async () => {
      process.env.BCRYPT_SALT_ROUNDS = '8'; // Below minimum
      
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      // Should use minimum salt rounds instead
      const saltRounds = parseInt(hash.split('$')[2], 10);
      expect(saltRounds).toBe(PASSWORD_CONFIG.MIN_SALT_ROUNDS);
    });
    
    it('should enforce maximum salt rounds', async () => {
      process.env.BCRYPT_SALT_ROUNDS = '20'; // Above maximum
      
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      // Should use maximum salt rounds instead
      const saltRounds = parseInt(hash.split('$')[2], 10);
      expect(saltRounds).toBe(PASSWORD_CONFIG.MAX_SALT_ROUNDS);
    });
    
    it('should use default for invalid environment variable', async () => {
      process.env.BCRYPT_SALT_ROUNDS = 'invalid';
      
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      // Should fall back to default
      const saltRounds = parseInt(hash.split('$')[2], 10);
      expect(saltRounds).toBe(PASSWORD_CONFIG.DEFAULT_SALT_ROUNDS);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle unicode characters in password', async () => {
      const password = 'Pāsswörd123🔒';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });
    
    it('should handle whitespace in password', async () => {
      const password = '  Password With Spaces  ';
      const hash = await hashPassword(password);
      
      // Exact match including whitespace
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
      
      // Trimmed version should not match
      const isValidTrimmed = await verifyPassword(password.trim(), hash);
      expect(isValidTrimmed).toBe(false);
    });
    
    it('should handle very long passwords', async () => {
      const password = 'a'.repeat(200);
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });
  });
});
