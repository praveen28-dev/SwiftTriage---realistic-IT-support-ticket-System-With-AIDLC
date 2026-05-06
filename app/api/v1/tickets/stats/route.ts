/**
 * Ticket Statistics API
 * Aggregated statistics grouped by various dimensions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { tickets } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * GET /api/v1/tickets/stats
 * Get ticket statistics grouped by specified dimension
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
    const groupBy = searchParams.get('group_by') || 'status';
    const sortOrder = searchParams.get('sort') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const dateRange = searchParams.get('date_range') || 'all';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const filtersParam = searchParams.get('filters');

    // Parse additional filters
    let additionalFilters = {};
    if (filtersParam) {
      try {
        additionalFilters = JSON.parse(filtersParam);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid filters JSON' },
          { status: 400 }
        );
      }
    }

    // Build date range filter
    const dateConditions = [];
    const now = new Date();
    
    if (dateRange === 'last_7_days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateConditions.push(gte(tickets.createdAt, sevenDaysAgo));
    } else if (dateRange === 'last_30_days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateConditions.push(gte(tickets.createdAt, thirtyDaysAgo));
    } else if (dateRange === 'last_90_days') {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      dateConditions.push(gte(tickets.createdAt, ninetyDaysAgo));
    } else if (dateRange === 'custom' && startDate && endDate) {
      dateConditions.push(gte(tickets.createdAt, new Date(startDate)));
      dateConditions.push(lte(tickets.createdAt, new Date(endDate)));
    }

    // Fetch all tickets with filters
    let query = db.select().from(tickets);
    
    if (dateConditions.length > 0) {
      query = query.where(and(...dateConditions)) as any;
    }

    const allTickets = await query;

    // Apply additional filters in memory
    let filteredTickets = allTickets;
    if (Object.keys(additionalFilters).length > 0) {
      filteredTickets = allTickets.filter(ticket => {
        return Object.entries(additionalFilters).every(([key, value]) => {
          return (ticket as any)[key] === value;
        });
      });
    }

    // Group and aggregate based on groupBy parameter
    let aggregatedData: any[] = [];

    switch (groupBy) {
      case 'status':
        aggregatedData = aggregateByStatus(filteredTickets);
        break;
      case 'tech_group':
        aggregatedData = aggregateByTechGroup(filteredTickets);
        break;
      case 'alert_level':
        aggregatedData = aggregateByAlertLevel(filteredTickets);
        break;
      case 'request_type':
        aggregatedData = aggregateByRequestType(filteredTickets);
        break;
      case 'alert_condition':
        aggregatedData = aggregateByAlertCondition(filteredTickets);
        break;
      case 'priority':
        aggregatedData = aggregateByPriority(filteredTickets);
        break;
      case 'category':
        aggregatedData = aggregateByCategory(filteredTickets);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid group_by parameter' },
          { status: 400 }
        );
    }

    // Sort results
    aggregatedData.sort((a, b) => {
      return sortOrder === 'asc' ? a.count - b.count : b.count - a.count;
    });

    // Apply limit
    if (limit > 0) {
      aggregatedData = aggregatedData.slice(0, limit);
    }

    // Calculate total
    const total = filteredTickets.length;

    // Add percentages
    aggregatedData = aggregatedData.map(item => ({
      ...item,
      percentage: total > 0 ? parseFloat(((item.count / total) * 100).toFixed(1)) : 0,
    }));

    return NextResponse.json({
      data: aggregatedData,
      total,
      group_by: groupBy,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching ticket statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket statistics' },
      { status: 500 }
    );
  }
}

// Aggregation helper functions

function aggregateByStatus(tickets: any[]) {
  const statusMap: Record<string, { count: number; color: string }> = {
    PENDING: { count: 0, color: '#17a2b8' },
    IN_PROGRESS: { count: 0, color: '#6f42c1' },
    RESOLVED: { count: 0, color: '#10b981' },
    CLOSED: { count: 0, color: '#fd7e14' },
    APPROVED: { count: 0, color: '#dc3545' },
    CANCELLED: { count: 0, color: '#ffc107' },
    ASSIGNED: { count: 0, color: '#28a745' },
    DENIED: { count: 0, color: '#f8d7da' },
  };

  tickets.forEach(ticket => {
    const status = ticket.status || 'PENDING';
    if (statusMap[status]) {
      statusMap[status].count++;
    } else {
      statusMap[status] = { count: 1, color: '#6c757d' };
    }
  });

  return Object.entries(statusMap)
    .filter(([_, data]) => data.count > 0)
    .map(([status, data]) => ({
      label: status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      value: status.toLowerCase(),
      count: data.count,
      color: data.color,
    }));
}

function aggregateByTechGroup(tickets: any[]) {
  const groupMap: Record<string, number> = {};

  tickets.forEach(ticket => {
    const group = ticket.assignedTo || 'Unassigned';
    groupMap[group] = (groupMap[group] || 0) + 1;
  });

  const colors = ['#1e3a8a', '#3b82f6', '#fd7e14', '#ffc107', '#10b981', '#28a745', '#dc3545', '#f8d7da', '#6f42c1', '#e83e8c'];

  return Object.entries(groupMap).map(([group, count], index) => ({
    label: group,
    value: group.toLowerCase().replace(/\s+/g, '_'),
    count,
    color: colors[index % colors.length],
  }));
}

function aggregateByAlertLevel(tickets: any[]) {
  const alertMap: Record<string, { count: number; color: string }> = {
    'No Alerts': { count: 0, color: '#1e3a8a' },
    'Second Alert Level': { count: 0, color: '#f97316' },
    'Third Alert Level': { count: 0, color: '#3b82f6' },
  };

  tickets.forEach(ticket => {
    // Calculate alert level based on urgency score
    if (ticket.urgencyScore >= 80) {
      alertMap['Third Alert Level'].count++;
    } else if (ticket.urgencyScore >= 50) {
      alertMap['Second Alert Level'].count++;
    } else {
      alertMap['No Alerts'].count++;
    }
  });

  return Object.entries(alertMap)
    .filter(([_, data]) => data.count > 0)
    .map(([level, data]) => ({
      label: level,
      value: level.toLowerCase().replace(/\s+/g, '_'),
      count: data.count,
      color: data.color,
    }));
}

function aggregateByRequestType(tickets: any[]) {
  const typeMap: Record<string, number> = {};

  tickets.forEach(ticket => {
    const type = ticket.category || 'Other';
    typeMap[type] = (typeMap[type] || 0) + 1;
  });

  const colors = ['#007bff', '#fd7e14', '#10b981', '#dc3545', '#17a2b8', '#ffc107', '#28a745', '#6f42c1'];

  return Object.entries(typeMap).map(([type, count], index) => ({
    label: type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    value: type.toLowerCase(),
    count,
    color: colors[index % colors.length],
  }));
}

function aggregateByAlertCondition(tickets: any[]) {
  const conditionMap: Record<string, { count: number; color: string }> = {
    'No Alerts': { count: 0, color: '#10b981' },
    'Not Completed': { count: 0, color: '#dc3545' },
  };

  tickets.forEach(ticket => {
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      conditionMap['No Alerts'].count++;
    } else if (ticket.urgencyScore >= 70) {
      conditionMap['Not Completed'].count++;
    } else {
      conditionMap['No Alerts'].count++;
    }
  });

  return Object.entries(conditionMap)
    .filter(([_, data]) => data.count > 0)
    .map(([condition, data]) => ({
      label: condition,
      value: condition.toLowerCase().replace(/\s+/g, '_'),
      count: data.count,
      color: data.color,
    }));
}

function aggregateByPriority(tickets: any[]) {
  const priorityMap: Record<string, { count: number; color: string }> = {
    Critical: { count: 0, color: '#dc3545' },
    High: { count: 0, color: '#fd7e14' },
    Medium: { count: 0, color: '#ffc107' },
    Low: { count: 0, color: '#10b981' },
  };

  tickets.forEach(ticket => {
    const priority = ticket.priority || 'Medium';
    if (priorityMap[priority]) {
      priorityMap[priority].count++;
    }
  });

  return Object.entries(priorityMap)
    .filter(([_, data]) => data.count > 0)
    .map(([priority, data]) => ({
      label: priority,
      value: priority.toLowerCase(),
      count: data.count,
      color: data.color,
    }));
}

function aggregateByCategory(tickets: any[]) {
  const categoryMap: Record<string, number> = {};

  tickets.forEach(ticket => {
    const category = ticket.category || 'Other';
    categoryMap[category] = (categoryMap[category] || 0) + 1;
  });

  const colors = ['#007bff', '#fd7e14', '#10b981', '#dc3545', '#17a2b8'];

  return Object.entries(categoryMap).map(([category, count], index) => ({
    label: category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    value: category.toLowerCase(),
    count,
    color: colors[index % colors.length],
  }));
}
