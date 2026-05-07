import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    // Use shorter durations for testing
    rateLimiter = new RateLimiter({
      maxAttempts: 5,
      windowMs: 1000, // 1 second for testing
      blockDurationMs: 2000, // 2 seconds for testing
    });
  });

  afterEach(() => {
    rateLimiter.stopCleanup();
    rateLimiter.clear();
  });

  describe('check()', () => {
    it('should allow requests under limit (1-4 attempts)', () => {
      const ip = '192.168.1.1';

      // First 4 attempts should be allowed
      expect(rateLimiter.check(ip)).toBe(true);
      rateLimiter.recordFailure(ip);

      expect(rateLimiter.check(ip)).toBe(true);
      rateLimiter.recordFailure(ip);

      expect(rateLimiter.check(ip)).toBe(true);
      rateLimiter.recordFailure(ip);

      expect(rateLimiter.check(ip)).toBe(true);
      rateLimiter.recordFailure(ip);

      // 5th attempt should still be allowed (at limit, not over)
      expect(rateLimiter.check(ip)).toBe(true);
    });

    it('should block requests at limit (5 attempts)', () => {
      const ip = '192.168.1.2';

      // Record 5 failures
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordFailure(ip);
      }

      // Should now be blocked
      expect(rateLimiter.check(ip)).toBe(false);
    });

    it('should allow requests from different IPs independently', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      // Block ip1
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordFailure(ip1);
      }

      // ip1 should be blocked
      expect(rateLimiter.check(ip1)).toBe(false);

      // ip2 should still be allowed
      expect(rateLimiter.check(ip2)).toBe(true);
    });

    it('should allow requests after window expires', async () => {
      const ip = '192.168.1.3';

      // Record 3 failures
      rateLimiter.recordFailure(ip);
      rateLimiter.recordFailure(ip);
      rateLimiter.recordFailure(ip);

      // Should still be allowed
      expect(rateLimiter.check(ip)).toBe(true);

      // Wait for window to expire (1 second + buffer)
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be allowed again (window reset)
      expect(rateLimiter.check(ip)).toBe(true);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(5);
    });

    it('should allow requests after block expires', async () => {
      const ip = '192.168.1.4';

      // Block the IP
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordFailure(ip);
      }

      // Should be blocked
      expect(rateLimiter.check(ip)).toBe(false);

      // Wait for block to expire (2 seconds + buffer)
      await new Promise(resolve => setTimeout(resolve, 2100));

      // Should be allowed again
      expect(rateLimiter.check(ip)).toBe(true);
    });
  });

  describe('recordFailure()', () => {
    it('should increment failure count', () => {
      const ip = '192.168.1.5';

      expect(rateLimiter.getRemainingAttempts(ip)).toBe(5);

      rateLimiter.recordFailure(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(4);

      rateLimiter.recordFailure(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(3);
    });

    it('should set block when limit reached', () => {
      const ip = '192.168.1.6';

      // Record 5 failures
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordFailure(ip);
      }

      // Should be blocked
      expect(rateLimiter.check(ip)).toBe(false);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(0);
      expect(rateLimiter.getBlockedTimeRemaining(ip)).toBeGreaterThan(0);
    });

    it('should reset counter after window expires', async () => {
      const ip = '192.168.1.7';

      // Record 2 failures
      rateLimiter.recordFailure(ip);
      rateLimiter.recordFailure(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(3);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Record another failure - should start fresh
      rateLimiter.recordFailure(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(4);
    });
  });

  describe('reset()', () => {
    it('should reset counter after successful login', () => {
      const ip = '192.168.1.8';

      // Record 3 failures
      rateLimiter.recordFailure(ip);
      rateLimiter.recordFailure(ip);
      rateLimiter.recordFailure(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(2);

      // Successful login - reset
      rateLimiter.reset(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(5);
    });

    it('should unblock IP when reset', () => {
      const ip = '192.168.1.9';

      // Block the IP
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordFailure(ip);
      }
      expect(rateLimiter.check(ip)).toBe(false);

      // Reset
      rateLimiter.reset(ip);
      expect(rateLimiter.check(ip)).toBe(true);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(5);
    });
  });

  describe('getRemainingAttempts()', () => {
    it('should return max attempts for new IP', () => {
      const ip = '192.168.1.10';
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(5);
    });

    it('should return 0 when blocked', () => {
      const ip = '192.168.1.11';

      // Block the IP
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordFailure(ip);
      }

      expect(rateLimiter.getRemainingAttempts(ip)).toBe(0);
    });

    it('should return correct remaining attempts', () => {
      const ip = '192.168.1.12';

      expect(rateLimiter.getRemainingAttempts(ip)).toBe(5);

      rateLimiter.recordFailure(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(4);

      rateLimiter.recordFailure(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(3);

      rateLimiter.recordFailure(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(2);
    });
  });

  describe('getBlockedTimeRemaining()', () => {
    it('should return 0 for non-blocked IP', () => {
      const ip = '192.168.1.13';
      expect(rateLimiter.getBlockedTimeRemaining(ip)).toBe(0);
    });

    it('should return time remaining when blocked', () => {
      const ip = '192.168.1.14';

      // Block the IP
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordFailure(ip);
      }

      const timeRemaining = rateLimiter.getBlockedTimeRemaining(ip);
      expect(timeRemaining).toBeGreaterThan(0);
      expect(timeRemaining).toBeLessThanOrEqual(2000); // Block duration
    });

    it('should return 0 after block expires', async () => {
      const ip = '192.168.1.15';

      // Block the IP
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordFailure(ip);
      }

      // Wait for block to expire
      await new Promise(resolve => setTimeout(resolve, 2100));

      expect(rateLimiter.getBlockedTimeRemaining(ip)).toBe(0);
    });
  });

  describe('cleanup()', () => {
    it('should clean up expired entries', async () => {
      const ip1 = '192.168.1.16';
      const ip2 = '192.168.1.17';

      // Record failures for both IPs
      rateLimiter.recordFailure(ip1);
      rateLimiter.recordFailure(ip2);

      expect(rateLimiter.getTrackedCount()).toBe(2);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Trigger cleanup by checking (which calls cleanup internally)
      rateLimiter.check(ip1);

      // After some time, expired entries should be cleaned up
      // Note: Cleanup runs periodically, so we need to wait or trigger it
      await new Promise(resolve => setTimeout(resolve, 100));

      // Both should be cleaned up when checked
      expect(rateLimiter.check(ip1)).toBe(true);
      expect(rateLimiter.check(ip2)).toBe(true);
    });
  });

  describe('sliding window behavior', () => {
    it('should implement sliding window correctly', async () => {
      const ip = '192.168.1.18';

      // Record 3 failures
      rateLimiter.recordFailure(ip);
      rateLimiter.recordFailure(ip);
      rateLimiter.recordFailure(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(2);

      // Wait half the window time
      await new Promise(resolve => setTimeout(resolve, 500));

      // Record 2 more failures (total 5, should block)
      rateLimiter.recordFailure(ip);
      rateLimiter.recordFailure(ip);
      expect(rateLimiter.check(ip)).toBe(false);

      // Should still be blocked immediately after
      expect(rateLimiter.check(ip)).toBe(false);

      // Wait for block to expire (2 seconds + buffer)
      await new Promise(resolve => setTimeout(resolve, 2100));

      // Should be allowed again
      expect(rateLimiter.check(ip)).toBe(true);
    });
  });

  describe('configuration', () => {
    it('should use default configuration when not provided', () => {
      const defaultLimiter = new RateLimiter();
      const ip = '192.168.1.19';

      // Should allow 5 attempts by default
      for (let i = 0; i < 4; i++) {
        expect(defaultLimiter.check(ip)).toBe(true);
        defaultLimiter.recordFailure(ip);
      }

      expect(defaultLimiter.getRemainingAttempts(ip)).toBe(1);
      defaultLimiter.stopCleanup();
    });

    it('should use custom configuration when provided', () => {
      const customLimiter = new RateLimiter({
        maxAttempts: 3,
        windowMs: 500,
        blockDurationMs: 1000,
      });
      const ip = '192.168.1.20';

      // Should allow only 3 attempts
      customLimiter.recordFailure(ip);
      customLimiter.recordFailure(ip);
      expect(customLimiter.getRemainingAttempts(ip)).toBe(1);

      customLimiter.recordFailure(ip);
      expect(customLimiter.check(ip)).toBe(false);

      customLimiter.stopCleanup();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid successive failures', () => {
      const ip = '192.168.1.21';

      // Rapidly record 10 failures
      for (let i = 0; i < 10; i++) {
        rateLimiter.recordFailure(ip);
      }

      // Should be blocked
      expect(rateLimiter.check(ip)).toBe(false);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(0);
    });

    it('should handle empty IP string', () => {
      const ip = '';

      expect(rateLimiter.check(ip)).toBe(true);
      rateLimiter.recordFailure(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(4);
    });

    it('should handle IPv6 addresses', () => {
      const ip = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';

      expect(rateLimiter.check(ip)).toBe(true);
      rateLimiter.recordFailure(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(4);
    });

    it('should handle concurrent access to same IP', () => {
      const ip = '192.168.1.22';

      // Simulate concurrent failures
      rateLimiter.recordFailure(ip);
      rateLimiter.recordFailure(ip);
      rateLimiter.recordFailure(ip);

      // All checks should be consistent
      expect(rateLimiter.check(ip)).toBe(true);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(2);
    });
  });

  describe('memory management', () => {
    it('should track multiple IPs', () => {
      const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3'];

      ips.forEach(ip => {
        rateLimiter.recordFailure(ip);
      });

      expect(rateLimiter.getTrackedCount()).toBe(3);
    });

    it('should clear all tracked IPs', () => {
      const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3'];

      ips.forEach(ip => {
        rateLimiter.recordFailure(ip);
      });

      expect(rateLimiter.getTrackedCount()).toBe(3);

      rateLimiter.clear();
      expect(rateLimiter.getTrackedCount()).toBe(0);
    });
  });
});
