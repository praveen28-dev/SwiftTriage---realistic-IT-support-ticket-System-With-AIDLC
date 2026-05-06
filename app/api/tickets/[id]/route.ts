/**
 * Ticket by ID API Route
 * PATCH: Update ticket status, assignedTo, or priority
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { tickets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { UpdateTicketRequest, UpdateTicketResponse } from '@/types/api';

/**
 * PATCH /api/tickets/[id]
 * Update a ticket's status, assignedTo, or priority.
 * Requires it_staff or ADMIN role.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate session and role
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'it_staff' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: UpdateTicketRequest = await request.json();
    const { status, assignedTo, priority } = body;

    // Build update object — only include provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (status !== undefined) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (priority !== undefined) updateData.priority = priority;

    // Update ticket in database
    const [updatedTicket] = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, params.id))
      .returning();

    if (!updatedTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const response: UpdateTicketResponse = {
      ticket: updatedTicket,
      message: 'Ticket updated successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
