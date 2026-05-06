/**
 * Dashboard Statistics API Route
 * GET: Aggregated statistics for dashboard
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { tickets, customers, activities } from '@/lib/db/schema';
import { eq, count, sql } from 'drizzle-orm';

/**
 * GET /api/dashboard
 * Get aggregated dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'it_staff') {
      return NextResponse.json(
        { error: 'Unauthorized - IT staff access required' },
        { status: 401 }
      );
    }

    // Fetch all tickets for calculations
    const allTickets = await db.select().from(tickets);

    // Calculate ticket statistics
    const totalTickets = allTickets.length;
    const openTickets = allTickets.filter(t => 
      t.status === 'PENDING' || t.status === 'IN_PROGRESS'
    ).length;
    const closedTickets = allTickets.filter(t => 
      t.status === 'RESOLVED' || t.status === 'CLOSED'
    ).length;
    const inProgressTickets = allTickets.filter(t => 
      t.status === 'IN_PROGRESS'
    ).length;
    const criticalTickets = allTickets.filter(t => 
      t.priority === 'Critical'
    ).length;

    // Calculate average urgency score
    const avgUrgencyScore = totalTickets > 0
      ? allTickets.reduce((sum, t) => sum + t.urgencyScore, 0) / totalTickets
      : 0;

    // Calculate average resolution time (for resolved tickets)
    const resolvedTickets = allTickets.filter(t => t.resolvedAt);
    let avgResolutionTimeHours = 0;
    
    if (resolvedTickets.length > 0) {
      const totalResolutionTime = resolvedTickets.reduce((sum, t) => {
        const created = new Date(t.createdAt).getTime();
        const resolved = new Date(t.resolvedAt!).getTime();
        return sum + (resolved - created);
      }, 0);
      
      avgResolutionTimeHours = totalResolutionTime / resolvedTickets.length / (1000 * 60 * 60);
    }

    // Fetch customer count
    const allCustomers = await db.select().from(customers);
    const totalCustomers = allCustomers.length;
    const activeCustomers = allCustomers.filter(c => c.isActive).length;

    // Calculate average CDI rating
    const avgCDIRating = totalCustomers > 0
      ? allCustomers.reduce((sum, c) => sum + (c.cdiRating || 0), 0) / totalCustomers
      : 0;

    // Fetch recent activities count
    const recentActivities = await db
      .select()
      .from(activities)
      .limit(100);

    // Ticket distribution by category
    const categoryDistribution = allTickets.reduce((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Ticket distribution by priority
    const priorityDistribution = allTickets.reduce((acc, ticket) => {
      const priority = ticket.priority || 'Medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Tickets by status
    const statusDistribution = allTickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      tickets: {
        total: totalTickets,
        open: openTickets,
        closed: closedTickets,
        inProgress: inProgressTickets,
        critical: criticalTickets,
        avgUrgencyScore: Math.round(avgUrgencyScore * 10) / 10,
        avgResolutionTimeHours: Math.round(avgResolutionTimeHours * 10) / 10,
        byCategory: categoryDistribution,
        byPriority: priorityDistribution,
        byStatus: statusDistribution,
      },
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        avgCDIRating: Math.round(avgCDIRating * 10) / 10,
      },
      activities: {
        recentCount: recentActivities.length,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
