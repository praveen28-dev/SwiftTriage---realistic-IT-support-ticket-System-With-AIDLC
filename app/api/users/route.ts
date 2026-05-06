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
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
    // Validate session and role
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response: GetUsersResponse = { users: MOCK_USERS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
