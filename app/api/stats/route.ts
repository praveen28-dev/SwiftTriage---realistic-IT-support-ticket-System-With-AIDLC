/**
 * Statistics API Route
 * Provides ticket statistics for dashboard
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { tickets } from '@/lib/db/schema';
import { createErrorResponse, logError } from '@/lib/utils/errors';
import { count, avg, sql } from 'drizzle-orm';

/**
 * GET /api/stats
 * Retrieve ticket statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication (IT staff only)
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'it_staff') {
      return createErrorResponse('Unauthorized', 401);
    }

    // Get total ticket count
    const [totalResult] = await db
      .select({ count: count() })
      .from(tickets);

    // Get category distribution
    const categoryStats = await db
      .select({
        category: tickets.category,
        count: count(),
      })
      .from(tickets)
      .groupBy(tickets.category);

    // Get urgency distribution
    const urgencyStats = await db
      .select({
        urgency: tickets.urgencyScore,
        count: count(),
      })
      .from(tickets)
      .groupBy(tickets.urgencyScore)
      .orderBy(tickets.urgencyScore);

    // Get status distribution
    const statusStats = await db
      .select({
        status: tickets.status,
        count: count(),
      })
      .from(tickets)
      .groupBy(tickets.status);

    // Calculate average urgency
    const [avgResult] = await db
      .select({
        average: avg(tickets.urgencyScore),
      })
      .from(tickets);

    return NextResponse.json({
      totalTickets: totalResult.count,
      categoryDistribution: categoryStats,
      urgencyDistribution: urgencyStats,
      averageUrgency: avgResult.average ? parseFloat(avgResult.average) : 0,
      statusDistribution: statusStats,
    });
  } catch (error) {
    logError(error as Error, { context: 'GET /api/stats' });
    return createErrorResponse('Failed to fetch statistics', 500);
  }
}
