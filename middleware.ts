/**
 * Next.js Middleware for RBAC (Role-Based Access Control)
 *
 * This middleware protects routes by:
 * 1. Validating JWT tokens from NextAuth
 * 2. Checking user roles against route requirements
 * 3. Redirecting unauthorized users appropriately
 *
 * Security Features:
 * - JWT token validation
 * - Role-based authorization
 * - Automatic redirect to login for unauthenticated users
 * - HTTP 403 Forbidden for insufficient permissions
 * - Authorization failure logging
 *
 * @module middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Role requirements map for protected routes
 * Key: Route path prefix
 * Value: Array of roles allowed to access the route
 */
const roleRequirements: Record<string, string[]> = {
  '/dashboard/admin': ['ADMIN'],
  '/dashboard': ['it_staff', 'ADMIN'],
  '/submit': ['end_user', 'it_staff', 'ADMIN'],
  '/api/users': ['ADMIN'],
  '/api/tickets': ['it_staff', 'ADMIN'],
};

/**
 * RBAC Middleware Function
 *
 * Validates JWT tokens and enforces role-based access control on protected routes.
 *
 * @param request - The incoming Next.js request
 * @returns NextResponse - Either allows access, redirects to login, or returns 403
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get JWT token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if user is authenticated
  if (!token) {
    // User is not authenticated - redirect to login with callback URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    
    console.log('[RBAC Middleware] Unauthenticated access attempt:', {
      pathname,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.redirect(loginUrl);
  }

  // Extract user role from token
  const userRole = token.role as string;
  const userId = token.userId as string;

  // Check role requirements for the requested route
  for (const [route, allowedRoles] of Object.entries(roleRequirements)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        // User has insufficient permissions - log and return 403
        console.error('[RBAC Middleware] Authorization failure:', {
          userId,
          userRole,
          requestedResource: pathname,
          requiredRoles: allowedRoles,
          timestamp: new Date().toISOString(),
        });
        
        // Redirect to 403 Forbidden page
        const forbiddenUrl = new URL('/403', request.url);
        return NextResponse.redirect(forbiddenUrl);
      }
      
      // User has sufficient permissions - allow access
      console.log('[RBAC Middleware] Authorization success:', {
        userId,
        userRole,
        requestedResource: pathname,
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.next();
    }
  }

  // No specific role requirements for this route - allow access
  return NextResponse.next();
}

/**
 * Middleware configuration
 *
 * Specifies which routes should be protected by this middleware.
 * Uses Next.js matcher patterns to include protected routes.
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/submit/:path*',
    '/api/tickets/:path*',
    '/api/users/:path*',
  ],
};
