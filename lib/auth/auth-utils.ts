/**
 * Authentication Utility Functions
 *
 * Server-side helper functions for authentication and authorization.
 * These utilities provide convenient wrappers around NextAuth session management
 * and role-based access control.
 *
 * Security Features:
 * - Server-side only (uses getServerSession)
 * - Role-based authorization checks
 * - Type-safe session handling
 * - Throws errors for unauthorized access
 *
 * @module lib/auth/auth-utils
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Session } from 'next-auth';

/**
 * Extended session type with role information
 */
export type AuthSession = Session & {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: 'end_user' | 'it_staff' | 'ADMIN';
  };
};

/**
 * Get the current authenticated user session
 *
 * This function retrieves the session for the currently authenticated user.
 * It should only be called from server-side code (API routes, Server Components, Server Actions).
 *
 * @returns Promise resolving to the session object if authenticated, null otherwise
 *
 * @example
 * ```typescript
 * // In a Server Component
 * const session = await getAuthSession();
 * if (session) {
 *   console.log('User:', session.user.email);
 *   console.log('Role:', session.user.role);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // In an API route
 * export async function GET(request: Request) {
 *   const session = await getAuthSession();
 *   if (!session) {
 *     return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   // ... handle authenticated request
 * }
 * ```
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  return session as AuthSession | null;
}

/**
 * Require authentication - throws if user is not authenticated
 *
 * This function ensures the user is authenticated before proceeding.
 * If no valid session exists, it throws an error that should be caught
 * and handled appropriately (e.g., return 401 Unauthorized).
 *
 * @returns Promise resolving to the authenticated session
 * @throws Error with message 'Unauthorized' if no valid session exists
 *
 * @example
 * ```typescript
 * // In an API route
 * export async function POST(request: Request) {
 *   try {
 *     const session = await requireAuth();
 *     // User is authenticated, proceed with logic
 *     return Response.json({ userId: session.user.id });
 *   } catch (error) {
 *     return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // In a Server Action
 * export async function updateProfile(data: ProfileData) {
 *   const session = await requireAuth();
 *   // Update profile for session.user.id
 * }
 * ```
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getAuthSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

/**
 * Require specific role(s) - throws if user doesn't have required permissions
 *
 * This function ensures the user is authenticated AND has one of the allowed roles.
 * If the user is not authenticated or doesn't have sufficient permissions,
 * it throws an appropriate error.
 *
 * @param allowedRoles - Array of roles that are permitted to access the resource
 * @returns Promise resolving to the authenticated session with verified role
 * @throws Error with message 'Unauthorized' if not authenticated
 * @throws Error with message 'Forbidden' if authenticated but insufficient role
 *
 * @example
 * ```typescript
 * // Require IT staff or admin access
 * export async function GET(request: Request) {
 *   try {
 *     const session = await requireRole(['it_staff', 'ADMIN']);
 *     // User has required role, proceed
 *     return Response.json({ data: sensitiveData });
 *   } catch (error) {
 *     if (error.message === 'Unauthorized') {
 *       return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *     }
 *     return Response.json({ error: 'Forbidden' }, { status: 403 });
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Require admin-only access
 * export async function DELETE(request: Request) {
 *   try {
 *     await requireRole(['ADMIN']);
 *     // Admin-only logic
 *   } catch (error) {
 *     return Response.json({ error: error.message }, { status: 403 });
 *   }
 * }
 * ```
 */
export async function requireRole(
  allowedRoles: Array<'end_user' | 'it_staff' | 'ADMIN'>
): Promise<AuthSession> {
  const session = await requireAuth();
  const userRole = session.user.role;

  if (!allowedRoles.includes(userRole)) {
    throw new Error('Forbidden');
  }

  return session;
}
