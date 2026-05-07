/**
 * User Registration API Endpoint
 * POST /api/register
 * 
 * Security Features:
 * - Zod schema validation
 * - bcryptjs password hashing (12 salt rounds)
 * - Email uniqueness validation
 * - Input sanitization
 * - Default role assignment (end_user)
 * - Rate limiting (5 attempts per IP per 15 minutes)
 * - Comprehensive logging
 * 
 * Requirements Coverage:
 * - 2.4: Registration form validation
 * - 3.1: Password hashing with bcryptjs (12 salt rounds)
 * - 5.1: Default role assignment (end_user)
 * - 8.1: Backend validation with Zod
 * - 8.2: Reject missing required fields
 * - 8.5: Email uniqueness validation
 * - 9.1: POST /api/register endpoint
 * - 9.4: Return HTTP 201 Created on success
 * - 9.7: Rate limiting (5 attempts per 15 minutes)
 * - 9.8: Log all registration attempts
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { registerSchema } from '@/lib/validations/auth';
import { rateLimiter } from '@/lib/auth/rate-limiter';
import { getClientIp } from '@/lib/utils/ip';
import {
  logRegistrationSuccess,
  logRegistrationFailure,
} from '@/lib/logging/auth-logger';

// Force dynamic rendering (prevent static generation)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const timestamp = new Date().toISOString();

  try {
    // Check rate limiting (5 attempts per IP per 15 minutes)
    if (!rateLimiter.check(clientIp)) {
      const blockedTime = rateLimiter.getBlockedTimeRemaining(clientIp);
      const blockedMinutes = Math.ceil(blockedTime / 60000);

      // Log rate limit violation (handled by rate limiter)
      // Note: Rate limiter logs blocked attempts automatically

      return NextResponse.json(
        {
          error: 'Too many registration attempts. Please try again later.',
          retryAfter: blockedMinutes,
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input with Zod schema
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      // Record failed attempt for rate limiting
      rateLimiter.recordFailure(clientIp);

      // Log validation failure with structured logging
      logRegistrationFailure(clientIp, 'validation_error');

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      // Record failed attempt for rate limiting
      rateLimiter.recordFailure(clientIp);

      // Log duplicate email attempt with structured logging
      logRegistrationFailure(clientIp, 'email_exists', email);

      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Generate username from email (before @ symbol)
    const username = email.split('@')[0];

    // Check if username already exists (unlikely but possible)
    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    // If username exists, append random suffix
    const finalUsername = existingUsername
      ? `${username}_${Math.random().toString(36).substring(2, 8)}`
      : username;

    // Hash password with bcryptjs (12 salt rounds minimum)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with default role "end_user"
    const [newUser] = await db
      .insert(users)
      .values({
        username: finalUsername,
        email,
        passwordHash,
        role: 'end_user',
        isActive: true,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    // Reset rate limiter on successful registration
    rateLimiter.reset(clientIp);

    // Log successful registration with structured logging (without sensitive data)
    logRegistrationSuccess(newUser.id, newUser.email, clientIp, newUser.role);

    // Return 201 Created with user details (excluding password hash)
    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    // Record failed attempt for rate limiting
    rateLimiter.recordFailure(clientIp);

    // Log error with structured logging (without sensitive data)
    logRegistrationFailure(
      clientIp,
      error instanceof Error ? error.message : 'unknown_error'
    );

    // Return generic error to client (don't leak implementation details)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
