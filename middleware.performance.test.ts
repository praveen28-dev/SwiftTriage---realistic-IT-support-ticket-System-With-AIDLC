/**
 * RBAC Middleware Performance Tests
 * 
 * Task 20.3: Performance validation testing
 * 
 * Tests:
 * - RBAC middleware validates within 50ms (95th percentile)
 * 
 * Requirements Coverage: Performance NFR 3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import * as nextAuthJwt from 'next-auth/jwt';

// Mock next-auth/jwt
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

// Mock logging
vi.mock('@/lib/logging/auth-logger', () => ({
  logAuthorizationFailure: vi.fn(),
}));

describe('RBAC Middleware Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate tokens and authorize within 50ms at 95th percentile', async () => {
    // Mock valid token
    vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
      role: 'it_staff',
      userId: 'test-user-id',
      email: 'test@example.com',
    } as any);

    const iterations = 100;
    const timings: number[] = [];

    // Run 100 iterations
    for (let i = 0; i < iterations; i++) {
      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      const start = performance.now();
      await middleware(request);
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

    console.log('RBAC Middleware Performance Statistics:');
    console.log(`  Iterations: ${iterations}`);
    console.log(`  Min: ${minTime.toFixed(2)}ms`);
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Median (P50): ${p50Time.toFixed(2)}ms`);
    console.log(`  P95: ${p95Time.toFixed(2)}ms`);
    console.log(`  P99: ${p99Time.toFixed(2)}ms`);
    console.log(`  Max: ${maxTime.toFixed(2)}ms`);

    // Requirement: 95th percentile must be under 50ms
    expect(p95Time).toBeLessThan(50);
  });

  it('should handle authorization checks efficiently for different routes', async () => {
    // Mock valid token
    vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
      role: 'ADMIN',
      userId: 'admin-user-id',
      email: 'admin@example.com',
    } as any);

    const routes = [
      '/dashboard',
      '/dashboard/admin',
      '/submit',
      '/api/tickets',
      '/api/users',
    ];

    const timings: Record<string, number[]> = {};

    // Test each route
    for (const route of routes) {
      timings[route] = [];

      for (let i = 0; i < 20; i++) {
        const request = new NextRequest(
          new URL(`http://localhost:3000${route}`)
        );

        const start = performance.now();
        await middleware(request);
        const duration = performance.now() - start;
        
        timings[route].push(duration);
      }
    }

    // Calculate averages
    const averages = Object.entries(timings).map(([route, times]) => ({
      route,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      maxTime: Math.max(...times),
    }));

    console.log('Performance by Route:');
    averages.forEach(({ route, avgTime, maxTime }) => {
      console.log(`  ${route}: avg=${avgTime.toFixed(2)}ms, max=${maxTime.toFixed(2)}ms`);
    });

    // All routes should be under 50ms average
    averages.forEach(({ avgTime }) => {
      expect(avgTime).toBeLessThan(50);
    });
  });

  it('should handle concurrent authorization requests efficiently', async () => {
    // Mock valid token
    vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
      role: 'it_staff',
      userId: 'test-user-id',
      email: 'test@example.com',
    } as any);

    const concurrentRequests = 100;
    const start = performance.now();

    const promises = Array.from({ length: concurrentRequests }, (_, i) => {
      const request = new NextRequest(
        new URL(`http://localhost:3000/dashboard?req=${i}`)
      );
      return middleware(request);
    });

    await Promise.all(promises);

    const totalDuration = performance.now() - start;
    const avgDuration = totalDuration / concurrentRequests;

    console.log('Concurrent Authorization Performance:');
    console.log(`  Concurrent Requests: ${concurrentRequests}`);
    console.log(`  Total Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`  Average per Request: ${avgDuration.toFixed(2)}ms`);

    // Average should be under 50ms
    expect(avgDuration).toBeLessThan(50);
  });

  it('should maintain performance under different authorization scenarios', async () => {
    const scenarios = [
      {
        name: 'Authenticated with sufficient role',
        token: { role: 'it_staff', userId: 'user1', email: 'user1@example.com' },
        route: '/dashboard',
      },
      {
        name: 'Authenticated with insufficient role',
        token: { role: 'end_user', userId: 'user2', email: 'user2@example.com' },
        route: '/dashboard',
      },
      {
        name: 'Unauthenticated',
        token: null,
        route: '/dashboard',
      },
      {
        name: 'ADMIN accessing protected route',
        token: { role: 'ADMIN', userId: 'admin', email: 'admin@example.com' },
        route: '/dashboard/admin',
      },
    ];

    const results: Array<{ name: string; avgTime: number }> = [];

    for (const scenario of scenarios) {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue(scenario.token as any);

      const timings: number[] = [];

      for (let i = 0; i < 20; i++) {
        const request = new NextRequest(
          new URL(`http://localhost:3000${scenario.route}`)
        );

        const start = performance.now();
        await middleware(request);
        const duration = performance.now() - start;
        
        timings.push(duration);
      }

      const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
      results.push({ name: scenario.name, avgTime });
    }

    console.log('Performance by Authorization Scenario:');
    results.forEach(({ name, avgTime }) => {
      console.log(`  ${name}: ${avgTime.toFixed(2)}ms`);
    });

    // All scenarios should be under 50ms
    results.forEach(({ avgTime }) => {
      expect(avgTime).toBeLessThan(50);
    });
  });
});
