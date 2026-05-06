/**
 * User by ID API Route
 * PATCH: Update a user's role
 * Requires ADMIN role.
 *
 * TODO: Replace mock data with a real users table query once a users table
 * is added to the database schema.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UpdateUserRequest, UpdateUserResponse, User } from '@/types/api';

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
 * PATCH /api/users/[id]
 * Update a user's role.
 * Requires ADMIN role.
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
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in mock data
    const existingUser = MOCK_USERS.find((u) => u.id === params.id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const body: UpdateUserRequest = await request.json();
    const { role } = body;

    if (role !== 'ADMIN' && role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN or STAFF.' },
        { status: 400 }
      );
    }

    // TODO: Persist role change to database when users table is available
    const updatedUser: User = { ...existingUser, role };

    const response: UpdateUserResponse = {
      user: updatedUser,
      message: 'User role updated successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
