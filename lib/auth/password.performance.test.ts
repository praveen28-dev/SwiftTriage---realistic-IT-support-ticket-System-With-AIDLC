/**
 * Password Hashing Performance Tests
 * 
 * Task 20.3: Performance validation testing
 * 
 * Tests:
 * - Password hashing completes within 500ms (95th percentile)
 * 
 * Requirements Coverage: Performance NFR 1
 */

import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('Password Hashing Performance', () => {
  it('should complete password hashing within 500ms at 95th percentile', async () => {
    const testPassword = 'SecureTestPassword123';
    const iterations = 100;
    const timings: number[] = [];

    // Run 100 iterations to get statistical data
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await hashPassword(testPassword);
      const duration = performance.now() - start;
      timings.push(duration);
    }

    // Sort timings to calculate percentiles
    timings.sort((a, b) => a - b);

    // Calculate 95th percentile
    const p95Index = Math.floor(iterations * 0.95);
    const p95Time = timings[p95Index];

    // Calculate statistics for reporting
    const avgTime = timings.reduce((a, b) => a + b, 0) / iterations;
    const minTime = timings[0];
    const maxTime = timings[iterations - 1];
    const p50Time = timings[Math.floor(iterations * 0.50)];
    const p99Time = timings[Math.floor(iterations * 0.99)];

    console.log('Password Hashing Performance Statistics:');
    console.log(`  Iterations: ${iterations}`);
    console.log(`  Min: ${minTime.toFixed(2)}ms`);
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Median (P50): ${p50Time.toFixed(2)}ms`);
    console.log(`  P95: ${p95Time.toFixed(2)}ms`);
    console.log(`  P99: ${p99Time.toFixed(2)}ms`);
    console.log(`  Max: ${maxTime.toFixed(2)}ms`);

    // Requirement: 95th percentile must be under 500ms
    expect(p95Time).toBeLessThan(500);
  });

  it('should complete password verification within 500ms at 95th percentile', async () => {
    const testPassword = 'SecureTestPassword123';
    const iterations = 100;
    const timings: number[] = [];

    // Pre-hash the password once
    const hash = await hashPassword(testPassword);

    // Run 100 iterations to get statistical data
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await verifyPassword(testPassword, hash);
      const duration = performance.now() - start;
      timings.push(duration);
    }

    // Sort timings to calculate percentiles
    timings.sort((a, b) => a - b);

    // Calculate 95th percentile
    const p95Index = Math.floor(iterations * 0.95);
    const p95Time = timings[p95Index];

    // Calculate statistics for reporting
    const avgTime = timings.reduce((a, b) => a + b, 0) / iterations;
    const minTime = timings[0];
    const maxTime = timings[iterations - 1];
    const p50Time = timings[Math.floor(iterations * 0.50)];

    console.log('Password Verification Performance Statistics:');
    console.log(`  Iterations: ${iterations}`);
    console.log(`  Min: ${minTime.toFixed(2)}ms`);
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Median (P50): ${p50Time.toFixed(2)}ms`);
    console.log(`  P95: ${p95Time.toFixed(2)}ms`);
    console.log(`  Max: ${maxTime.toFixed(2)}ms`);

    // Requirement: 95th percentile must be under 500ms
    expect(p95Time).toBeLessThan(500);
  });

  it('should maintain consistent performance across different password lengths', async () => {
    const passwords = [
      'Short1',           // 6 chars
      'Medium123',        // 9 chars
      'LongerPassword123', // 18 chars
      'VeryLongPasswordWithManyCharacters123456789', // 44 chars
    ];

    const timings: Record<string, number[]> = {};

    // Test each password length
    for (const password of passwords) {
      timings[password] = [];
      
      for (let i = 0; i < 20; i++) {
        const start = performance.now();
        await hashPassword(password);
        const duration = performance.now() - start;
        timings[password].push(duration);
      }
    }

    // Calculate average for each password length
    const averages = Object.entries(timings).map(([pwd, times]) => ({
      password: pwd,
      length: pwd.length,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
    }));

    console.log('Performance by Password Length:');
    averages.forEach(({ password, length, avgTime }) => {
      console.log(`  ${length} chars: ${avgTime.toFixed(2)}ms`);
    });

    // All should be under 500ms
    averages.forEach(({ avgTime }) => {
      expect(avgTime).toBeLessThan(500);
    });

    // Variance should be minimal (bcrypt hashes to fixed length)
    const times = averages.map(a => a.avgTime);
    const maxVariance = Math.max(...times) - Math.min(...times);
    
    // Variance should be less than 100ms (bcrypt is consistent)
    expect(maxVariance).toBeLessThan(100);
  });
});
