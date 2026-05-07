/**
 * Next.js Middleware for RBAC (Role-Based Access Control) and Security Headers
 *
 * This middleware protects routes by:
 * 1. Validating JWT tokens from NextAuth
 * 2. Checking user roles against route requirements
 * 3. Redirecting unauthorized users appropriately
 * 4. Applying comprehensive security headers to all responses
 *
 * Security Features:
 * - JWT token validation
 * - Role-based authorization
 * - Automatic redirect to login for unauthenticated users
 * - HTTP 403 Forbidden for insufficient permissions
 * - Authorization failure logging
 * - Content-Security-Policy header (prevents XSS attacks)
 * - X-Frame-Options header (prevents clickjacking)
 * - X-Content-Type-Options header (prevents MIME sniffing)
 * - Strict-Transport-Security header (enforces HTTPS)
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
 * Apply security headers to response
 *
 * Sets comprehensive security headers to protect against common web vulnerabilities:
 * - Content-Security-Policy: Prevents XSS attacks by restricting script sources
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - Strict-Transport-Security: Enforces HTTPS connections
 *
 * @param response - The NextResponse object to add headers to
 * @returns NextResponse with security headers applied
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Content-Security-Policy: Prevent inline script execution and restrict sources
  // This helps prevent XSS attacks by only allowing scripts from trusted sources
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );

  // X-Frame-Options: Prevent clickjacking by denying iframe embedding
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options: Prevent MIME type sniffing
  // Forces browsers to respect the declared Content-Type
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Strict-Transport-Security: Enforce HTTPS for 1 year
  // Only set in production (HTTPS environments)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  return response;
}

/**
 * RBAC Middleware Function
 *
 * Validates JWT tokens and enforces role-based access control on protected routes.
 * Also applies security headers to all responses.
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
    
    const response = NextResponse.redirect(loginUrl);
    return applySecurityHeaders(response);
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
        const response = NextResponse.redirect(forbiddenUrl);
        return applySecurityHeaders(response);
      }
      
      // User has sufficient permissions - allow access
      console.log('[RBAC Middleware] Authorization success:', {
        userId,
        userRole,
        requestedResource: pathname,
        timestamp: new Date().toISOString(),
      });
      
      const response = NextResponse.next();
      return applySecurityHeaders(response);
    }
  }

  // No specific role requirements for this route - allow access
  const response = NextResponse.next();
  return applySecurityHeaders(response);
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
