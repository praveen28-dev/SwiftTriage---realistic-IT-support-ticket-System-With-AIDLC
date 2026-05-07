/**
 * NextAuth Configuration
 *
 * Security Implementation:
 * - Credentials-only authentication (no OAuth providers)
 * - bcryptjs password hashing with constant-time comparison
 * - JWT session strategy with 8-hour expiration
 * - Role-based access control (RBAC) via JWT token
 * - Backend validation using Zod schemas
 * - HttpOnly cookies for token storage
 * - CSRF protection (enabled by default in NextAuth.js)
 *   - CSRF tokens automatically generated and validated
 *   - Tokens included in all state-changing requests
 *   - Double-submit cookie pattern implementation
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { config } from '@/lib/config';
import { loginSchema } from '@/lib/validations/auth';
import { logAuthSuccess, logAuthFailure } from '@/lib/logging/auth-logger';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        // Reject immediately if either field is missing
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Extract IP address for logging (from NextAuth request object)
        const ip = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
                   req?.headers?.['x-real-ip'] ||
                   'unknown';

        try {
          // Backend validation using Zod schema
          const validationResult = loginSchema.safeParse({
            email: credentials.email,
            password: credentials.password,
          });

          if (!validationResult.success) {
            logAuthFailure(credentials.email, ip, 'validation_error');
            return null;
          }

          const { email, password } = validationResult.data;

          // 1. Look up user in the database by email
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          // 2. User not found — return null (do NOT reveal whether user exists)
          if (!user) {
            logAuthFailure(email, ip, 'user_not_found');
            return null;
          }

          // Check if user is active
          if (!user.isActive) {
            logAuthFailure(email, ip, 'account_inactive');
            return null;
          }

          // 3. Constant-time bcrypt comparison — prevents timing attacks
          const isValidPassword = await bcrypt.compare(
            password,
            user.passwordHash
          );

          if (!isValidPassword) {
            logAuthFailure(email, ip, 'invalid_password');
            return null;
          }

          // 4. Log successful authentication
          logAuthSuccess(user.id, ip, {
            email: user.email,
            role: user.role,
          });

          // 5. Return user object — role comes from DB for RBAC
          return {
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role as 'end_user' | 'it_staff' | 'ADMIN',
          };
        } catch (error) {
          // Log the error server-side but return null to the client
          logAuthFailure(
            credentials.email,
            ip,
            error instanceof Error ? error.message : 'unknown_error'
          );
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Embed role in JWT at sign-in time
      if (user) {
        token.role = (user as any).role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose role and userId in the session object
      if (session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.userId as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Try to extract callbackUrl from query parameters first
      try {
        const urlObj = new URL(url);
        const callbackUrl = urlObj.searchParams.get('callbackUrl');
        if (callbackUrl) {
          // Security: Only allow callbacks to the same origin
          if (callbackUrl.startsWith(baseUrl) || callbackUrl.startsWith('/')) {
            return callbackUrl.startsWith('/') ? `${baseUrl}${callbackUrl}` : callbackUrl;
          }
          // If callbackUrl is present but invalid (external URL), return baseUrl for security
          return baseUrl;
        }
      } catch (error) {
        // Invalid URL, fall through to default
        console.error('[auth] Invalid redirect URL:', error);
      }
      
      // If there's no callbackUrl parameter and URL starts with baseUrl, use it
      // But only if it's not the auth callback URL itself
      if (url.startsWith(baseUrl) && !url.includes('/api/auth/callback')) {
        return url;
      }
      
      // Default: return baseUrl
      // Note: We can't access the token directly in the redirect callback,
      // so we'll handle role-based redirection on the client side after sign-in
      return baseUrl;
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours — force re-authentication daily
  },

  secret: config.nextAuth.secret,
};
