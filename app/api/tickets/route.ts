/**
 * Tickets API Route
 * Handles ticket creation (POST) and retrieval (GET)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { tickets } from '@/lib/db/schema';
import { triageTicket } from '@/lib/services/groqService';
import { validateTicketSubmission, validateTicketFilters } from '@/lib/validation/schemas';
import { createErrorResponse, logError } from '@/lib/utils/errors';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';

/**
 * POST /api/tickets
 * Create new ticket with AI triage
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { userInput } = validateTicketSubmission(body);

    // Call Groq service for AI triage
    const triageResult = await triageTicket(userInput);

    // Insert ticket into database
    const [newTicket] = await db
      .insert(tickets)
      .values({
        userInput,
        category: triageResult.category,
        urgencyScore: triageResult.urgency_score,
        aiSummary: triageResult.ai_summary,
        status: triageResult.category === 'Uncategorized' ? 'PENDING_TRIAGE' : 'PENDING',
      })
      .returning();

    // Return ticket response
    return NextResponse.json(
      {
        ticketId: newTicket.id,
        category: newTicket.category,
        urgencyScore: newTicket.urgencyScore,
        aiSummary: newTicket.aiSummary,
        status: newTicket.status,
        createdAt: newTicket.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    logError(error as Error, { context: 'POST /api/tickets' });
    
    if ((error as any).name === 'ZodError') {
      return createErrorResponse('Invalid request body', 400);
    }
    
    return createErrorResponse('Failed to create ticket', 500);
  }
}

/**
 * GET /api/tickets
 * Retrieve tickets with filtering and sorting
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication (IT staff or ADMIN)
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'it_staff' && userRole !== 'ADMIN')) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const category = searchParams.get('category') || undefined;
    const urgency = searchParams.get('urgency') ? parseInt(searchParams.get('urgency')!) : undefined;
    const status = searchParams.get('status') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const sortBy = searchParams.get('sortBy') || 'urgencyScore';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build where clause
    const conditions = [];
    if (assignedTo) {
      conditions.push(eq(tickets.assignedTo, assignedTo));
    }
    if (category) {
      conditions.push(eq(tickets.category, category));
    }
    if (urgency) {
      conditions.push(eq(tickets.urgencyScore, urgency));
    }
    if (status) {
      conditions.push(eq(tickets.status, status));
    }
    if (dateFrom) {
      conditions.push(gte(tickets.createdAt, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(tickets.createdAt, new Date(dateTo)));
    }

    // Build order by clause
    const orderByColumn = sortBy === 'urgencyScore' ? tickets.urgencyScore :
                          sortBy === 'createdAt' ? tickets.createdAt :
                          sortBy === 'category' ? tickets.category :
                          tickets.status;
    const orderByFn = sortOrder === 'asc' ? asc : desc;

    // Execute query
    const results = await db
      .select()
      .from(tickets)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderByFn(orderByColumn));

    return NextResponse.json({
      tickets: results,
      total: results.length,
    });
  } catch (error) {
    logError(error as Error, { context: 'GET /api/tickets' });
    return createErrorResponse('Failed to fetch tickets', 500);
  }
}
