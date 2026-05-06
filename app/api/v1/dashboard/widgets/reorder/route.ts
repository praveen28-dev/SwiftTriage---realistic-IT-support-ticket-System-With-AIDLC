/**
 * Widget Reorder API
 * Update widget positions after drag-and-drop
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { widgetConfigs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for reordering widgets
const reorderSchema = z.object({
  widgets: z.array(
    z.object({
      id: z.string().uuid(),
      gridPosition: z.number().int().min(0),
    })
  ),
});

/**
 * PUT /api/v1/dashboard/widgets/reorder
 * Update positions of multiple widgets
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.email;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = reorderSchema.parse(body);

    // Update each widget's position
    const updatePromises = validatedData.widgets.map(({ id, gridPosition }) =>
      db
        .update(widgetConfigs)
        .set({
          gridPosition,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(widgetConfigs.id, id),
            eq(widgetConfigs.userId, userId)
          )
        )
        .returning()
    );

    const results = await Promise.all(updatePromises);

    // Filter out null results (widgets that don't belong to user)
    const updatedWidgets = results.filter(([widget]) => widget).map(([widget]) => widget);

    return NextResponse.json({
      message: 'Widgets reordered successfully',
      updated: updatedWidgets.length,
      widgets: updatedWidgets,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error reordering widgets:', error);
    return NextResponse.json(
      { error: 'Failed to reorder widgets' },
      { status: 500 }
    );
  }
}
