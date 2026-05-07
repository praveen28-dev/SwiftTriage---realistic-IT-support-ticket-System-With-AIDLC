# Implementation Plan: Secure Authentication System

## Overview

This implementation plan converts the secure authentication system design into actionable coding tasks. The system replaces the current basic authentication with a production-ready solution featuring bcryptjs password hashing, JWT-based session management, role-based access control (RBAC), and comprehensive security hardening.

**Implementation Approach**:
- Build from the bottom up: Database → API → Middleware → UI
- Validate security at each layer before proceeding
- Integrate incrementally with checkpoints for testing
- Focus on defense-in-depth security model

**Technology Stack**:
- Next.js 14.2.35 (App Router)
- NextAuth.js 4.24.0
- bcryptjs 3.0.3
- Zod 3.23.0
- PostgreSQL with Drizzle ORM 0.30.0
- TypeScript

## Tasks

### Phase 1: Database & Schema (Storage Layer)

- [x] 1. Update database schema for authentication
  - [x] 1.1 Add authentication fields to users table
    - Add `passwordHash` field (text, not null) to users table schema
    - Add `isActive` field (boolean, default true) for soft deletes
    - Add `createdAt` and `updatedAt` timestamp fields
    - Ensure `email` field has unique constraint
    - Ensure `username` field has unique constraint
    - _Requirements: 3.3, 5.2, 15.3_
  
  - [x] 1.2 Create database indexes for performance
    - Create index `idx_users_email` on users.email for fast login lookups
    - Create index `idx_users_role` on users.role for authorization queries
    - _Requirements: Performance NFR 2_
  
  - [x] 1.3 Generate and apply database migration
    - Run `npm run db:generate` to create migration files
    - Review generated SQL migration for correctness
    - Run `npm run db:push` to apply schema changes to database
    - Verify schema changes in database
    - _Requirements: 3.3, 5.2_

- [x] 2. Checkpoint - Verify database schema
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Validation & Logic (Security Layer)

- [x] 3. Implement input validation schemas
  - [x] 3.1 Create authentication validation schemas
    - Create or update `lib/validations/auth.ts` file
    - Define `loginSchema` with email (RFC 5322 compliant, max 255 chars) and password (min 1 char) validation
    - Define `registerSchema` with email, password (min 8 chars, 1 uppercase, 1 lowercase, 1 number), and confirmPassword validation
    - Add password confirmation matching validation
    - Export TypeScript types: `LoginInput`, `RegisterInput`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.8_
  
  - [x] 3.2 Write unit tests for validation schemas
    - Test valid email formats (RFC 5322 compliant)
    - Test invalid email formats (missing @, invalid domain)
    - Test password complexity rules (uppercase, lowercase, number)
    - Test password length requirements (min 8 chars)
    - Test password confirmation matching
    - Test maximum field lengths (email 255 chars, password 128 chars)
    - _Requirements: 7.1, 7.2, 7.3, 8.3_

- [x] 4. Implement password hashing utilities
  - [x] 4.1 Create password hashing module
    - Create `lib/auth/password.ts` file
    - Implement `hashPassword(password: string): Promise<string>` using bcryptjs with 12 salt rounds
    - Implement `verifyPassword(password: string, hash: string): Promise<boolean>` using bcryptjs constant-time comparison
    - Add configuration for salt rounds (default 12, configurable up to 15)
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [x] 4.2 Write unit tests for password hashing
    - Test password hashing produces different hashes for same password (salt randomness)
    - Test password verification succeeds for correct password
    - Test password verification fails for incorrect password
    - Test hashing completes within 500ms at 95th percentile
    - Test constant-time comparison (timing attack resistance)
    - _Requirements: 3.1, 3.4, Performance NFR 1_

- [x] 5. Implement rate limiting
  - [x] 5.1 Create rate limiter module
    - Create `lib/auth/rate-limiter.ts` file
    - Implement `RateLimiter` class with in-memory Map storage
    - Implement `check(ip: string): boolean` method (returns true if allowed, false if blocked)
    - Implement `recordFailure(ip: string): void` method
    - Implement `reset(ip: string): void` method (called on successful login)
    - Configure: 5 max attempts, 15-minute window, 15-minute block duration
    - Add periodic cleanup of expired entries
    - _Requirements: 9.7, 15.1, 15.2, 15.3_
  
  - [x] 5.2 Write unit tests for rate limiter
    - Test allows requests under limit (1-4 attempts)
    - Test blocks requests at limit (5 attempts)
    - Test resets counter after successful login
    - Test expired entries are cleaned up
    - Test sliding window behavior
    - _Requirements: 9.7, 15.1, 15.2_

- [x] 6. Checkpoint - Verify security utilities
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Authentication Infrastructure (Auth Layer)

- [x] 7. Implement user registration API
  - [x] 7.1 Create registration endpoint
    - Create or update `app/api/register/route.ts` file
    - Implement POST handler with request body parsing
    - Validate request body using `registerSchema`
    - Check email uniqueness in database
    - Hash password using `hashPassword` utility (12 salt rounds)
    - Create user record with default role 'end_user'
    - Return HTTP 201 Created with user details (exclude passwordHash)
    - Return HTTP 409 Conflict if email exists
    - Return HTTP 400 Bad Request for validation errors
    - Add rate limiting protection (5 attempts per IP per 15 minutes)
    - Log all registration attempts with timestamp, IP, and outcome
    - _Requirements: 2.4, 3.1, 5.1, 8.1, 8.2, 8.5, 9.1, 9.4, 9.7, 9.8_
  
  - [x] 7.2 Write unit tests for registration API
    - Test successful registration returns 201 with user details
    - Test duplicate email returns 409 Conflict
    - Test invalid email format returns 400 Bad Request
    - Test weak password returns 400 Bad Request
    - Test password mismatch returns 400 Bad Request
    - Test rate limiting blocks after 5 attempts
    - Test passwordHash is never returned in response
    - _Requirements: 2.4, 3.3, 8.1, 8.5, 9.4, 9.7_

- [x] 8. Configure NextAuth.js for authentication
  - [x] 8.1 Create NextAuth configuration
    - Create or update `lib/auth.ts` file
    - Configure `authOptions` with CredentialsProvider
    - Implement `authorize` function with email/password validation
    - Query user from database using Drizzle ORM
    - Verify password using `verifyPassword` utility
    - Check `isActive` flag (reject inactive users)
    - Return user object with id, email, name, role for JWT
    - Configure JWT callback to embed role and userId in token
    - Configure session callback to expose role and userId in session
    - Set session strategy to 'jwt'
    - Set session maxAge to 8 hours (28800 seconds)
    - Configure JWT secret from environment variable
    - _Requirements: 3.4, 4.1, 4.2, 4.4, 4.7, 5.4, 11.1_
  
  - [x] 8.2 Create NextAuth API route
    - Create `app/api/auth/[...nextauth]/route.ts` file
    - Import `authOptions` from `lib/auth.ts`
    - Create NextAuth handler with GET and POST exports
    - _Requirements: 9.2, 9.3_
  
  - [x] 8.3 Write integration tests for authentication
    - Test successful login with valid credentials returns 200 OK
    - Test login with invalid email returns 401 Unauthorized
    - Test login with invalid password returns 401 Unauthorized
    - Test login with inactive user returns 401 Unauthorized
    - Test JWT token contains role and userId
    - Test session object exposes role and userId
    - Test generic error message for failed login (no username/password leak)
    - _Requirements: 3.4, 3.5, 4.4, 5.4, 9.6_

- [~] 9. Implement logout functionality
  - [~] 9.1 Create logout endpoint
    - Create `app/api/logout/route.ts` file
    - Implement POST handler that clears NextAuth session cookie
    - Set cookie expiration to past date (Thu, 01 Jan 1970 00:00:00 GMT)
    - Set HttpOnly, SameSite=Lax attributes
    - Return HTTP 200 OK with success message
    - _Requirements: 11.3, 11.4_
  
  - [~] 9.2 Write unit tests for logout endpoint
    - Test logout clears session cookie
    - Test logout returns 200 OK
    - Test cookie has past expiration date
    - _Requirements: 11.3, 11.4_

- [~] 10. Implement session management utilities
  - [~] 10.1 Create authentication helper functions
    - Create `lib/auth/auth-utils.ts` file
    - Implement `getAuthSession()` function using `getServerSession(authOptions)`
    - Implement `requireAuth()` function that throws if not authenticated
    - Implement `requireRole(allowedRoles: string[])` function that checks role permissions
    - Export functions for use in API routes and server components
    - _Requirements: 5.5, 5.6, 6.1, 6.2_
  
  - [~] 10.2 Write unit tests for auth utilities
    - Test `getAuthSession` returns session for authenticated user
    - Test `getAuthSession` returns null for unauthenticated user
    - Test `requireAuth` throws for unauthenticated user
    - Test `requireRole` allows user with sufficient role
    - Test `requireRole` throws for user with insufficient role
    - _Requirements: 5.6, 6.6_

- [~] 11. Checkpoint - Verify authentication infrastructure
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Middleware & RBAC (Authorization Layer)

- [~] 12. Implement RBAC middleware
  - [~] 12.1 Create Next.js middleware for route protection
    - Create or update `middleware.ts` file in project root
    - Import `getToken` from `next-auth/jwt`
    - Implement middleware function that validates JWT tokens
    - Redirect to `/login` with callbackUrl if no valid token
    - Define role requirements map for protected routes:
      - `/dashboard/admin`: ['ADMIN']
      - `/dashboard`: ['it_staff', 'ADMIN']
      - `/submit`: ['end_user', 'it_staff', 'ADMIN']
    - Extract user role from JWT token
    - Check if user role meets route requirements
    - Return HTTP 403 Forbidden and redirect to `/403` if insufficient permissions
    - Log authorization failures with user ID, requested resource, and required role
    - Configure matcher for protected routes (dashboard, submit, API routes)
    - _Requirements: 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [~] 12.2 Write integration tests for RBAC middleware
    - Test unauthenticated user redirected to login
    - Test authenticated user with sufficient role allowed access
    - Test authenticated user with insufficient role receives 403
    - Test callbackUrl preserved for post-login redirection
    - Test ADMIN can access all routes
    - Test it_staff can access dashboard but not admin dashboard
    - Test end_user can access submit but not dashboard
    - _Requirements: 5.7, 6.1, 6.2, 6.6, 6.7_

- [~] 13. Implement role-based redirection
  - [~] 13.1 Create post-login redirection logic
    - Update `lib/auth.ts` NextAuth configuration
    - Add `redirect` callback to handle post-login redirection
    - Read user role from JWT token
    - Redirect 'ADMIN' to `/dashboard/admin`
    - Redirect 'it_staff' to `/dashboard`
    - Redirect 'end_user' to `/submit`
    - Preserve callbackUrl if present (user accessed protected route before login)
    - Use Next.js router for client-side redirection
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [~] 13.2 Write integration tests for role-based redirection
    - Test ADMIN redirected to `/dashboard/admin` after login
    - Test it_staff redirected to `/dashboard` after login
    - Test end_user redirected to `/submit` after login
    - Test callbackUrl takes precedence over default redirection
    - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [~] 14. Checkpoint - Verify authorization layer
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: UI & Frontend (UX Layer)

- [~] 15. Implement login/register form UI
  - [~] 15.1 Create login page component
    - Create `app/login/page.tsx` file
    - Implement toggleable form with 'signin' and 'register' modes
    - Add email input field with validation feedback
    - Add password input field with validation feedback
    - Add confirm password field (register mode only)
    - Implement mode toggle button to switch between signin/register
    - Add form submission handler with loading state
    - Display field-specific error messages below inputs
    - Add ARIA labels and attributes for screen reader accessibility
    - Implement focus rings with WCAG 2.1 AA compliant contrast
    - Make form responsive across mobile, tablet, desktop viewports
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 7.5, 7.6, Accessibility NFR 1, 2, 3_
  
  - [~] 15.2 Implement client-side validation
    - Use `loginSchema` and `registerSchema` from `lib/validations/auth.ts`
    - Validate on input change (real-time feedback)
    - Display email format errors
    - Display password complexity errors
    - Display password confirmation mismatch errors
    - Prevent form submission until all validation passes
    - Sanitize input to prevent XSS (escape HTML special characters)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [~] 15.3 Implement form submission logic
    - Call `/api/register` for registration mode
    - Call NextAuth `signIn('credentials')` for signin mode
    - Handle loading states during submission
    - Display success messages on successful registration
    - Display error messages on failure (generic "Invalid credentials" for login)
    - Redirect to appropriate dashboard after successful login
    - _Requirements: 2.3, 2.4, 3.5, 9.1, 9.2, 9.6_
  
  - [~] 15.4 Write unit tests for login form component
    - Test mode toggle switches between signin and register
    - Test email validation displays errors for invalid format
    - Test password validation displays errors for weak passwords
    - Test confirm password validation displays mismatch errors
    - Test form submission disabled until validation passes
    - Test loading state displayed during submission
    - Test error messages have appropriate ARIA attributes
    - _Requirements: 2.1, 2.5, 7.5, 7.6_

- [~] 16. Implement security headers and CSRF protection
  - [~] 16.1 Configure security headers
    - Update `next.config.js` or create `middleware.ts` security headers
    - Set `Content-Security-Policy` to prevent inline script execution
    - Set `X-Frame-Options: DENY` to prevent clickjacking
    - Set `X-Content-Type-Options: nosniff` to prevent MIME sniffing
    - Set `Strict-Transport-Security` for HTTPS enforcement
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [~] 16.2 Implement CSRF protection
    - Configure NextAuth CSRF token generation (enabled by default)
    - Ensure CSRF tokens included in form submissions
    - Validate CSRF tokens on state-changing requests
    - _Requirements: 12.5, 12.6, 12.7_
  
  - [~] 16.3 Write integration tests for security headers
    - Test CSP header present in responses
    - Test X-Frame-Options header present
    - Test X-Content-Type-Options header present
    - Test Strict-Transport-Security header present (HTTPS only)
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [~] 17. Implement error handling and logging
  - [~] 17.1 Create logging utilities
    - Create `lib/logging/auth-logger.ts` file
    - Implement `logAuthSuccess(userId: string, ip: string)` function
    - Implement `logAuthFailure(username: string, ip: string, reason: string)` function
    - Implement `logAuthorizationFailure(userId: string, resource: string, requiredRole: string)` function
    - Use structured JSON format for logs
    - Never log sensitive information (passwords, tokens, session IDs)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6_
  
  - [~] 17.2 Integrate logging into authentication flow
    - Add logging to registration API (success and failure)
    - Add logging to NextAuth authorize function (success and failure)
    - Add logging to RBAC middleware (authorization failures)
    - Add logging to rate limiter (blocked attempts)
    - Include timestamp, IP address, and outcome in all logs
    - _Requirements: 9.8, 13.1, 13.2, 13.4, 13.7_
  
  - [~] 17.3 Write unit tests for logging utilities
    - Test auth success logged with user ID and timestamp
    - Test auth failure logged with username and reason
    - Test authorization failure logged with user ID and resource
    - Test sensitive information never logged (passwords, tokens)
    - Test logs use structured JSON format
    - _Requirements: 13.1, 13.2, 13.3, 13.6_

- [~] 18. Create 403 Forbidden page
  - [~] 18.1 Create access denied page
    - Create `app/403/page.tsx` file
    - Display user-friendly "Access Denied" message
    - Explain insufficient permissions
    - Provide link to return to appropriate dashboard
    - Make page accessible (WCAG 2.1 AA compliant)
    - _Requirements: 5.7, 6.6_

- [~] 19. Checkpoint - Verify UI and security features
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6: Integration & Final Validation

- [~] 20. Integration and end-to-end testing
  - [~] 20.1 Write end-to-end authentication flow tests
    - Test complete registration flow (form → API → database)
    - Test complete login flow (form → NextAuth → JWT → redirect)
    - Test complete logout flow (logout → cookie cleared → redirect to login)
    - Test protected route access (unauthenticated → redirect to login)
    - Test role-based access (end_user cannot access admin dashboard)
    - Test session expiration (8 hours → redirect to login)
    - _Requirements: All authentication and authorization requirements_
  
  - [~] 20.2 Write security validation tests
    - Test XSS prevention (malicious input sanitized)
    - Test CSRF protection (requests without token rejected)
    - Test rate limiting (5 failed attempts → account locked)
    - Test password hashing (plaintext never stored)
    - Test HttpOnly cookies (JavaScript cannot access tokens)
    - Test timing attack resistance (constant-time password comparison)
    - _Requirements: 3.1, 3.3, 3.4, 4.3, 4.4, 7.7, 9.7, 12.5, Security NFR 3_
  
  - [~] 20.3 Write performance validation tests
    - Test password hashing completes within 500ms (95th percentile)
    - Test login API responds within 1000ms (95th percentile)
    - Test RBAC middleware validates within 50ms (95th percentile)
    - Test system handles 1000 concurrent authentication requests
    - _Requirements: Performance NFR 1, 2, 3, Scalability NFR 1_

- [~] 21. Update environment configuration
  - [~] 21.1 Document required environment variables
    - Update `.env.local.example` file
    - Add `NEXTAUTH_SECRET` (minimum 256 bits, cryptographically secure)
    - Add `NEXTAUTH_URL` (application base URL)
    - Add `DATABASE_URL` (PostgreSQL connection string)
    - Add `BCRYPT_SALT_ROUNDS` (default 12, configurable up to 15)
    - Document each variable's purpose and format
    - _Requirements: 4.2, 11.1_
  
  - [~] 21.2 Validate environment configuration
    - Create validation script to check required variables
    - Verify `NEXTAUTH_SECRET` is at least 32 characters
    - Verify `DATABASE_URL` is valid PostgreSQL connection string
    - Verify `BCRYPT_SALT_ROUNDS` is between 12 and 15
    - _Requirements: 4.2, Security NFR 2_

- [~] 22. Final checkpoint - Complete system validation
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all 15 functional requirements are implemented
  - Verify all non-functional requirements are met
  - Verify security headers are configured
  - Verify rate limiting is active
  - Verify logging is comprehensive
  - Verify accessibility standards are met (WCAG 2.1 AA)

## Notes

- **Tasks marked with `*` are optional** and can be skipped for faster MVP delivery
- **Each task references specific requirements** for traceability back to requirements.md
- **Checkpoints ensure incremental validation** at each phase boundary
- **Unit tests validate specific examples and edge cases** for individual components
- **Integration tests validate interactions** between components (auth flow, middleware, etc.)
- **End-to-end tests validate complete user journeys** from UI to database
- **Security is validated at every layer** following defense-in-depth model
- **All code uses TypeScript** for type safety and better developer experience
- **Existing codebase integration**: This plan assumes integration with existing Next.js 14 App Router application with Drizzle ORM and PostgreSQL

## Requirements Coverage

This implementation plan covers all 15 functional requirements:

- **Req 1**: Email/password only authentication (Tasks 7, 8)
- **Req 2**: Modern toggleable UI (Task 15)
- **Req 3**: Secure password hashing (Tasks 4, 7, 8)
- **Req 4**: Secure token storage (Task 8)
- **Req 5**: Role-based access control (Tasks 1, 8, 12)
- **Req 6**: Protected route middleware (Task 12)
- **Req 7**: Frontend input validation (Tasks 3, 15)
- **Req 8**: Backend validation and sanitization (Tasks 3, 7)
- **Req 9**: Secure API endpoints (Tasks 7, 8, 9)
- **Req 10**: Role-based dashboard redirection (Task 13)
- **Req 11**: Session management (Tasks 8, 9, 10)
- **Req 12**: Security headers and CSRF protection (Task 16)
- **Req 13**: Error handling and logging (Task 17)
- **Req 14**: Password reset functionality (Not included - future enhancement)
- **Req 15**: Account lockout protection (Task 5, integrated with rate limiting)

**Note**: Requirement 14 (Password reset functionality) is not included in this initial implementation plan. It can be added as a future enhancement after the core authentication system is validated and deployed.
