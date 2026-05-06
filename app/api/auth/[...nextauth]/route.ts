/**
 * NextAuth.js Authentication Handler
 * 
 * This file ONLY exports HTTP method handlers (GET, POST) to comply with
 * Next.js 14+ App Router constraints. The actual auth configuration is in
 * lib/auth.ts to allow safe imports by other components.
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
