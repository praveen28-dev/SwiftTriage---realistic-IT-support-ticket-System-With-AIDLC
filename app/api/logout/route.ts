/**
 * User Logout API Endpoint
 * POST /api/logout
 * 
 * Security Features:
 * - Clears NextAuth session cookie
 * - Sets cookie expiration to past date
 * - HttpOnly and SameSite=Lax attributes
 * - Comprehensive logging
 * 
 * Requirements Coverage:
 * - 11.3: Logout endpoint that clears authentication cookies
 * - 11.4: Set cookie expiration to past date
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/utils/ip';

// Force dynamic rendering (prevent static generation)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const timestamp = new Date().toISOString();

  try {
    // Log logout attempt
    console.log('[logout] Logout initiated:', {
      ip: clientIp,
      timestamp,
    });

    // Create response with success message
    const response = NextResponse.json(
      {
        message: 'Logged out successfully',
        success: true,
      },
      { status: 200 }
    );

    // Clear NextAuth session cookies
    // NextAuth uses different cookie names based on environment:
    // - Development: next-auth.session-token
    // - Production (HTTPS): __Secure-next-auth.session-token
    
    // Clear development cookie
    response.cookies.set('next-auth.session-token', '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT'),
    });

    // Clear production cookie (HTTPS)
    response.cookies.set('__Secure-next-auth.session-token', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT'),
    });

    // Also clear the callback URL cookie if it exists
    response.cookies.set('next-auth.callback-url', '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT'),
    });

    response.cookies.set('__Secure-next-auth.callback-url', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT'),
    });

    // Log successful logout
    console.log('[logout] Logout successful:', {
      ip: clientIp,
      timestamp,
    });

    return response;
  } catch (error) {
    // Log error server-side
    console.error('[logout] Logout error:', {
      ip: clientIp,
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Return generic error to client
    return NextResponse.json(
      { error: 'An error occurred during logout', success: false },
      { status: 500 }
    );
  }
}
