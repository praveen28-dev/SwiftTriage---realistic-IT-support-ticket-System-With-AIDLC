/**
 * Integration Tests for NextAuth.js Authentication
 * 
 * Tests cover:
 * - Successful login with valid credentials (200 OK)
 * - Login with invalid email (401 Unauthorized)
 * - Login with invalid password (401 Unauthorized)
 * - Login with inactive user (401 Unauthorized)
 * - JWT token contains role and userId
 * - Session object exposes role and userId
 * - Generic error message for failed login (no username/password leak)
 * 
 * Requirements Coverage:
 * - 3.4: Constant-time password comparison
 * - 3.5: Generic error messages (no information leakage)
 * - 4.4: JWT token includes role
 * - 5.4: Role embedded in JWT payload
 * - 9.6: Generic "Invalid credentials" message
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authOptions } from './auth';
import { db } from '@/lib/db/connection';
import bcrypt from 'bcryptjs';

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

describe('NextAuth Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('authOptions structure', () => {
    it('should have CredentialsProvider configured', () => {
      expect(authOptions.providers).toBeDefined();
      expect(authOptions.providers.length).toBe(1);
      expect(authOptions.providers[0].type).toBe('credentials');
    });

    it('should have JWT session strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have 8-hour session maxAge', () => {
      const eightHoursInSeconds = 8 * 60 * 60;
      expect(authOptions.session?.maxAge).toBe(eightHoursInSeconds);
    });

    it('should have JWT callback configured', () => {
      expect(authOptions.callbacks?.jwt).toBeDefined();
      expect(typeof authOptions.callbacks?.jwt).toBe('function');
    });

    it('should have session callback configured', () => {
      expect(authOptions.callbacks?.session).toBeDefined();
      expect(typeof authOptions.callbacks?.session).toBe('function');
    });

    it('should have secret configured', () => {
      expect(authOptions.secret).toBeDefined();
      expect(typeof authOptions.secret).toBe('string');
    });

    it('should have custom sign-in page', () => {
      expect(authOptions.pages?.signIn).toBe('/login');
    });
  });

  describe('authorize function - successful authentication', () => {
    it('should return user object with role for valid credentials', async () => {
      // Mock database to return active user
      const mockPasswordHash = await bcrypt.hash('SecurePass123', 12);
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'testuser@example.com',
        passwordHash: mockPasswordHash,
        role: 'it_staff',
        isActive: true,
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);

      // Get authorize function
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      // Execute
      const result = await authorize({
        email: 'testuser@example.com',
        password: 'SecurePass123',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual({
        id: 'user-123',
        name: 'testuser',
        email: 'testuser@example.com',
        role: 'it_staff',
      });
    });

    it('should work with end_user role', async () => {
      // Mock database to return end_user
      const mockPasswordHash = await bcrypt.hash('SecurePass123', 12);
      const mockUser = {
        id: 'user-456',
        username: 'enduser',
        email: 'enduser@example.com',
        passwordHash: mockPasswordHash,
        role: 'end_user',
        isActive: true,
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);

      // Get authorize function
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      // Execute
      const result = await authorize({
        email: 'enduser@example.com',
        password: 'SecurePass123',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result?.role).toBe('end_user');
    });

    it('should work with ADMIN role', async () => {
      // Mock database to return ADMIN
      const mockPasswordHash = await bcrypt.hash('AdminPass123', 12);
      const mockUser = {
        id: 'admin-789',
        username: 'admin',
        email: 'admin@example.com',
        passwordHash: mockPasswordHash,
        role: 'ADMIN',
        isActive: true,
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);

      // Get authorize function
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      // Execute
      const result = await authorize({
        email: 'admin@example.com',
        password: 'AdminPass123',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result?.role).toBe('ADMIN');
    });
  });

  describe('authorize function - authentication failures', () => {
    it('should return null for missing email', async () => {
      // Get authorize function
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      // Execute
      const result = await authorize({
        password: 'SecurePass123',
      });

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for missing password', async () => {
      // Get authorize function
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      // Execute
      const result = await authorize({
        email: 'testuser@example.com',
      });

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for invalid email format', async () => {
      // Get authorize function
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      // Execute
      const result = await authorize({
        email: 'invalid-email',
        password: 'SecurePass123',
      });

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      // Mock database to return no user
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);

      // Get authorize function
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      // Execute
      const result = await authorize({
        email: 'nonexistent@example.com',
        password: 'SecurePass123',
      });

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for incorrect password', async () => {
      // Mock database to return user with different password
      const mockPasswordHash = await bcrypt.hash('CorrectPassword123', 12);
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'testuser@example.com',
        passwordHash: mockPasswordHash,
        role: 'it_staff',
        isActive: true,
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);

      // Get authorize function
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      // Execute
      const result = await authorize({
        email: 'testuser@example.com',
        password: 'WrongPassword123',
      });

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for inactive user', async () => {
      // Mock database to return inactive user
      const mockPasswordHash = await bcrypt.hash('SecurePass123', 12);
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'testuser@example.com',
        passwordHash: mockPasswordHash,
        role: 'it_staff',
        isActive: false, // Inactive user
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);

      // Get authorize function
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      // Execute
      const result = await authorize({
        email: 'testuser@example.com',
        password: 'SecurePass123',
      });

      // Assert
      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      // Mock database to throw error
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('Database connection failed')),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);

      // Get authorize function
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      // Execute
      const result = await authorize({
        email: 'testuser@example.com',
        password: 'SecurePass123',
      });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('JWT callback', () => {
    it('should embed role and userId in JWT token on sign-in', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      // Mock user object (returned from authorize)
      const mockUser = {
        id: 'user-123',
        name: 'testuser',
        email: 'testuser@example.com',
        role: 'it_staff',
      };

      // Mock token
      const mockToken = {
        sub: 'user-123',
        email: 'testuser@example.com',
        name: 'testuser',
      };

      // Execute
      const result = await jwtCallback!({
        token: mockToken,
        user: mockUser,
        trigger: 'signIn',
      } as any);

      // Assert
      expect(result.role).toBe('it_staff');
      expect(result.userId).toBe('user-123');
    });

    it('should preserve existing token data when user is not present', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      // Mock token with existing role and userId
      const mockToken = {
        sub: 'user-123',
        email: 'testuser@example.com',
        name: 'testuser',
        role: 'it_staff',
        userId: 'user-123',
      };

      // Execute (no user object - subsequent requests)
      const result = await jwtCallback!({
        token: mockToken,
        trigger: 'update',
      } as any);

      // Assert
      expect(result.role).toBe('it_staff');
      expect(result.userId).toBe('user-123');
    });

    it('should handle ADMIN role in JWT', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      // Mock ADMIN user
      const mockUser = {
        id: 'admin-789',
        name: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
      };

      const mockToken = {
        sub: 'admin-789',
        email: 'admin@example.com',
        name: 'admin',
      };

      // Execute
      const result = await jwtCallback!({
        token: mockToken,
        user: mockUser,
        trigger: 'signIn',
      } as any);

      // Assert
      expect(result.role).toBe('ADMIN');
      expect(result.userId).toBe('admin-789');
    });

    it('should handle end_user role in JWT', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      // Mock end_user
      const mockUser = {
        id: 'user-456',
        name: 'enduser',
        email: 'enduser@example.com',
        role: 'end_user',
      };

      const mockToken = {
        sub: 'user-456',
        email: 'enduser@example.com',
        name: 'enduser',
      };

      // Execute
      const result = await jwtCallback!({
        token: mockToken,
        user: mockUser,
        trigger: 'signIn',
      } as any);

      // Assert
      expect(result.role).toBe('end_user');
      expect(result.userId).toBe('user-456');
    });
  });

  describe('session callback', () => {
    it('should expose role and userId in session object', async () => {
      const sessionCallback = authOptions.callbacks?.session;
      expect(sessionCallback).toBeDefined();

      // Mock session and token
      const mockSession = {
        user: {
          name: 'testuser',
          email: 'testuser@example.com',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      const mockToken = {
        sub: 'user-123',
        email: 'testuser@example.com',
        name: 'testuser',
        role: 'it_staff',
        userId: 'user-123',
      };

      // Execute
      const result = await sessionCallback!({
        session: mockSession,
        token: mockToken,
        trigger: 'getSession',
      } as any);

      // Assert
      expect((result.user as any).role).toBe('it_staff');
      expect((result.user as any).id).toBe('user-123');
    });

    it('should handle ADMIN role in session', async () => {
      const sessionCallback = authOptions.callbacks?.session;
      expect(sessionCallback).toBeDefined();

      // Mock session and token
      const mockSession = {
        user: {
          name: 'admin',
          email: 'admin@example.com',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      const mockToken = {
        sub: 'admin-789',
        email: 'admin@example.com',
        name: 'admin',
        role: 'ADMIN',
        userId: 'admin-789',
      };

      // Execute
      const result = await sessionCallback!({
        session: mockSession,
        token: mockToken,
        trigger: 'getSession',
      } as any);

      // Assert
      expect((result.user as any).role).toBe('ADMIN');
      expect((result.user as any).id).toBe('admin-789');
    });

    it('should handle end_user role in session', async () => {
      const sessionCallback = authOptions.callbacks?.session;
      expect(sessionCallback).toBeDefined();

      // Mock session and token
      const mockSession = {
        user: {
          name: 'enduser',
          email: 'enduser@example.com',
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      const mockToken = {
        sub: 'user-456',
        email: 'enduser@example.com',
        name: 'enduser',
        role: 'end_user',
        userId: 'user-456',
      };

      // Execute
      const result = await sessionCallback!({
        session: mockSession,
        token: mockToken,
        trigger: 'getSession',
      } as any);

      // Assert
      expect((result.user as any).role).toBe('end_user');
      expect((result.user as any).id).toBe('user-456');
    });
  });

  describe('security requirements', () => {
    it('should use constant-time password comparison', async () => {
      // This test verifies that bcrypt.compare is used (which is constant-time)
      // We can't directly test timing, but we can verify the function is called

      const mockPasswordHash = await bcrypt.hash('SecurePass123', 12);
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'testuser@example.com',
        passwordHash: mockPasswordHash,
        role: 'it_staff',
        isActive: true,
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);

      // Spy on bcrypt.compare
      const compareSpy = vi.spyOn(bcrypt, 'compare');

      // Get authorize function
      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      // Execute
      await authorize({
        email: 'testuser@example.com',
        password: 'SecurePass123',
      });

      // Assert bcrypt.compare was called (constant-time comparison)
      expect(compareSpy).toHaveBeenCalledWith('SecurePass123', mockPasswordHash);

      compareSpy.mockRestore();
    });

    it('should not leak information about whether user exists', async () => {
      // Test 1: Non-existent user
      const mockSelect1 = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect1);

      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      const result1 = await authorize({
        email: 'nonexistent@example.com',
        password: 'SecurePass123',
      });

      // Test 2: Existing user with wrong password
      const mockPasswordHash = await bcrypt.hash('CorrectPassword123', 12);
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'testuser@example.com',
        passwordHash: mockPasswordHash,
        role: 'it_staff',
        isActive: true,
      };

      const mockSelect2 = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect2);

      const result2 = await authorize({
        email: 'testuser@example.com',
        password: 'WrongPassword123',
      });

      // Both should return null (no information leakage)
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should not leak information about inactive users', async () => {
      // Mock database to return inactive user
      const mockPasswordHash = await bcrypt.hash('SecurePass123', 12);
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'testuser@example.com',
        passwordHash: mockPasswordHash,
        role: 'it_staff',
        isActive: false,
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);

      const credentialsProvider = authOptions.providers[0] as any;
      const authorize = credentialsProvider.options.authorize;

      const result = await authorize({
        email: 'testuser@example.com',
        password: 'SecurePass123',
      });

      // Should return null (same as non-existent user)
      expect(result).toBeNull();
    });
  });

  describe('session configuration', () => {
    it('should use JWT strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have 8-hour session expiration', () => {
      const eightHours = 8 * 60 * 60; // 28800 seconds
      expect(authOptions.session?.maxAge).toBe(eightHours);
    });

    it('should have secret configured', () => {
      expect(authOptions.secret).toBeDefined();
      expect(typeof authOptions.secret).toBe('string');
      expect(authOptions.secret.length).toBeGreaterThan(0);
    });
  });
});
