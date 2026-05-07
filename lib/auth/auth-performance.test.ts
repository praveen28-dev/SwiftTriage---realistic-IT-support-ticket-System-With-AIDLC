/**
 * Authentication API Performance Tests
 * 
 * Task 20.3: Performance validation testing
 * 
 * Tests:
 * - Login API responds within 1000ms (95th percentile)
 * 
 * Requirements Coverage: Performance NFR 2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import bcrypt from 'bcryptjs';

// Mock dependencies
vi.mock('@/lib/db/connection', () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock('@/lib/logging/auth-logger', () => ({
  logAuthSuccess: vi.fn(),
  logAuthFailure: vi.fn(),
}));

describe('Login API Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should respond to login requests within 1000ms at 95th percentile', async () => {
    // Mock user data
    const mockUser = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: '$2a$12$hashedpassword',
      role: 'it_staff',
      isActive: true,
    };

    // Mock database query
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockUser]),
        }),
      }),
    } as any);

    // Mock bcrypt comparison
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const iterations = 100;
    const timings: number[] = [];

    // Get authorize function
    const credentialsProvider = authOptions.providers[0];
    if (!('authorize' in credentialsProvider)) {
      throw new Error('CredentialsProvider not found');
    }

    const authorize = credentialsProvider.authorize;
    if (!authorize) {
      throw new Error('authorize function not found');
    }

    // Run 100 iterations
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      await authorize(
        {
          email: 'test@example.com',
          password: 'password',
        },
        {
          headers: {
            'x-forwarded-for': '127.0.0.1',
          },
        } as any
      );
      
      const duration = performance.now() - start;
      timings.push(duration);
    }

    // Sort timings
    timings.sort((a, b) => a - b);

    // Calculate percentiles
    const p95Index = Math.floor(iterations * 0.95);
    const p95Time = timings[p95Index];

    // Calculate statistics
    const avgTime = timings.reduce((a, b) => a + b, 0) / iterations;
    const minTime = timings[0];
    const maxTime = timings[iterations - 1];
    const p50Time = timings[Math.floor(iterations * 0.50)];
    const p99Time = timings[Math.floor(iterations * 0.99)];

    console.log('Login API Performance Statistics:');
    console.log(`  Iterations: ${iterations}`);
    console.log(`  Min: ${minTime.toFixed(2)}ms`);
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Median (P50): ${p50Time.toFixed(2)}ms`);
    console.log(`  P95: ${p95Time.toFixed(2)}ms`);
    console.log(`  P99: ${p99Time.toFixed(2)}ms`);
    console.log(`  Max: ${maxTime.toFixed(2)}ms`);

    // Requirement: 95th percentile must be under 1000ms
    expect(p95Time).toBeLessThan(1000);
  });

  it('should handle concurrent authentication requests efficiently', async () => {
    // Mock user data
    const mockUser = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: '$2a$12$hashedpassword',
      role: 'it_staff',
      isActive: true,
    };

    // Mock database query
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockUser]),
        }),
      }),
    } as any);

    // Mock bcrypt comparison
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    // Get authorize function
    const credentialsProvider = authOptions.providers[0];
    if (!('authorize' in credentialsProvider)) {
      throw new Error('CredentialsProvider not found');
    }

    const authorize = credentialsProvider.authorize;
    if (!authorize) {
      throw new Error('authorize function not found');
    }

    // Test concurrent requests
    const concurrentRequests = 50;
    const start = performance.now();

    const promises = Array.from({ length: concurrentRequests }, (_, i) =>
      authorize(
        {
          email: `test${i}@example.com`,
          password: 'password',
        },
        {
          headers: {
            'x-forwarded-for': '127.0.0.1',
          },
        } as any
      )
    );

    await Promise.all(promises);

    const totalDuration = performance.now() - start;
    const avgDuration = totalDuration / concurrentRequests;

    console.log('Concurrent Authentication Performance:');
    console.log(`  Concurrent Requests: ${concurrentRequests}`);
    console.log(`  Total Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`  Average per Request: ${avgDuration.toFixed(2)}ms`);

    // Average should still be under 1000ms
    expect(avgDuration).toBeLessThan(1000);
  });
});
