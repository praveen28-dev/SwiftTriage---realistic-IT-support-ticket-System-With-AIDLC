import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { config } from "@/lib/config";

/**
 * NextAuth Configuration
 * 
 * Separated from route handler to comply with Next.js 14+ App Router constraints.
 * Route files can only export HTTP method handlers (GET, POST, etc.).
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Simplified authentication for MVP
        // In production, verify against database
        if (credentials?.username && credentials?.password) {
          // Determine role based on username pattern
          const role = credentials.username.startsWith("it_")
            ? "it_staff"
            : "end_user";

          return {
            id: credentials.username,
            name: credentials.username,
            email: `${credentials.username}@example.com`,
            role,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role to JWT token
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose role in session
      if (session.user) {
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: config.nextAuth.secret,
};
