/**
 * Rate Limiter for Authentication
 * 
 * Implements sliding window rate limiting to prevent brute force attacks.
 * Tracks failed login attempts per IP address and blocks after threshold.
 * 
 * Configuration:
 * - Max attempts: 5
 * - Window: 15 minutes
 * - Block duration: 15 minutes
 */

import { logRateLimitBlocked } from '@/lib/logging/auth-logger';

export interface RateLimiterConfig {
  maxAttempts: number;      // Maximum failed attempts allowed
  windowMs: number;         // Time window in milliseconds
  blockDurationMs: number;  // How long to block after exceeding limit
}

interface AttemptRecord {
  count: number;            // Number of failed attempts
  resetAt: number;          // Timestamp when the window resets
  blockedUntil?: number;    // Timestamp when the block expires (if blocked)
}

export class RateLimiter {
  private attempts: Map<string, AttemptRecord>;
  private config: RateLimiterConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<RateLimiterConfig>) {
    this.attempts = new Map();
    this.config = {
      maxAttempts: config?.maxAttempts ?? 5,
      windowMs: config?.windowMs ?? 15 * 60 * 1000, // 15 minutes
      blockDurationMs: config?.blockDurationMs ?? 15 * 60 * 1000, // 15 minutes
    };

    // Start periodic cleanup of expired entries (every 5 minutes)
    this.startCleanup();
  }

  /**
   * Check if an IP address is allowed to make a request
   * @param ip - IP address to check
   * @returns true if allowed, false if blocked
   */
  check(ip: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(ip);

    // No record - allow
    if (!record) {
      return true;
    }

    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      // Log blocked attempt with structured logging
      const blockedMinutes = Math.ceil((record.blockedUntil - now) / 60000);
      logRateLimitBlocked(ip, record.count, blockedMinutes);
      return false;
    }

    // Check if window has expired
    if (now >= record.resetAt) {
      // Window expired - clean up and allow
      this.attempts.delete(ip);
      return true;
    }

    // Check if under limit
    return record.count < this.config.maxAttempts;
  }

  /**
   * Record a failed authentication attempt
   * @param ip - IP address that failed
   */
  recordFailure(ip: string): void {
    const now = Date.now();
    const record = this.attempts.get(ip);

    if (!record) {
      // First failure - create new record
      this.attempts.set(ip, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });
      return;
    }

    // Check if window has expired
    if (now >= record.resetAt) {
      // Window expired - reset counter
      this.attempts.set(ip, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });
      return;
    }

    // Increment counter
    record.count += 1;

    // If limit reached, set block
    if (record.count >= this.config.maxAttempts) {
      record.blockedUntil = now + this.config.blockDurationMs;
    }

    this.attempts.set(ip, record);
  }

  /**
   * Reset attempts for an IP (called on successful login)
   * @param ip - IP address to reset
   */
  reset(ip: string): void {
    this.attempts.delete(ip);
  }

  /**
   * Get the number of remaining attempts for an IP
   * @param ip - IP address to check
   * @returns number of attempts remaining, or 0 if blocked
   */
  getRemainingAttempts(ip: string): number {
    const now = Date.now();
    const record = this.attempts.get(ip);

    if (!record) {
      return this.config.maxAttempts;
    }

    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return 0;
    }

    // Check if window has expired
    if (now >= record.resetAt) {
      return this.config.maxAttempts;
    }

    return Math.max(0, this.config.maxAttempts - record.count);
  }

  /**
   * Get the time until an IP is unblocked (in milliseconds)
   * @param ip - IP address to check
   * @returns milliseconds until unblocked, or 0 if not blocked
   */
  getBlockedTimeRemaining(ip: string): number {
    const now = Date.now();
    const record = this.attempts.get(ip);

    if (!record || !record.blockedUntil) {
      return 0;
    }

    return Math.max(0, record.blockedUntil - now);
  }

  /**
   * Start periodic cleanup of expired entries
   * Runs every 5 minutes to prevent memory leaks
   */
  private startCleanup(): void {
    // Clean up every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);

    // Don't prevent Node.js from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Clean up expired entries from the attempts map
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [ip, record] of this.attempts.entries()) {
      // Remove if window expired and not blocked
      if (now >= record.resetAt && (!record.blockedUntil || now >= record.blockedUntil)) {
        toDelete.push(ip);
      }
    }

    for (const ip of toDelete) {
      this.attempts.delete(ip);
    }
  }

  /**
   * Stop the cleanup interval (for testing or shutdown)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get the current number of tracked IPs (for testing/monitoring)
   */
  getTrackedCount(): number {
    return this.attempts.size;
  }

  /**
   * Clear all tracked attempts (for testing)
   */
  clear(): void {
    this.attempts.clear();
  }
}

// Export a singleton instance with default configuration
export const rateLimiter = new RateLimiter();
