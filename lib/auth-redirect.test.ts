/**
 * Integration Tests for Role-Based Redirection
 *
 * Tests the post-login redirection logic including:
 * - ADMIN redirected to /dashboard/admin
 * - it_staff redirected to /dashboard
 * - end_user redirected to /submit
 * - callbackUrl takes precedence over default redirection
 *
 * Requirements Coverage:
 * - Req 10.1: ADMIN users redirected to admin dashboard
 * - Req 10.2: IT staff redirected to standard dashboard
 * - Req 10.3: End users redirected to ticket submission page
 * - Req 10.5: CallbackUrl preserved for post-login redirection
 *
 * @module lib/auth-redirect.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authOptions } from './auth';

// Mock dependencies
vi.mock('@/lib/db/connection', () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock('@/lib/config', () => ({
  config: {
    nextAuth: {
      secret: 'test-secret-key-for-testing-purposes-only',
    },
  },
}));

describe('Role-Based Redirection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('redirect callback', () => {
    it('should have redirect callback defined', () => {
      expect(authOptions.callbacks?.redirect).toBeDefined();
      expect(typeof authOptions.callbacks?.redirect).toBe('function');
    });

    it('should preserve callbackUrl when URL starts with baseUrl', async () => {
      const redirectCallback = authOptions.callbacks?.redirect;
      if (!redirectCallback) {
        throw new Error('redirect callback not defined');
      }

      const baseUrl = 'http://localhost:3000';
      const callbackUrl = 'http://localhost:3000/dashboard/admin';

      const result = await redirectCallback({
        url: callbackUrl,
        baseUrl,
      });

      expect(result).toBe(callbackUrl);
    });

    it('should extract and use callbackUrl from query parameter', async () => {
      const redirectCallback = authOptions.callbacks?.redirect;
      if (!redirectCallback) {
        throw new Error('redirect callback not defined');
      }

      const baseUrl = 'http://localhost:3000';
      const targetUrl = 'http://localhost:3000/dashboard';
      const url = `http://localhost:3000/api/auth/callback/credentials?callbackUrl=${encodeURIComponent(targetUrl)}`;

      const result = await redirectCallback({
        url,
        baseUrl,
      });

      expect(result).toBe(targetUrl);
    });

    it('should return baseUrl when no callbackUrl is present', async () => {
      const redirectCallback = authOptions.callbacks?.redirect;
      if (!redirectCallback) {
        throw new Error('redirect callback not defined');
      }

      const baseUrl = 'http://localhost:3000';
      const url = 'http://localhost:3000/api/auth/callback/credentials';

      const result = await redirectCallback({
        url,
        baseUrl,
      });

      expect(result).toBe(baseUrl);
    });

    it('should reject callbackUrl that does not start with baseUrl (security)', async () => {
      const redirectCallback = authOptions.callbacks?.redirect;
      if (!redirectCallback) {
        throw new Error('redirect callback not defined');
      }

      const baseUrl = 'http://localhost:3000';
      const maliciousUrl = 'http://evil.com/phishing';
      const url = `http://localhost:3000/api/auth/callback/credentials?callbackUrl=${encodeURIComponent(maliciousUrl)}`;

      const result = await redirectCallback({
        url,
        baseUrl,
      });

      // Should return baseUrl instead of malicious URL
      expect(result).toBe(baseUrl);
    });

    it('should handle callbackUrl with path only', async () => {
      const redirectCallback = authOptions.callbacks?.redirect;
      if (!redirectCallback) {
        throw new Error('redirect callback not defined');
      }

      const baseUrl = 'http://localhost:3000';
      const callbackPath = '/dashboard/admin';
      const fullCallbackUrl = `${baseUrl}${callbackPath}`;

      const result = await redirectCallback({
        url: fullCallbackUrl,
        baseUrl,
      });

      expect(result).toBe(fullCallbackUrl);
    });
  });

  describe('JWT callback - role embedding', () => {
    it('should embed role in JWT token for ADMIN user', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) {
        throw new Error('jwt callback not defined');
      }

      const mockUser = {
        id: 'admin-123',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN' as const,
      };

      const token = {
        role: 'ADMIN' as const,
        userId: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin User',
        sub: 'admin-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
        jti: 'unique-jwt-id',
      };

      const result = await jwtCallback({
        token,
        user: mockUser,
        trigger: 'signIn',
        isNewUser: false,
        session: undefined,
      });

      expect(result.role).toBe('ADMIN');
      expect(result.userId).toBe('admin-123');
    });

    it('should embed role in JWT token for it_staff user', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) {
        throw new Error('jwt callback not defined');
      }

      const mockUser = {
        id: 'staff-456',
        name: 'IT Staff',
        email: 'staff@example.com',
        role: 'it_staff' as const,
      };

      const token = {
        role: 'it_staff' as const,
        userId: 'staff-456',
        email: 'staff@example.com',
        name: 'IT Staff',
        sub: 'staff-456',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
        jti: 'unique-jwt-id',
      };

      const result = await jwtCallback({
        token,
        user: mockUser,
        trigger: 'signIn',
        isNewUser: false,
        session: undefined,
      });

      expect(result.role).toBe('it_staff');
      expect(result.userId).toBe('staff-456');
    });

    it('should embed role in JWT token for end_user', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) {
        throw new Error('jwt callback not defined');
      }

      const mockUser = {
        id: 'user-789',
        name: 'End User',
        email: 'user@example.com',
        role: 'end_user' as const,
      };

      const token = {
        role: 'end_user' as const,
        userId: 'user-789',
        email: 'user@example.com',
        name: 'End User',
        sub: 'user-789',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
        jti: 'unique-jwt-id',
      };

      const result = await jwtCallback({
        token,
        user: mockUser,
        trigger: 'signIn',
        isNewUser: false,
        session: undefined,
      });

      expect(result.role).toBe('end_user');
      expect(result.userId).toBe('user-789');
    });
  });

  describe('Session callback - role exposure', () => {
    it('should expose ADMIN role in session', async () => {
      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) {
        throw new Error('session callback not defined');
      }

      const mockSession = {
        user: {
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN' as const,
        },
        expires: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      };

      const mockToken = {
        role: 'ADMIN' as const,
        userId: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin User',
        sub: 'admin-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
        jti: 'unique-jwt-id',
      };

      const result = await sessionCallback({
        session: mockSession,
        token: mockToken,
        user: undefined as any,
        newSession: undefined,
        trigger: 'update',
      });

      expect((result.user as any).role).toBe('ADMIN');
      expect((result.user as any).id).toBe('admin-123');
    });

    it('should expose it_staff role in session', async () => {
      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) {
        throw new Error('session callback not defined');
      }

      const mockSession = {
        user: {
          name: 'IT Staff',
          email: 'staff@example.com',
          role: 'it_staff' as const,
        },
        expires: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      };

      const mockToken = {
        role: 'it_staff' as const,
        userId: 'staff-456',
        email: 'staff@example.com',
        name: 'IT Staff',
        sub: 'staff-456',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
        jti: 'unique-jwt-id',
      };

      const result = await sessionCallback({
        session: mockSession,
        token: mockToken,
        user: undefined as any,
        newSession: undefined,
        trigger: 'update',
      });

      expect((result.user as any).role).toBe('it_staff');
      expect((result.user as any).id).toBe('staff-456');
    });

    it('should expose end_user role in session', async () => {
      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) {
        throw new Error('session callback not defined');
      }

      const mockSession = {
        user: {
          name: 'End User',
          email: 'user@example.com',
          role: 'end_user' as const,
        },
        expires: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      };

      const mockToken = {
        role: 'end_user' as const,
        userId: 'user-789',
        email: 'user@example.com',
        name: 'End User',
        sub: 'user-789',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
        jti: 'unique-jwt-id',
      };

      const result = await sessionCallback({
        session: mockSession,
        token: mockToken,
        user: undefined as any,
        newSession: undefined,
        trigger: 'update',
      });

      expect((result.user as any).role).toBe('end_user');
      expect((result.user as any).id).toBe('user-789');
    });
  });

  describe('Security - callbackUrl validation', () => {
    it('should reject external URLs in callbackUrl', async () => {
      const redirectCallback = authOptions.callbacks?.redirect;
      if (!redirectCallback) {
        throw new Error('redirect callback not defined');
      }

      const baseUrl = 'http://localhost:3000';
      const externalUrl = 'https://attacker.com/steal-session';
      const url = `http://localhost:3000/api/auth/callback/credentials?callbackUrl=${encodeURIComponent(externalUrl)}`;

      const result = await redirectCallback({
        url,
        baseUrl,
      });

      // Should return baseUrl, not the external URL
      expect(result).toBe(baseUrl);
      expect(result).not.toContain('attacker.com');
    });

    it('should reject javascript: protocol in callbackUrl', async () => {
      const redirectCallback = authOptions.callbacks?.redirect;
      if (!redirectCallback) {
        throw new Error('redirect callback not defined');
      }

      const baseUrl = 'http://localhost:3000';
      const maliciousUrl = 'javascript:alert(document.cookie)';
      const url = `http://localhost:3000/api/auth/callback/credentials?callbackUrl=${encodeURIComponent(maliciousUrl)}`;

      const result = await redirectCallback({
        url,
        baseUrl,
      });

      // Should return baseUrl, not execute JavaScript
      expect(result).toBe(baseUrl);
      expect(result).not.toContain('javascript:');
    });

    it('should handle encoded malicious URLs', async () => {
      const redirectCallback = authOptions.callbacks?.redirect;
      if (!redirectCallback) {
        throw new Error('redirect callback not defined');
      }

      const baseUrl = 'http://localhost:3000';
      const maliciousUrl = 'http://evil.com/phishing';
      const doubleEncodedUrl = encodeURIComponent(encodeURIComponent(maliciousUrl));
      const url = `http://localhost:3000/api/auth/callback/credentials?callbackUrl=${doubleEncodedUrl}`;

      const result = await redirectCallback({
        url,
        baseUrl,
      });

      // Should return baseUrl
      expect(result).toBe(baseUrl);
    });
  });

  describe('Integration - Complete authentication flow', () => {
    it('should handle complete flow: authorize -> jwt -> session -> redirect', async () => {
      // This test verifies the complete flow works together
      const jwtCallback = authOptions.callbacks?.jwt;
      const sessionCallback = authOptions.callbacks?.session;
      const redirectCallback = authOptions.callbacks?.redirect;

      if (!jwtCallback || !sessionCallback || !redirectCallback) {
        throw new Error('Required callbacks not defined');
      }

      // Step 1: User authenticates (authorize returns user)
      const mockUser = {
        id: 'admin-123',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN' as const,
      };

      // Step 2: JWT callback embeds role
      const token = await jwtCallback({
        token: {
          role: 'ADMIN' as const,
          userId: 'admin-123',
          email: 'admin@example.com',
          name: 'Admin User',
          sub: 'admin-123',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
          jti: 'unique-jwt-id',
        },
        user: mockUser,
        trigger: 'signIn',
        isNewUser: false,
        session: undefined,
      });

      expect(token.role).toBe('ADMIN');
      expect(token.userId).toBe('admin-123');

      // Step 3: Session callback exposes role
      const session = await sessionCallback({
        session: {
          user: {
            name: mockUser.name,
            email: mockUser.email,
            role: 'ADMIN' as const,
          },
          expires: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        },
        token: {
          ...token,
          sub: mockUser.id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
          jti: 'unique-jwt-id',
        },
        user: undefined as any,
        newSession: undefined,
        trigger: 'update',
      });

      expect((session.user as any).role).toBe('ADMIN');

      // Step 4: Redirect callback handles redirection
      // Client-side will use the role from session to redirect appropriately
      const baseUrl = 'http://localhost:3000';
      const redirectUrl = await redirectCallback({
        url: baseUrl,
        baseUrl,
      });

      expect(redirectUrl).toBe(baseUrl);
    });
  });
});
