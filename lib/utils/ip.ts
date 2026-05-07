/**
 * IP Address Utilities
 * 
 * Extracts client IP address from Next.js requests
 * Handles various proxy headers (X-Forwarded-For, X-Real-IP, etc.)
 */

import { NextRequest } from 'next/server';

/**
 * Extract client IP address from Next.js request
 * 
 * Checks headers in order of preference:
 * 1. x-forwarded-for (most common proxy header)
 * 2. x-real-ip (nginx proxy)
 * 3. cf-connecting-ip (Cloudflare)
 * 4. request.ip (Next.js built-in)
 * 
 * @param request - Next.js request object
 * @returns IP address string or 'unknown' if not found
 */
export function getClientIp(request: NextRequest): string {
  // Check x-forwarded-for header (comma-separated list, first is client)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  // Check x-real-ip header
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Check Cloudflare connecting IP
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  // Fallback to Next.js built-in IP
  const ip = request.ip;
  if (ip) {
    return ip;
  }

  // Last resort
  return 'unknown';
}
