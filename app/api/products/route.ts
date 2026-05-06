/**
 * Products API Route
 * GET: List all products
 * POST: Create new product
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { products } from '@/lib/db/schema';
import { eq, desc, asc, ilike } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for creating a product
const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  price: z.string().optional(),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/products
 * List all products with optional filtering and pagination
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
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = db.select().from(products);

    // Apply filters
    const conditions = [];

    if (search) {
      conditions.push(
        ilike(products.name, `%${search}%`)
      );
    }

    if (category) {
      conditions.push(eq(products.category, category));
    }

    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(products.isActive, isActive === 'true'));
    }

    // Apply sorting
    const orderColumn = (products as any)[sortBy] || products.createdAt;
    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Execute query with pagination
    const offset = (page - 1) * limit;
    const results = await query
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db.select().from(products).execute();

    return NextResponse.json({
      products: results,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product
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
    const validatedData = createProductSchema.parse(body);

    // Create product
    const [newProduct] = await db
      .insert(products)
      .values(validatedData)
      .returning();

    return NextResponse.json(
      { product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
