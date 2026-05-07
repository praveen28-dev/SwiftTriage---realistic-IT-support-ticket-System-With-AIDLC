/**
 * Unit Tests for User Logout API
 * 
 * Tests cover:
 * - Successful logout (200 OK)
 * - Session cookie cleared
 * - Cookie has past expiration date
 * - HttpOnly and SameSite attributes set correctly
 * - Both development and production cookies cleared
 * 
 * Requirements Coverage:
 * - 11.3: Logout endpoint clears authentication cookies
 * - 11.4: Cookie expiration set to past date
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from './route';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/utils/ip', () => ({
  getClientIp: vi.fn(() => '192.168.1.1'),
}));

describe('POST /api/logout', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('successful logout', () => {
    it('should return 200 OK with success message', async () => {
      // Create request
      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Logged out successfully');
    });

    it('should clear development session cookie', async () => {
      // Create request
      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
      });

      // Execute
      const response = await POST(request);

      // Get cookies from response
      const cookies = response.cookies;
      const sessionCookie = cookies.get('next-auth.session-token');

      // Assert
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie?.value).toBe('');
    });

    it('should clear production session cookie', async () => {
      // Create request
      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
      });

      // Execute
      const response = await POST(request);

      // Get cookies from response
      const cookies = response.cookies;
      const sessionCookie = cookies.get('__Secure-next-auth.session-token');

      // Assert
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie?.value).toBe('');
    });

    it('should set cookie expiration to past date', async () => {
      // Create request
      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
      });

      // Execute
      const response = await POST(request);

      // Get cookies from response
      const cookies = response.cookies;
      const sessionCookie = cookies.get('next-auth.session-token');

      // Assert - cookie should expire in the past (Thu, 01 Jan 1970 00:00:00 GMT)
      expect(sessionCookie).toBeDefined();
      
      // The expires date should be in the past
      const expiresDate = sessionCookie?.expires;
      expect(expiresDate).toBeDefined();
      
      if (expiresDate) {
        const pastDate = new Date('Thu, 01 Jan 1970 00:00:00 GMT');
        // Handle both Date and number types
        if (expiresDate instanceof Date) {
          expect(expiresDate.getTime()).toBe(pastDate.getTime());
        } else if (typeof expiresDate === 'number') {
          expect(expiresDate).toBe(pastDate.getTime());
        }
      }
    });

    it('should set HttpOnly attribute on cookies', async () => {
      // Create request
      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
      });

      // Execute
      const response = await POST(request);

      // Get cookies from response
      const cookies = response.cookies;
      const devCookie = cookies.get('next-auth.session-token');
      const prodCookie = cookies.get('__Secure-next-auth.session-token');

      // Assert
      expect(devCookie?.httpOnly).toBe(true);
      expect(prodCookie?.httpOnly).toBe(true);
    });

    it('should set SameSite=Lax attribute on cookies', async () => {
      // Create request
      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
      });

      // Execute
      const response = await POST(request);

      // Get cookies from response
      const cookies = response.cookies;
      const devCookie = cookies.get('next-auth.session-token');
      const prodCookie = cookies.get('__Secure-next-auth.session-token');

      // Assert
      expect(devCookie?.sameSite).toBe('lax');
      expect(prodCookie?.sameSite).toBe('lax');
    });

    it('should set Secure attribute on production cookie', async () => {
      // Create request
      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
      });

      // Execute
      const response = await POST(request);

      // Get cookies from response
      const cookies = response.cookies;
      const prodCookie = cookies.get('__Secure-next-auth.session-token');

      // Assert
      expect(prodCookie?.secure).toBe(true);
    });

    it('should set Path=/ on cookies', async () => {
      // Create request
      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
      });

      // Execute
      const response = await POST(request);

      // Get cookies from response
      const cookies = response.cookies;
      const devCookie = cookies.get('next-auth.session-token');
      const prodCookie = cookies.get('__Secure-next-auth.session-token');

      // Assert
      expect(devCookie?.path).toBe('/');
      expect(prodCookie?.path).toBe('/');
    });

    it('should clear callback URL cookies', async () => {
      // Create request
      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
      });

      // Execute
      const response = await POST(request);

      // Get cookies from response
      const cookies = response.cookies;
      const devCallbackCookie = cookies.get('next-auth.callback-url');
      const prodCallbackCookie = cookies.get('__Secure-next-auth.callback-url');

      // Assert
      expect(devCallbackCookie).toBeDefined();
      expect(devCallbackCookie?.value).toBe('');
      expect(prodCallbackCookie).toBeDefined();
      expect(prodCallbackCookie?.value).toBe('');
    });
  });

  describe('error handling', () => {
    it('should return 500 on unexpected error', async () => {
      // Mock NextResponse.json to throw error
      const originalJson = NextResponse.json;
      let callCount = 0;
      vi.spyOn(NextResponse, 'json').mockImplementation((body: any, init?: any) => {
        callCount++;
        // Throw error on first call (success response), allow second call (error response)
        if (callCount === 1) {
          throw new Error('Unexpected error');
        }
        return originalJson(body, init);
      });

      // Create request
      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('An error occurred during logout');

      // Restore original implementation
      vi.restoreAllMocks();
    });

    it('should return generic error message on server error', async () => {
      // Mock NextResponse.json to throw error
      const originalJson = NextResponse.json;
      let callCount = 0;
      vi.spyOn(NextResponse, 'json').mockImplementation((body: any, init?: any) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Database connection failed');
        }
        return originalJson(body, init);
      });

      // Create request
      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert - should not leak implementation details
      expect(data.error).toBe('An error occurred during logout');
      expect(data.error).not.toContain('Database connection failed');

      // Restore original implementation
      vi.restoreAllMocks();
    });
  });
});
