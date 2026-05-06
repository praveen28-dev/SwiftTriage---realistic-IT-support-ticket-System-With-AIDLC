/**
 * Customer Detail API Route
 * GET: Get customer by ID with related data
 * PUT: Update customer
 * DELETE: Delete customer
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/connection';
import { customers, tickets, activities, customerProducts, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for updating a customer
const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  logoUrl: z.string().optional(),
  tier: z.enum(['Standard', 'Premium', 'Enterprise']).optional(),
  annualRevenue: z.string().optional(),
  clientId: z.string().optional(),
  territory: z.string().optional(),
  primaryContact: z.string().optional(),
  cdiRating: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/customers/[id]
 * Get customer details with related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'it_staff') {
      return NextResponse.json(
        { error: 'Unauthorized - IT staff access required' },
        { status: 401 }
      );
    }

    const customerId = params.id;

    // Fetch customer
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Fetch related tickets
    const customerTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.customerId, customerId));

    // Fetch related activities
    const customerActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.customerId, customerId));

    // Fetch related products
    const customerProductsData = await db
      .select({
        id: customerProducts.id,
        quantity: customerProducts.quantity,
        purchaseDate: customerProducts.purchaseDate,
        product: products,
      })
      .from(customerProducts)
      .leftJoin(products, eq(customerProducts.productId, products.id))
      .where(eq(customerProducts.customerId, customerId));

    return NextResponse.json({
      customer,
      tickets: customerTickets,
      activities: customerActivities,
      products: customerProductsData,
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/customers/[id]
 * Update customer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'it_staff') {
      return NextResponse.json(
        { error: 'Unauthorized - IT staff access required' },
        { status: 401 }
      );
    }

    const customerId = params.id;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateCustomerSchema.parse(body);

    // Update customer
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId))
      .returning();

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer: updatedCustomer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete customer (soft delete by setting isActive to false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'it_staff') {
      return NextResponse.json(
        { error: 'Unauthorized - IT staff access required' },
        { status: 401 }
      );
    }

    const customerId = params.id;

    // Soft delete by setting isActive to false
    const [deletedCustomer] = await db
      .update(customers)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId))
      .returning();

    if (!deletedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Customer deleted successfully',
      customer: deletedCustomer,
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
