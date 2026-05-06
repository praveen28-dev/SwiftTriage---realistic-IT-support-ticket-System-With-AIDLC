/**
 * Providers Component
 * Wraps the app with necessary providers (NextAuth SessionProvider, Analytics)
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { GoogleAnalytics } from './components/analytics/GoogleAnalytics';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GoogleAnalytics />
      {children}
    </SessionProvider>
  );
}
