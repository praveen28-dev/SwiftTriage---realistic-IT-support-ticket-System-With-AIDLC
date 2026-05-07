/**
 * Unit Tests for User Registration API
 * 
 * Tests cover:
 * - Successful registration (201 Created)
 * - Duplicate email handling (409 Conflict)
 * - Invalid email format (400 Bad Request)
 * - Weak password validation (400 Bad Request)
 * - Password mismatch (400 Bad Request)
 * - Rate limiting (429 Too Many Requests)
 * - Password hash exclusion from response
 * 
 * Requirements Coverage:
 * - 2.4: Registration form validation
 * - 3.3: Password hash never stored in plaintext
 * - 8.1: Backend validation with Zod
 * - 8.5: Email uniqueness validation
 * - 9.4: Return HTTP 201 Created on success
 * - 9.7: Rate limiting (5 attempts per 15 minutes)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/connection';
import { rateLimiter } from '@/lib/auth/rate-limiter';

// Mock dependencies
vi.mock('@/lib/db/connection', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock('@/lib/auth/rate-limiter', () => ({
  rateLimiter: {
    check: vi.fn(),
    recordFailure: vi.fn(),
    reset: vi.fn(),
    getBlockedTimeRemaining: vi.fn(),
  },
}));

vi.mock('@/lib/utils/ip', () => ({
  getClientIp: vi.fn(() => '192.168.1.1'),
}));

describe('POST /api/register', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Default rate limiter behavior: allow requests
    vi.mocked(rateLimiter.check).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('successful registration', () => {
    it('should return 201 Created with user details', async () => {
      // Mock database queries
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No existing user
          }),
        }),
      });

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'user-123',
              username: 'testuser',
              email: 'testuser@example.com',
              role: 'end_user',
              createdAt: new Date('2024-01-01'),
            },
          ]),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);
      vi.mocked(db.insert).mockImplementation(mockInsert);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.message).toBe('Account created successfully');
      expect(data.user).toEqual({
        id: 'user-123',
        username: 'testuser',
        email: 'testuser@example.com',
        role: 'end_user',
        createdAt: expect.any(String),
      });
      expect(data.user.passwordHash).toBeUndefined();
      expect(rateLimiter.reset).toHaveBeenCalledWith('192.168.1.1');
    });

    it('should hash password with bcryptjs', async () => {
      // Mock database queries
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      let capturedPasswordHash: string | undefined;
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockImplementation((values: any) => {
          capturedPasswordHash = values.passwordHash;
          return {
            returning: vi.fn().mockResolvedValue([
              {
                id: 'user-123',
                username: 'testuser',
                email: 'testuser@example.com',
                role: 'end_user',
                createdAt: new Date('2024-01-01'),
              },
            ]),
          };
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);
      vi.mocked(db.insert).mockImplementation(mockInsert);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        }),
      });

      // Execute
      await POST(request);

      // Assert password was hashed (bcrypt hashes start with $2a$ or $2b$)
      expect(capturedPasswordHash).toBeDefined();
      expect(capturedPasswordHash).toMatch(/^\$2[ab]\$/);
      expect(capturedPasswordHash).not.toBe('SecurePass123');
    });

    it('should assign default role "end_user"', async () => {
      // Mock database queries
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      let capturedRole: string | undefined;
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockImplementation((values: any) => {
          capturedRole = values.role;
          return {
            returning: vi.fn().mockResolvedValue([
              {
                id: 'user-123',
                username: 'testuser',
                email: 'testuser@example.com',
                role: 'end_user',
                createdAt: new Date('2024-01-01'),
              },
            ]),
          };
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);
      vi.mocked(db.insert).mockImplementation(mockInsert);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        }),
      });

      // Execute
      await POST(request);

      // Assert
      expect(capturedRole).toBe('end_user');
    });
  });

  describe('duplicate email handling', () => {
    it('should return 409 Conflict if email exists', async () => {
      // Mock database to return existing user
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'existing-user',
                email: 'existing@example.com',
              },
            ]),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(data.error).toBe('Email already exists');
      expect(rateLimiter.recordFailure).toHaveBeenCalledWith('192.168.1.1');
    });
  });

  describe('validation errors', () => {
    it('should return 400 Bad Request for invalid email format', async () => {
      // Create request with invalid email
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details.email).toBeDefined();
      expect(rateLimiter.recordFailure).toHaveBeenCalledWith('192.168.1.1');
    });

    it('should return 400 Bad Request for weak password', async () => {
      // Create request with weak password (no uppercase)
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'weakpass123',
          confirmPassword: 'weakpass123',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details.password).toBeDefined();
      expect(rateLimiter.recordFailure).toHaveBeenCalledWith('192.168.1.1');
    });

    it('should return 400 Bad Request for password mismatch', async () => {
      // Create request with mismatched passwords
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'SecurePass123',
          confirmPassword: 'DifferentPass123',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details.confirmPassword).toBeDefined();
      expect(rateLimiter.recordFailure).toHaveBeenCalledWith('192.168.1.1');
    });

    it('should return 400 Bad Request for missing required fields', async () => {
      // Create request with missing password
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'testuser@example.com',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(rateLimiter.recordFailure).toHaveBeenCalledWith('192.168.1.1');
    });
  });

  describe('rate limiting', () => {
    it('should return 429 Too Many Requests after 5 failed attempts', async () => {
      // Mock rate limiter to block requests
      vi.mocked(rateLimiter.check).mockReturnValue(false);
      vi.mocked(rateLimiter.getBlockedTimeRemaining).mockReturnValue(900000); // 15 minutes

      // Create request
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(429);
      expect(data.error).toContain('Too many registration attempts');
      expect(data.retryAfter).toBe(15); // 15 minutes
    });

    it('should reset rate limiter on successful registration', async () => {
      // Mock database queries
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'user-123',
              username: 'testuser',
              email: 'testuser@example.com',
              role: 'end_user',
              createdAt: new Date('2024-01-01'),
            },
          ]),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);
      vi.mocked(db.insert).mockImplementation(mockInsert);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        }),
      });

      // Execute
      await POST(request);

      // Assert
      expect(rateLimiter.reset).toHaveBeenCalledWith('192.168.1.1');
    });
  });

  describe('security', () => {
    it('should never return passwordHash in response', async () => {
      // Mock database queries
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'user-123',
              username: 'testuser',
              email: 'testuser@example.com',
              role: 'end_user',
              createdAt: new Date('2024-01-01'),
              // passwordHash intentionally excluded from returning()
            },
          ]),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);
      vi.mocked(db.insert).mockImplementation(mockInsert);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(data.user.passwordHash).toBeUndefined();
      expect(data.user.password).toBeUndefined();
    });

    it('should return generic error message on server error', async () => {
      // Mock database to throw error
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('Database connection failed')),
          }),
        }),
      });

      vi.mocked(db.select).mockImplementation(mockSelect);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('An error occurred during registration');
      expect(data.error).not.toContain('Database connection failed');
      expect(rateLimiter.recordFailure).toHaveBeenCalledWith('192.168.1.1');
    });
  });
});
