/**
 * Integration Tests for RBAC Middleware
 *
 * Tests Next.js middleware for role-based access control including:
 * - JWT token validation
 * - Unauthenticated user redirection to login
 * - Role-based authorization checks
 * - HTTP 403 Forbidden for insufficient permissions
 * - CallbackUrl preservation for post-login redirection
 * - Authorization failure logging
 * - Route matching and protection
 *
 * Requirements Coverage:
 * - 5.5: Role extraction from JWT token
 * - 5.6: Role verification for authorization
 * - 5.7: HTTP 403 Forbidden for insufficient permissions
 * - 6.1: Authentication token validation
 * - 6.2: Role-based access control on protected routes
 * - 6.3: Preserve originally requested URL for post-login redirection
 * - 6.4: Route-level role requirements
 * - 6.5: Middleware execution before route handlers
 * - 6.6: Authorization failure logging
 * - 6.7: Support for both page routes and API routes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import * as nextAuthJwt from 'next-auth/jwt';

// Mock next-auth/jwt module
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

// Mock console methods to test logging
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('RBAC Middleware', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated Access', () => {
    it('should redirect unauthenticated user to login', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      const response = await middleware(request);

      expect(response.status).toBe(307); // Temporary redirect
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should preserve callbackUrl for post-login redirection', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard/admin')
      );

      const response = await middleware(request);

      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('callbackUrl=');
      expect(location).toContain('dashboard%2Fadmin');
    });

    it('should log unauthenticated access attempt', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      await middleware(request);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[RBAC Middleware] Unauthenticated access attempt:',
        expect.objectContaining({
          pathname: '/dashboard',
          timestamp: expect.any(String),
        })
      );
    });

    it('should redirect unauthenticated user accessing API route', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/tickets')
      );

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });
  });

  describe('Authenticated User with Sufficient Role', () => {
    it('should allow it_staff to access /dashboard', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'it_staff',
        userId: 'user-123',
        email: 'staff@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      const response = await middleware(request);

      // NextResponse.next() returns a response with no redirect
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });

    it('should allow ADMIN to access /dashboard', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'ADMIN',
        userId: 'admin-123',
        email: 'admin@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow ADMIN to access /dashboard/admin', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'ADMIN',
        userId: 'admin-123',
        email: 'admin@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard/admin')
      );

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow end_user to access /submit', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'end_user',
        userId: 'user-456',
        email: 'user@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/submit')
      );

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow it_staff to access /submit', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'it_staff',
        userId: 'staff-123',
        email: 'staff@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/submit')
      );

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow ADMIN to access /submit', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'ADMIN',
        userId: 'admin-123',
        email: 'admin@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/submit')
      );

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should log authorization success', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'it_staff',
        userId: 'user-123',
        email: 'staff@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      await middleware(request);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[RBAC Middleware] Authorization success:',
        expect.objectContaining({
          userId: 'user-123',
          userRole: 'it_staff',
          requestedResource: '/dashboard',
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('Authenticated User with Insufficient Role', () => {
    it('should return 403 for end_user accessing /dashboard', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'end_user',
        userId: 'user-456',
        email: 'user@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      const response = await middleware(request);

      expect(response.status).toBe(307); // Redirect to 403 page
      expect(response.headers.get('location')).toContain('/403');
    });

    it('should return 403 for it_staff accessing /dashboard/admin', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'it_staff',
        userId: 'staff-123',
        email: 'staff@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard/admin')
      );

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/403');
    });

    it('should return 403 for end_user accessing /dashboard/admin', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'end_user',
        userId: 'user-456',
        email: 'user@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard/admin')
      );

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/403');
    });

    it('should log authorization failure with user details', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'end_user',
        userId: 'user-456',
        email: 'user@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      await middleware(request);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[RBAC Middleware] Authorization failure:',
        expect.objectContaining({
          userId: 'user-456',
          userRole: 'end_user',
          requestedResource: '/dashboard',
          requiredRoles: ['it_staff', 'ADMIN'],
          timestamp: expect.any(String),
        })
      );
    });

    it('should return 403 for end_user accessing API tickets route', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'end_user',
        userId: 'user-456',
        email: 'user@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/tickets')
      );

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/403');
    });

    it('should return 403 for it_staff accessing API users route', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'it_staff',
        userId: 'staff-123',
        email: 'staff@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/users')
      );

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/403');
    });

    it('should return 403 for end_user accessing API users route', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'end_user',
        userId: 'user-456',
        email: 'user@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/users')
      );

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/403');
    });
  });

  describe('ADMIN Role Access', () => {
    it('should allow ADMIN to access all protected routes', async () => {
      const protectedRoutes = [
        '/dashboard',
        '/dashboard/admin',
        '/submit',
        '/api/tickets',
        '/api/users',
      ];

      for (const route of protectedRoutes) {
        vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
          role: 'ADMIN',
          userId: 'admin-123',
          email: 'admin@example.com',
        } as any);

        const request = new NextRequest(
          new URL(`http://localhost:3000${route}`)
        );

        const response = await middleware(request);

        expect(response.status).toBe(200);
      }
    });
  });

  describe('Route Matching', () => {
    it('should protect nested dashboard routes', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'end_user',
        userId: 'user-456',
        email: 'user@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard/my-tickets')
      );

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/403');
    });

    it('should protect nested API routes', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'end_user',
        userId: 'user-456',
        email: 'user@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/tickets/123')
      );

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/403');
    });

    it('should allow access to routes without specific role requirements', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'end_user',
        userId: 'user-456',
        email: 'user@example.com',
      } as any);

      // /submit allows end_user, so this should pass
      const request = new NextRequest(
        new URL('http://localhost:3000/submit')
      );

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('CallbackUrl Preservation', () => {
    it('should preserve full URL in callbackUrl parameter', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard/admin?tab=users')
      );

      const response = await middleware(request);

      const location = response.headers.get('location');
      expect(location).toContain('callbackUrl=');
      expect(location).toContain('dashboard%2Fadmin');
      expect(location).toContain('tab%3Dusers');
    });

    it('should preserve query parameters in callbackUrl', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard?filter=open&sort=priority')
      );

      const response = await middleware(request);

      const location = response.headers.get('location');
      expect(location).toContain('callbackUrl=');
      expect(location).toContain('filter%3Dopen');
      expect(location).toContain('sort%3Dpriority');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing role in token gracefully', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        userId: 'user-123',
        email: 'user@example.com',
        // role is missing
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      const response = await middleware(request);

      // Should redirect to 403 since role is undefined and won't match requirements
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/403');
    });

    it('should handle token with invalid role value', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'invalid_role',
        userId: 'user-123',
        email: 'user@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      const response = await middleware(request);

      // Should redirect to 403 since role doesn't match any allowed roles
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/403');
    });

    it('should handle case-sensitive role matching', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'admin', // lowercase instead of ADMIN
        userId: 'admin-123',
        email: 'admin@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard/admin')
      );

      const response = await middleware(request);

      // Should redirect to 403 since role matching is case-sensitive
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/403');
    });
  });

  describe('Logging Behavior', () => {
    it('should log timestamp in ISO format', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      await middleware(request);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[RBAC Middleware] Unauthenticated access attempt:',
        expect.objectContaining({
          timestamp: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
          ),
        })
      );
    });

    it('should log all required fields for authorization failure', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'end_user',
        userId: 'user-456',
        email: 'user@example.com',
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      await middleware(request);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[RBAC Middleware] Authorization failure:',
        expect.objectContaining({
          userId: expect.any(String),
          userRole: expect.any(String),
          requestedResource: expect.any(String),
          requiredRoles: expect.any(Array),
          timestamp: expect.any(String),
        })
      );
    });

    it('should not log for routes without specific role requirements', async () => {
      vi.mocked(nextAuthJwt.getToken).mockResolvedValue({
        role: 'end_user',
        userId: 'user-456',
        email: 'user@example.com',
      } as any);

      // /submit allows end_user
      const request = new NextRequest(
        new URL('http://localhost:3000/submit')
      );

      mockConsoleLog.mockClear();
      mockConsoleError.mockClear();

      await middleware(request);

      // Should log success, not error
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });
});
