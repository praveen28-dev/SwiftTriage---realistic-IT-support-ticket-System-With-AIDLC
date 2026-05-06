/**
 * Error Handling Utilities
 * Centralized error handling functions
 */

import { NextResponse } from 'next/server';

/**
 * Create standardized API error response
 * @param message - Error message
 * @param status - HTTP status code
 * @returns NextResponse with error
 */
export function createErrorResponse(
  message: string,
  status: number
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Log error with context
 * @param error - Error object
 * @param context - Additional context
 */
export function logError(error: Error, context: Record<string, unknown>): void {
  console.error('[ERROR]', {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check if error is a Groq API error
 * @param error - Error object
 * @returns True if Groq API error
 */
export function isGroqError(error: Error): boolean {
  return error.message.includes('Groq') || error.name === 'GroqError';
}
