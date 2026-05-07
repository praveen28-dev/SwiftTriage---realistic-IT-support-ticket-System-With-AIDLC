/**
 * Users API Route
 * GET: Returns list of IT staff users
 * Requires ADMIN role.
 *
 * TODO: Replace mock data with a real users table query once a users table
 * is added to the database schema.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/auth-utils';
import { GetUsersResponse, User } from '@/types/api';

// TODO: Replace with database query when users table is available
const MOCK_USERS: User[] = [
  {
    id: 'it_admin',
    username: 'it_admin',
    role: 'ADMIN',
    email: 'it_admin@example.com',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'it_staff1',
    username: 'it_staff1',
    role: 'STAFF',
    email: 'it_staff1@example.com',
    createdAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'it_staff2',
    username: 'it_staff2',
    role: 'STAFF',
    email: 'it_staff2@example.com',
    createdAt: new Date('2024-02-01').toISOString(),
  },
];

/**
 * GET /api/users
 * Returns all IT staff users.
 * Requires ADMIN role.
 */
export async function GET() {
  try {
    // Validate session and require ADMIN role using auth utilities
    await requireRole(['ADMIN']);

    const response: GetUsersResponse = { users: MOCK_USERS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Handle authentication and authorization errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
