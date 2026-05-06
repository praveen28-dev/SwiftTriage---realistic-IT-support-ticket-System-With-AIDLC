/**
 * Audit Log API Route
 * GET: Returns recent audit log entries (sourced from activities table)
 * Requires ADMIN role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { activities } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { GetAuditLogResponse, AuditLogEntry } from '@/types/api';

/**
 * GET /api/audit-log
 * Returns recent audit log entries ordered by createdAt DESC.
 * Requires ADMIN role.
 */
export async function GET(request: NextRequest) {
  try {
    // Validate session and role
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse limit query param (default 10, max 100)
    const searchParams = request.nextUrl.searchParams;
    const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
    const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 10 : rawLimit), 100);

    // Query activities table as audit log source
    const rows = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);

    // Map Activity rows to AuditLogEntry shape
    const entries: AuditLogEntry[] = rows.map((row) => ({
      id: row.id,
      actionType: row.activityType,
      description: row.subject,
      performedBy: row.performedBy ?? 'System',
      timestamp: row.createdAt.toISOString(),
      metadata: row.description ? { details: row.description } : undefined,
    }));

    const response: GetAuditLogResponse = {
      entries,
      total: entries.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
