/**
 * Customers API Route
 * GET: List all customers with pagination
 * POST: Create new customer
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { customers } from '@/lib/db/schema';
import { eq, desc, asc, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for creating a customer
const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  tier: z.enum(['Standard', 'Premium', 'Enterprise']).default('Standard'),
  annualRevenue: z.string().optional(),
  clientId: z.string().optional(),
  territory: z.string().optional(),
  primaryContact: z.string().optional(),
  cdiRating: z.number().min(0).max(100).default(0),
});

/**
 * GET /api/customers
 * List all customers with optional filtering and pagination
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const tier = searchParams.get('tier');
    const isActive = searchParams.get('isActive');

    // Build query
    let query = db.select().from(customers);

    // Apply filters
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          ilike(customers.name, `%${search}%`),
          ilike(customers.email, `%${search}%`),
          ilike(customers.company, `%${search}%`)
        )
      );
    }

    if (tier) {
      conditions.push(eq(customers.tier, tier));
    }

    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(customers.isActive, isActive === 'true'));
    }

    // Apply sorting
    const orderColumn = (customers as any)[sortBy] || customers.createdAt;
    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Execute query with pagination
    const offset = (page - 1) * limit;
    const results = await query
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db.select().from(customers).execute();

    return NextResponse.json({
      customers: results,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers
 * Create a new customer
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'it_staff') {
      return NextResponse.json(
        { error: 'Unauthorized - IT staff access required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCustomerSchema.parse(body);

    // Create customer
    const [newCustomer] = await db
      .insert(customers)
      .values({
        ...validatedData,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      { customer: newCustomer },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
