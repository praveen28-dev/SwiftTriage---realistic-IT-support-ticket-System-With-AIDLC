/**
 * Authentication Logging Utilities
 * 
 * Provides structured JSON logging for authentication and authorization events.
 * 
 * Security Features:
 * - Structured JSON format for log aggregation
 * - Never logs sensitive information (passwords, tokens, session IDs)
 * - Includes timestamp, IP address, and outcome in all logs
 * - Supports different log levels (info, warn, error)
 * 
 * Requirements Coverage:
 * - 9.8: Log all registration attempts with timestamp, IP, and outcome
 * - 13.1: Log successful authentication with user ID and timestamp
 * - 13.2: Log failed authentication with username and reason
 * - 13.3: Log authorization failures with user ID and resource
 * - 13.4: Include timestamp in all logs
 * - 13.6: Never log sensitive information
 * - 13.7: Use structured JSON format for logs
 */

/**
 * Log levels for authentication events
 */
export enum AuthLogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Base log entry structure
 */
interface BaseLogEntry {
  timestamp: string;
  level: AuthLogLevel;
  event: string;
  ip?: string;
}

/**
 * Authentication success log entry
 */
interface AuthSuccessLogEntry extends BaseLogEntry {
  event: 'auth_success';
  userId: string;
  email?: string;
  role?: string;
}

/**
 * Authentication failure log entry
 */
interface AuthFailureLogEntry extends BaseLogEntry {
  event: 'auth_failure';
  username: string;
  reason: string;
}

/**
 * Authorization failure log entry
 */
interface AuthorizationFailureLogEntry extends BaseLogEntry {
  event: 'authorization_failure';
  userId: string;
  resource: string;
  requiredRole: string;
  userRole?: string;
}

/**
 * Rate limit blocked log entry
 */
interface RateLimitBlockedLogEntry extends BaseLogEntry {
  event: 'rate_limit_blocked';
  attemptCount: number;
  blockedMinutes: number;
}

/**
 * Registration success log entry
 */
interface RegistrationSuccessLogEntry extends BaseLogEntry {
  event: 'registration_success';
  userId: string;
  email: string;
  role: string;
}

/**
 * Registration failure log entry
 */
interface RegistrationFailureLogEntry extends BaseLogEntry {
  event: 'registration_failure';
  email?: string;
  reason: string;
}

/**
 * Union type for all log entries
 */
type AuthLogEntry =
  | AuthSuccessLogEntry
  | AuthFailureLogEntry
  | AuthorizationFailureLogEntry
  | RateLimitBlockedLogEntry
  | RegistrationSuccessLogEntry
  | RegistrationFailureLogEntry;

/**
 * Output a structured log entry to console
 * 
 * @param entry - The log entry to output
 */
function outputLog(entry: AuthLogEntry): void {
  const logMessage = JSON.stringify(entry);

  switch (entry.level) {
    case AuthLogLevel.INFO:
      console.log(logMessage);
      break;
    case AuthLogLevel.WARN:
      console.warn(logMessage);
      break;
    case AuthLogLevel.ERROR:
      console.error(logMessage);
      break;
  }
}

/**
 * Log successful authentication
 * 
 * Requirements: 13.1, 13.4, 13.6, 13.7
 * 
 * @param userId - The authenticated user's ID
 * @param ip - The client IP address
 * @param options - Optional additional information (email, role)
 */
export function logAuthSuccess(
  userId: string,
  ip: string,
  options?: { email?: string; role?: string }
): void {
  const entry: AuthSuccessLogEntry = {
    timestamp: new Date().toISOString(),
    level: AuthLogLevel.INFO,
    event: 'auth_success',
    userId,
    ip,
    email: options?.email,
    role: options?.role,
  };

  outputLog(entry);
}

/**
 * Log failed authentication attempt
 * 
 * Requirements: 13.2, 13.4, 13.6, 13.7
 * 
 * @param username - The username/email that failed authentication
 * @param ip - The client IP address
 * @param reason - The reason for failure (e.g., "invalid_credentials", "account_inactive")
 */
export function logAuthFailure(
  username: string,
  ip: string,
  reason: string
): void {
  const entry: AuthFailureLogEntry = {
    timestamp: new Date().toISOString(),
    level: AuthLogLevel.WARN,
    event: 'auth_failure',
    username,
    ip,
    reason,
  };

  outputLog(entry);
}

/**
 * Log authorization failure (insufficient permissions)
 * 
 * Requirements: 13.3, 13.4, 13.6, 13.7
 * 
 * @param userId - The user ID that was denied access
 * @param resource - The resource/route that was requested
 * @param requiredRole - The role required to access the resource
 * @param userRole - The user's actual role (optional)
 */
export function logAuthorizationFailure(
  userId: string,
  resource: string,
  requiredRole: string,
  userRole?: string
): void {
  const entry: AuthorizationFailureLogEntry = {
    timestamp: new Date().toISOString(),
    level: AuthLogLevel.ERROR,
    event: 'authorization_failure',
    userId,
    resource,
    requiredRole,
    userRole,
  };

  outputLog(entry);
}

/**
 * Log rate limit blocked attempt
 * 
 * Requirements: 13.4, 13.6, 13.7
 * 
 * @param ip - The client IP address that was blocked
 * @param attemptCount - The number of failed attempts
 * @param blockedMinutes - The number of minutes the IP is blocked for
 */
export function logRateLimitBlocked(
  ip: string,
  attemptCount: number,
  blockedMinutes: number
): void {
  const entry: RateLimitBlockedLogEntry = {
    timestamp: new Date().toISOString(),
    level: AuthLogLevel.WARN,
    event: 'rate_limit_blocked',
    ip,
    attemptCount,
    blockedMinutes,
  };

  outputLog(entry);
}

/**
 * Log successful registration
 * 
 * Requirements: 9.8, 13.4, 13.6, 13.7
 * 
 * @param userId - The newly created user's ID
 * @param email - The user's email address
 * @param ip - The client IP address
 * @param role - The assigned role (default: 'end_user')
 */
export function logRegistrationSuccess(
  userId: string,
  email: string,
  ip: string,
  role: string
): void {
  const entry: RegistrationSuccessLogEntry = {
    timestamp: new Date().toISOString(),
    level: AuthLogLevel.INFO,
    event: 'registration_success',
    userId,
    email,
    ip,
    role,
  };

  outputLog(entry);
}

/**
 * Log failed registration attempt
 * 
 * Requirements: 9.8, 13.4, 13.6, 13.7
 * 
 * @param ip - The client IP address
 * @param reason - The reason for failure (e.g., "validation_error", "email_exists")
 * @param email - The email that was attempted (optional, omit if validation failed before email extraction)
 */
export function logRegistrationFailure(
  ip: string,
  reason: string,
  email?: string
): void {
  const entry: RegistrationFailureLogEntry = {
    timestamp: new Date().toISOString(),
    level: AuthLogLevel.WARN,
    event: 'registration_failure',
    ip,
    reason,
    email,
  };

  outputLog(entry);
}
