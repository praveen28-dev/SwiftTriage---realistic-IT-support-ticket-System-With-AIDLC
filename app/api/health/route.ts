/**
 * Health Check API Route
 * GET: Returns connectivity status for Groq API and Neon DB
 * Always returns HTTP 200; service failures are encoded in the response body.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { sql } from 'drizzle-orm';
import { config } from '@/lib/config';
import { GetHealthResponse, HealthStatus } from '@/types/api';

/**
 * Check Groq API connectivity by attempting a lightweight models list request.
 */
async function checkGroq(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.groq.apiKey}`,
      },
      // Short timeout so health checks don't hang
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - start;

    if (!response.ok) {
      return {
        service: 'groq',
        status: 'degraded',
        lastCheck: new Date().toISOString(),
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }

    return {
      service: 'groq',
      status: 'connected',
      lastCheck: new Date().toISOString(),
      responseTime,
    };
  } catch (err) {
    return {
      service: 'groq',
      status: 'disconnected',
      lastCheck: new Date().toISOString(),
      responseTime: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Check Neon DB connectivity by running SELECT 1.
 */
async function checkDatabase(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    const responseTime = Date.now() - start;

    return {
      service: 'database',
      status: 'connected',
      lastCheck: new Date().toISOString(),
      responseTime,
    };
  } catch (err) {
    return {
      service: 'database',
      status: 'disconnected',
      lastCheck: new Date().toISOString(),
      responseTime: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * GET /api/health
 * Returns health status for Groq API and Neon DB.
 * Always HTTP 200 — failures are in the response body.
 */
export async function GET() {
  const [groq, database] = await Promise.all([checkGroq(), checkDatabase()]);

  const response: GetHealthResponse = { groq, database };

  return NextResponse.json(response, { status: 200 });
}
