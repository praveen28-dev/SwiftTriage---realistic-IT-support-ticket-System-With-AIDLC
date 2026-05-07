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
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { config } from '@/lib/config';
import { loginSchema } from '@/lib/validations/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Reject immediately if either field is missing
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Backend validation using Zod schema
          const validationResult = loginSchema.safeParse({
            email: credentials.email,
            password: credentials.password,
          });

          if (!validationResult.success) {
            console.error('[auth] Validation failed:', validationResult.error);
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
          if (!user || !user.isActive) {
            return null;
          }

          // 3. Constant-time bcrypt comparison — prevents timing attacks
          const isValidPassword = await bcrypt.compare(
            password,
            user.passwordHash
          );

          if (!isValidPassword) {
            return null;
          }

          // 4. Return user object — role comes from DB for RBAC
          return {
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role as 'end_user' | 'it_staff' | 'ADMIN',
          };
        } catch (error) {
          // Log the error server-side but return null to the client
          console.error('[auth] authorize error:', error);
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
