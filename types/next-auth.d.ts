/**
 * NextAuth Type Augmentation
 * Extends Session, User, and JWT interfaces to include role field
 */

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'it_staff' | 'ADMIN' | 'end_user';
    };
  }

  interface User {
    role: 'it_staff' | 'ADMIN' | 'end_user';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'it_staff' | 'ADMIN' | 'end_user';
  }
}
