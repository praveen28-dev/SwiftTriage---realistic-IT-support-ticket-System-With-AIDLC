/**
 * Widget Configuration API
 * Manage user's dashboard widget configuration
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { widgetConfigs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for creating a widget
const createWidgetSchema = z.object({
  widgetType: z.string().min(1, 'Widget type is required'),
  title: z.string().min(1, 'Title is required'),
  gridPosition: z.number().int().min(0),
  gridColumn: z.number().int().min(1).max(3).default(1),
  gridRow: z.number().int().min(1).default(1),
  queryConfig: z.string().optional(),
  isVisible: z.boolean().default(true),
});

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
 * GET /api/v1/dashboard/widgets
 * Get user's widget configuration
 */
export async function GET(request: NextRequest) {
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

    // Fetch user's widgets
    const userWidgets = await db
      .select()
      .from(widgetConfigs)
      .where(eq(widgetConfigs.userId, userId))
      .orderBy(widgetConfigs.gridPosition);

    // Parse queryConfig JSON strings
    const formattedWidgets = userWidgets.map(widget => ({
      ...widget,
      queryConfig: widget.queryConfig ? JSON.parse(widget.queryConfig) : null,
    }));

    return NextResponse.json({
      widgets: formattedWidgets,
      count: formattedWidgets.length,
    });
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch widgets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/dashboard/widgets
 * Create a new widget
 */
export async function POST(request: NextRequest) {
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
    const validatedData = createWidgetSchema.parse(body);

    // Create widget
    const [newWidget] = await db
      .insert(widgetConfigs)
      .values({
        userId,
        ...validatedData,
        updatedAt: new Date(),
      })
      .returning();

    // Parse queryConfig for response
    const formattedWidget = {
      ...newWidget,
      queryConfig: newWidget.queryConfig ? JSON.parse(newWidget.queryConfig) : null,
    };

    return NextResponse.json(
      { widget: formattedWidget },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating widget:', error);
    return NextResponse.json(
      { error: 'Failed to create widget' },
      { status: 500 }
    );
  }
}
