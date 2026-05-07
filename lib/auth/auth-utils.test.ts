/**
 * Unit Tests for Authentication Utility Functions
 *
 * Tests authentication and authorization helper functions including:
 * - Session retrieval (getAuthSession)
 * - Authentication requirement (requireAuth)
 * - Role-based authorization (requireRole)
 * - Error handling for unauthorized access
 * - Type safety and session structure
 *
 * Requirements Coverage:
 * - 5.5: Role extraction from JWT token
 * - 5.6: Role verification for authorization
 * - 6.1: Authentication token validation
 * - 6.2: Role-based access control
 * - 6.6: Authorization failure handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthSession, requireAuth, requireRole } from './auth-utils';
import type { AuthSession } from './auth-utils';
import * as nextAuth from 'next-auth';

// Mock next-auth module
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock authOptions
vi.mock('@/lib/auth', () => ({
  authOptions: {
    providers: [],
    callbacks: {},
    session: { strategy: 'jwt' },
  },
}));

describe('Authentication Utility Functions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('getAuthSession', () => {
    it('should return session for authenticated user', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'it_staff',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      const session = await getAuthSession();

      expect(session).toEqual(mockSession);
      expect(session?.user.id).toBe('user-123');
      expect(session?.user.role).toBe('it_staff');
      expect(nextAuth.getServerSession).toHaveBeenCalledTimes(1);
    });

    it('should return null for unauthenticated user', async () => {
      vi.mocked(nextAuth.getServerSession).mockResolvedValue(null);

      const session = await getAuthSession();

      expect(session).toBeNull();
      expect(nextAuth.getServerSession).toHaveBeenCalledTimes(1);
    });

    it('should return session with end_user role', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'user-456',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'end_user',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      const session = await getAuthSession();

      expect(session?.user.role).toBe('end_user');
    });

    it('should return session with ADMIN role', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'admin-789',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      const session = await getAuthSession();

      expect(session?.user.role).toBe('ADMIN');
    });

    it('should handle session without optional fields', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'user-minimal',
          email: 'minimal@example.com',
          role: 'end_user',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      const session = await getAuthSession();

      expect(session?.user.id).toBe('user-minimal');
      expect(session?.user.name).toBeUndefined();
      expect(session?.user.image).toBeUndefined();
    });
  });

  describe('requireAuth', () => {
    it('should return session for authenticated user', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'it_staff',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      const session = await requireAuth();

      expect(session).toEqual(mockSession);
      expect(session.user.id).toBe('user-123');
    });

    it('should throw error for unauthenticated user', async () => {
      vi.mocked(nextAuth.getServerSession).mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow('Unauthorized');
    });

    it('should throw error with exact message "Unauthorized"', async () => {
      vi.mocked(nextAuth.getServerSession).mockResolvedValue(null);

      try {
        await requireAuth();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Unauthorized');
      }
    });

    it('should not throw for any valid session regardless of role', async () => {
      const roles: Array<'end_user' | 'it_staff' | 'ADMIN'> = [
        'end_user',
        'it_staff',
        'ADMIN',
      ];

      for (const role of roles) {
        const mockSession: AuthSession = {
          user: {
            id: `user-${role}`,
            email: `${role}@example.com`,
            role,
          },
          expires: '2024-12-31T23:59:59.999Z',
        };

        vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

        const session = await requireAuth();
        expect(session.user.role).toBe(role);
      }
    });
  });

  describe('requireRole', () => {
    it('should allow user with sufficient role (it_staff accessing it_staff route)', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'user-123',
          email: 'staff@example.com',
          role: 'it_staff',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      const session = await requireRole(['it_staff', 'ADMIN']);

      expect(session.user.role).toBe('it_staff');
    });

    it('should allow ADMIN to access it_staff route', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      const session = await requireRole(['it_staff', 'ADMIN']);

      expect(session.user.role).toBe('ADMIN');
    });

    it('should allow end_user to access end_user route', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'user-456',
          email: 'user@example.com',
          role: 'end_user',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      const session = await requireRole(['end_user', 'it_staff', 'ADMIN']);

      expect(session.user.role).toBe('end_user');
    });

    it('should throw Forbidden for user with insufficient role', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'user-456',
          email: 'user@example.com',
          role: 'end_user',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      await expect(requireRole(['it_staff', 'ADMIN'])).rejects.toThrow(
        'Forbidden'
      );
    });

    it('should throw Forbidden for it_staff accessing ADMIN-only route', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'staff-123',
          email: 'staff@example.com',
          role: 'it_staff',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      await expect(requireRole(['ADMIN'])).rejects.toThrow('Forbidden');
    });

    it('should throw Unauthorized for unauthenticated user', async () => {
      vi.mocked(nextAuth.getServerSession).mockResolvedValue(null);

      await expect(requireRole(['it_staff'])).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized before checking role for unauthenticated user', async () => {
      vi.mocked(nextAuth.getServerSession).mockResolvedValue(null);

      try {
        await requireRole(['ADMIN']);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        // Should throw Unauthorized, not Forbidden
        expect((error as Error).message).toBe('Unauthorized');
      }
    });

    it('should allow single role in array', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      const session = await requireRole(['ADMIN']);

      expect(session.user.role).toBe('ADMIN');
    });

    it('should handle multiple allowed roles correctly', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          role: 'end_user',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      // end_user should be allowed when in the list
      const session = await requireRole(['end_user', 'it_staff', 'ADMIN']);

      expect(session.user.role).toBe('end_user');
    });
  });

  describe('Error Message Consistency', () => {
    it('should use consistent "Unauthorized" message for authentication failures', async () => {
      vi.mocked(nextAuth.getServerSession).mockResolvedValue(null);

      const errors: string[] = [];

      try {
        await requireAuth();
      } catch (error) {
        errors.push((error as Error).message);
      }

      try {
        await requireRole(['it_staff']);
      } catch (error) {
        errors.push((error as Error).message);
      }

      expect(errors).toEqual(['Unauthorized', 'Unauthorized']);
    });

    it('should use "Forbidden" message only for authorization failures', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          role: 'end_user',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      try {
        await requireRole(['ADMIN']);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Forbidden');
      }
    });
  });

  describe('Integration Scenarios', () => {
    it('should support typical API route authentication flow', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          role: 'it_staff',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      // Simulate API route checking authentication
      const session = await getAuthSession();
      expect(session).not.toBeNull();

      if (session) {
        expect(session.user.id).toBe('user-123');
        expect(session.user.role).toBe('it_staff');
      }
    });

    it('should support typical API route with role requirement', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      // Simulate admin-only API route
      const session = await requireRole(['ADMIN']);
      expect(session.user.role).toBe('ADMIN');
    });

    it('should support error handling pattern for API routes', async () => {
      vi.mocked(nextAuth.getServerSession).mockResolvedValue(null);

      // Simulate API route error handling
      let statusCode = 200;
      let errorMessage = '';

      try {
        await requireAuth();
      } catch (error) {
        if ((error as Error).message === 'Unauthorized') {
          statusCode = 401;
          errorMessage = 'Unauthorized';
        }
      }

      expect(statusCode).toBe(401);
      expect(errorMessage).toBe('Unauthorized');
    });

    it('should support error handling for insufficient permissions', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          role: 'end_user',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      // Simulate API route error handling for forbidden access
      let statusCode = 200;
      let errorMessage = '';

      try {
        await requireRole(['ADMIN']);
      } catch (error) {
        if ((error as Error).message === 'Unauthorized') {
          statusCode = 401;
          errorMessage = 'Unauthorized';
        } else if ((error as Error).message === 'Forbidden') {
          statusCode = 403;
          errorMessage = 'Forbidden';
        }
      }

      expect(statusCode).toBe(403);
      expect(errorMessage).toBe('Forbidden');
    });
  });

  describe('Type Safety', () => {
    it('should return properly typed session with role', async () => {
      const mockSession: AuthSession = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          role: 'it_staff',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      vi.mocked(nextAuth.getServerSession).mockResolvedValue(mockSession);

      const session = await getAuthSession();

      // TypeScript should recognize these properties
      if (session) {
        const userId: string = session.user.id;
        const userRole: 'end_user' | 'it_staff' | 'ADMIN' = session.user.role;
        const userEmail: string | null | undefined = session.user.email;

        expect(userId).toBe('user-123');
        expect(userRole).toBe('it_staff');
        expect(userEmail).toBe('user@example.com');
      }
    });
  });
});
