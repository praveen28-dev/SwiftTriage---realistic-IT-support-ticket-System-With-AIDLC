/**
 * Widget Detail API
 * Update and delete individual widgets
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { widgetConfigs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for updating a widget
const updateWidgetSchema = z.object({
  title: z.string().min(1).optional(),
  gridPosition: z.number().int().min(0).optional(),
  gridColumn: z.number().int().min(1).max(3).optional(),
  gridRow: z.number().int().min(1).optional(),
  queryConfig: z.string().optional(),
  isVisible: z.boolean().optional(),
});

/**
 * PUT /api/v1/dashboard/widgets/[id]
 * Update widget configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const widgetId = params.id;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateWidgetSchema.parse(body);

    // Update widget (only if it belongs to the user)
    const [updatedWidget] = await db
      .update(widgetConfigs)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(widgetConfigs.id, widgetId),
          eq(widgetConfigs.userId, userId)
        )
      )
      .returning();

    if (!updatedWidget) {
      return NextResponse.json(
        { error: 'Widget not found or access denied' },
        { status: 404 }
      );
    }

    // Parse queryConfig for response
    const formattedWidget = {
      ...updatedWidget,
      queryConfig: updatedWidget.queryConfig ? JSON.parse(updatedWidget.queryConfig) : null,
    };

    return NextResponse.json({ widget: formattedWidget });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating widget:', error);
    return NextResponse.json(
      { error: 'Failed to update widget' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/dashboard/widgets/[id]
 * Delete widget
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const widgetId = params.id;

    // Delete widget (only if it belongs to the user)
    const [deletedWidget] = await db
      .delete(widgetConfigs)
      .where(
        and(
          eq(widgetConfigs.id, widgetId),
          eq(widgetConfigs.userId, userId)
        )
      )
      .returning();

    if (!deletedWidget) {
      return NextResponse.json(
        { error: 'Widget not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Widget deleted successfully',
      widget: deletedWidget,
    });
  } catch (error) {
    console.error('Error deleting widget:', error);
    return NextResponse.json(
      { error: 'Failed to delete widget' },
      { status: 500 }
    );
  }
}
