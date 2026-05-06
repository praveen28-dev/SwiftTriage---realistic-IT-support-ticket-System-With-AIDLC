/**
 * Activity Feed API
 * Real-time feed of ticket activities and changes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { activities, tickets } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

/**
 * GET /api/v1/activity-feed
 * Get recent activity feed with pagination
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
    const limit = parseInt(searchParams.get('limit') || '5');
    const offset = parseInt(searchParams.get('offset') || '0');
    const ticketId = searchParams.get('ticket_id');
    const userId = searchParams.get('user_id');
    const actionTypesParam = searchParams.get('action_types');

    // Build query conditions
    const conditions = [];

    if (ticketId) {
      conditions.push(eq(activities.ticketId, ticketId));
    }

    if (userId) {
      conditions.push(eq(activities.performedBy, userId));
    }

    // Fetch activities
    let query = db
      .select({
        activity: activities,
        ticket: tickets,
      })
      .from(activities)
      .leftJoin(tickets, eq(activities.ticketId, tickets.id))
      .orderBy(desc(activities.createdAt))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query;

    // Filter by action types if specified
    let filteredResults = results;
    if (actionTypesParam) {
      const actionTypes = actionTypesParam.split(',').map(t => t.trim());
      filteredResults = results.filter(r => 
        actionTypes.includes(r.activity.activityType)
      );
    }

    // Get total count for pagination
    const totalQuery = db.select().from(activities);
    const totalResults = await (conditions.length > 0 
      ? totalQuery.where(and(...conditions))
      : totalQuery);
    const total = totalResults.length;

    // Format activities for response
    const formattedActivities = filteredResults.map(({ activity, ticket }) => {
      const createdAt = new Date(activity.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let relativeTime = '';
      if (diffMins < 1) {
        relativeTime = 'just now';
      } else if (diffMins < 60) {
        relativeTime = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        relativeTime = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        relativeTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else {
        relativeTime = createdAt.toLocaleDateString();
      }

      // Generate ticket number (first 8 chars of ID)
      const ticketNumber = ticket?.id ? `#${ticket.id.slice(0, 8)}` : '#N/A';

      // Determine if activity is expandable (has description)
      const isExpandable = !!activity.description && activity.description.length > 100;

      return {
        id: activity.id,
        ticket_id: activity.ticketId || '',
        ticket_number: ticketNumber,
        action_type: activity.activityType,
        action_detail: activity.subject,
        comment_snippet: activity.description?.slice(0, 100),
        user_id: activity.performedBy || '',
        user_name: activity.performedBy || 'System',
        user_avatar: null, // Could be populated from user table
        timestamp: activity.createdAt.toISOString(),
        relative_time: relativeTime,
        is_expandable: isExpandable,
        expanded_content: isExpandable ? activity.description : null,
      };
    });

    return NextResponse.json({
      activities: formattedActivities,
      total,
      has_more: offset + limit < total,
      next_offset: offset + limit,
    });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
