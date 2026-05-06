/**
 * Activities API Route
 * GET: List activities for customer/ticket
 * POST: Create new activity
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { activities } from '@/lib/db/schema';
import { eq, desc, and, or } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for creating an activity
const createActivitySchema = z.object({
  customerId: z.string().uuid().optional(),
  ticketId: z.string().uuid().optional(),
  activityType: z.enum(['Call', 'Email', 'Meeting', 'Note']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  performedBy: z.string().optional(),
}).refine(
  (data) => data.customerId || data.ticketId,
  { message: 'Either customerId or ticketId must be provided' }
);

/**
 * GET /api/activities
 * List activities with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const ticketId = searchParams.get('ticketId');
    const activityType = searchParams.get('activityType');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = db.select().from(activities);

    // Apply filters
    const conditions = [];

    if (customerId) {
      conditions.push(eq(activities.customerId, customerId));
    }

    if (ticketId) {
      conditions.push(eq(activities.ticketId, ticketId));
    }

    if (activityType) {
      conditions.push(eq(activities.activityType, activityType));
    }

    // Execute query
    const results = await query
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(activities.createdAt))
      .limit(limit);

    return NextResponse.json({ activities: results });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activities
 * Create a new activity
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createActivitySchema.parse(body);

    // Set performedBy to current user if not provided
    const performedBy = validatedData.performedBy || session.user?.name || 'Unknown';

    // Create activity
    const [newActivity] = await db
      .insert(activities)
      .values({
        ...validatedData,
        performedBy,
      })
      .returning();

    return NextResponse.json(
      { activity: newActivity },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
