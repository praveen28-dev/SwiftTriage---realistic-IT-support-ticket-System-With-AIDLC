/**
 * NextAuth Configuration
 *
 * Security fixes applied:
 * CRIT-01 — Replaced username-pattern role assignment with database-backed
 *            credential verification using bcryptjs password hashing.
 *            Role is now read from the users table, not inferred from the username.
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { config } from '@/lib/config';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Reject immediately if either field is missing
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // 1. Look up user in the database by username
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, credentials.username))
            .limit(1);

          // 2. User not found — return null (do NOT reveal whether user exists)
          if (!user || !user.isActive) {
            return null;
          }

          // 3. Constant-time bcrypt comparison — prevents timing attacks
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isValidPassword) {
            return null;
          }

          // 4. Return user object — role comes from DB, never from username pattern
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
