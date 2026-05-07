/**
 * Unit Tests for Authentication Logging Utilities
 * 
 * Tests verify:
 * - Auth success logged with user ID and timestamp
 * - Auth failure logged with username and reason
 * - Authorization failure logged with user ID and resource
 * - Sensitive information never logged (passwords, tokens)
 * - Logs use structured JSON format
 * 
 * Requirements Coverage:
 * - 13.1: Log successful authentication with user ID and timestamp
 * - 13.2: Log failed authentication with username and reason
 * - 13.3: Log authorization failures with user ID and resource
 * - 13.6: Never log sensitive information
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  logAuthSuccess,
  logAuthFailure,
  logAuthorizationFailure,
  logRateLimitBlocked,
  logRegistrationSuccess,
  logRegistrationFailure,
} from './auth-logger';

describe('Authentication Logger', () => {
  // Mock console methods
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logAuthSuccess', () => {
    it('should log successful authentication with user ID and timestamp', () => {
      // Requirement 13.1
      const userId = 'user-123';
      const ip = '192.168.1.1';

      logAuthSuccess(userId, ip);

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      expect(logEntry).toMatchObject({
        event: 'auth_success',
        level: 'info',
        userId,
        ip,
      });
      expect(logEntry.timestamp).toBeDefined();
      expect(new Date(logEntry.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should include optional email and role when provided', () => {
      const userId = 'user-123';
      const ip = '192.168.1.1';
      const email = 'user@example.com';
      const role = 'it_staff';

      logAuthSuccess(userId, ip, { email, role });

      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      expect(logEntry).toMatchObject({
        event: 'auth_success',
        userId,
        ip,
        email,
        role,
      });
    });

    it('should use structured JSON format', () => {
      // Requirement 13.7
      const userId = 'user-123';
      const ip = '192.168.1.1';

      logAuthSuccess(userId, ip);

      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      
      // Should be valid JSON
      expect(() => JSON.parse(loggedMessage)).not.toThrow();
      
      const logEntry = JSON.parse(loggedMessage);
      expect(typeof logEntry).toBe('object');
      expect(logEntry.event).toBe('auth_success');
    });

    it('should never log sensitive information', () => {
      // Requirement 13.6
      const userId = 'user-123';
      const ip = '192.168.1.1';

      logAuthSuccess(userId, ip, { email: 'user@example.com', role: 'it_staff' });

      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      // Verify no sensitive fields are present
      expect(logEntry).not.toHaveProperty('password');
      expect(logEntry).not.toHaveProperty('passwordHash');
      expect(logEntry).not.toHaveProperty('token');
      expect(logEntry).not.toHaveProperty('sessionId');
      expect(logEntry).not.toHaveProperty('jwt');
    });
  });

  describe('logAuthFailure', () => {
    it('should log failed authentication with username and reason', () => {
      // Requirement 13.2
      const username = 'user@example.com';
      const ip = '192.168.1.1';
      const reason = 'invalid_credentials';

      logAuthFailure(username, ip, reason);

      expect(consoleWarnSpy).toHaveBeenCalledOnce();
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      expect(logEntry).toMatchObject({
        event: 'auth_failure',
        level: 'warn',
        username,
        ip,
        reason,
      });
      expect(logEntry.timestamp).toBeDefined();
    });

    it('should use structured JSON format', () => {
      const username = 'user@example.com';
      const ip = '192.168.1.1';
      const reason = 'invalid_credentials';

      logAuthFailure(username, ip, reason);

      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      
      // Should be valid JSON
      expect(() => JSON.parse(loggedMessage)).not.toThrow();
      
      const logEntry = JSON.parse(loggedMessage);
      expect(typeof logEntry).toBe('object');
      expect(logEntry.event).toBe('auth_failure');
    });

    it('should never log passwords or tokens', () => {
      // Requirement 13.6
      const username = 'user@example.com';
      const ip = '192.168.1.1';
      const reason = 'invalid_password';

      logAuthFailure(username, ip, reason);

      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      // Verify no sensitive fields are present
      expect(logEntry).not.toHaveProperty('password');
      expect(logEntry).not.toHaveProperty('passwordHash');
      expect(logEntry).not.toHaveProperty('token');
      expect(logEntry).not.toHaveProperty('sessionId');
    });

    it('should log different failure reasons', () => {
      const username = 'user@example.com';
      const ip = '192.168.1.1';

      const reasons = [
        'invalid_credentials',
        'user_not_found',
        'account_inactive',
        'validation_error',
      ];

      reasons.forEach((reason) => {
        logAuthFailure(username, ip, reason);
      });

      expect(consoleWarnSpy).toHaveBeenCalledTimes(reasons.length);

      reasons.forEach((reason, index) => {
        const loggedMessage = consoleWarnSpy.mock.calls[index][0];
        const logEntry = JSON.parse(loggedMessage);
        expect(logEntry.reason).toBe(reason);
      });
    });
  });

  describe('logAuthorizationFailure', () => {
    it('should log authorization failure with user ID and resource', () => {
      // Requirement 13.3
      const userId = 'user-123';
      const resource = '/dashboard/admin';
      const requiredRole = 'ADMIN';

      logAuthorizationFailure(userId, resource, requiredRole);

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      expect(logEntry).toMatchObject({
        event: 'authorization_failure',
        level: 'error',
        userId,
        resource,
        requiredRole,
      });
      expect(logEntry.timestamp).toBeDefined();
    });

    it('should include user role when provided', () => {
      const userId = 'user-123';
      const resource = '/dashboard/admin';
      const requiredRole = 'ADMIN';
      const userRole = 'it_staff';

      logAuthorizationFailure(userId, resource, requiredRole, userRole);

      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      expect(logEntry).toMatchObject({
        userId,
        resource,
        requiredRole,
        userRole,
      });
    });

    it('should use structured JSON format', () => {
      const userId = 'user-123';
      const resource = '/dashboard/admin';
      const requiredRole = 'ADMIN';

      logAuthorizationFailure(userId, resource, requiredRole);

      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      
      // Should be valid JSON
      expect(() => JSON.parse(loggedMessage)).not.toThrow();
      
      const logEntry = JSON.parse(loggedMessage);
      expect(typeof logEntry).toBe('object');
      expect(logEntry.event).toBe('authorization_failure');
    });

    it('should never log sensitive information', () => {
      // Requirement 13.6
      const userId = 'user-123';
      const resource = '/dashboard/admin';
      const requiredRole = 'ADMIN';

      logAuthorizationFailure(userId, resource, requiredRole);

      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      // Verify no sensitive fields are present
      expect(logEntry).not.toHaveProperty('password');
      expect(logEntry).not.toHaveProperty('token');
      expect(logEntry).not.toHaveProperty('sessionId');
    });
  });

  describe('logRateLimitBlocked', () => {
    it('should log rate limit blocked attempts', () => {
      const ip = '192.168.1.1';
      const attemptCount = 5;
      const blockedMinutes = 15;

      logRateLimitBlocked(ip, attemptCount, blockedMinutes);

      expect(consoleWarnSpy).toHaveBeenCalledOnce();
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      expect(logEntry).toMatchObject({
        event: 'rate_limit_blocked',
        level: 'warn',
        ip,
        attemptCount,
        blockedMinutes,
      });
      expect(logEntry.timestamp).toBeDefined();
    });

    it('should use structured JSON format', () => {
      const ip = '192.168.1.1';
      const attemptCount = 5;
      const blockedMinutes = 15;

      logRateLimitBlocked(ip, attemptCount, blockedMinutes);

      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      
      // Should be valid JSON
      expect(() => JSON.parse(loggedMessage)).not.toThrow();
      
      const logEntry = JSON.parse(loggedMessage);
      expect(typeof logEntry).toBe('object');
      expect(logEntry.event).toBe('rate_limit_blocked');
    });
  });

  describe('logRegistrationSuccess', () => {
    it('should log successful registration with user ID and timestamp', () => {
      // Requirement 9.8
      const userId = 'user-123';
      const email = 'user@example.com';
      const ip = '192.168.1.1';
      const role = 'end_user';

      logRegistrationSuccess(userId, email, ip, role);

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      expect(logEntry).toMatchObject({
        event: 'registration_success',
        level: 'info',
        userId,
        email,
        ip,
        role,
      });
      expect(logEntry.timestamp).toBeDefined();
    });

    it('should use structured JSON format', () => {
      const userId = 'user-123';
      const email = 'user@example.com';
      const ip = '192.168.1.1';
      const role = 'end_user';

      logRegistrationSuccess(userId, email, ip, role);

      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      
      // Should be valid JSON
      expect(() => JSON.parse(loggedMessage)).not.toThrow();
      
      const logEntry = JSON.parse(loggedMessage);
      expect(typeof logEntry).toBe('object');
      expect(logEntry.event).toBe('registration_success');
    });

    it('should never log passwords or password hashes', () => {
      // Requirement 13.6
      const userId = 'user-123';
      const email = 'user@example.com';
      const ip = '192.168.1.1';
      const role = 'end_user';

      logRegistrationSuccess(userId, email, ip, role);

      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      // Verify no sensitive fields are present
      expect(logEntry).not.toHaveProperty('password');
      expect(logEntry).not.toHaveProperty('passwordHash');
      expect(logEntry).not.toHaveProperty('token');
    });
  });

  describe('logRegistrationFailure', () => {
    it('should log failed registration with IP and reason', () => {
      // Requirement 9.8
      const ip = '192.168.1.1';
      const reason = 'validation_error';

      logRegistrationFailure(ip, reason);

      expect(consoleWarnSpy).toHaveBeenCalledOnce();
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      expect(logEntry).toMatchObject({
        event: 'registration_failure',
        level: 'warn',
        ip,
        reason,
      });
      expect(logEntry.timestamp).toBeDefined();
    });

    it('should include email when provided', () => {
      const ip = '192.168.1.1';
      const reason = 'email_exists';
      const email = 'user@example.com';

      logRegistrationFailure(ip, reason, email);

      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      expect(logEntry).toMatchObject({
        ip,
        reason,
        email,
      });
    });

    it('should use structured JSON format', () => {
      const ip = '192.168.1.1';
      const reason = 'validation_error';

      logRegistrationFailure(ip, reason);

      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      
      // Should be valid JSON
      expect(() => JSON.parse(loggedMessage)).not.toThrow();
      
      const logEntry = JSON.parse(loggedMessage);
      expect(typeof logEntry).toBe('object');
      expect(logEntry.event).toBe('registration_failure');
    });

    it('should never log passwords', () => {
      // Requirement 13.6
      const ip = '192.168.1.1';
      const reason = 'validation_error';

      logRegistrationFailure(ip, reason);

      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      // Verify no sensitive fields are present
      expect(logEntry).not.toHaveProperty('password');
      expect(logEntry).not.toHaveProperty('passwordHash');
    });
  });

  describe('Timestamp format', () => {
    it('should use ISO 8601 format for all timestamps', () => {
      // Requirement 13.4
      const userId = 'user-123';
      const ip = '192.168.1.1';

      logAuthSuccess(userId, ip);

      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(loggedMessage);

      // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(logEntry.timestamp).toMatch(isoRegex);
    });
  });

  describe('Sensitive information protection', () => {
    it('should never log passwords in any log entry', () => {
      // Requirement 13.6
      const testCases = [
        () => logAuthSuccess('user-123', '192.168.1.1'),
        () => logAuthFailure('user@example.com', '192.168.1.1', 'invalid_password'),
        () => logAuthorizationFailure('user-123', '/admin', 'ADMIN'),
        () => logRateLimitBlocked('192.168.1.1', 5, 15),
        () => logRegistrationSuccess('user-123', 'user@example.com', '192.168.1.1', 'end_user'),
        () => logRegistrationFailure('192.168.1.1', 'validation_error'),
      ];

      testCases.forEach((testCase) => {
        testCase();
      });

      const allLogs = [
        ...consoleLogSpy.mock.calls,
        ...consoleWarnSpy.mock.calls,
        ...consoleErrorSpy.mock.calls,
      ];

      allLogs.forEach((call) => {
        const loggedMessage = call[0];
        const logEntry = JSON.parse(loggedMessage);

        // Verify no sensitive fields
        expect(logEntry).not.toHaveProperty('password');
        expect(logEntry).not.toHaveProperty('passwordHash');
        expect(logEntry).not.toHaveProperty('token');
        expect(logEntry).not.toHaveProperty('sessionId');
        expect(logEntry).not.toHaveProperty('jwt');
        expect(logEntry).not.toHaveProperty('refreshToken');
      });
    });
  });
});
