/**
 * 403 Forbidden Page
 *
 * Displays a user-friendly access denied message when users attempt to access
 * resources they don't have permission for.
 *
 * Accessibility:
 * - WCAG 2.1 AA compliant
 * - Semantic HTML structure
 * - Clear, descriptive error message
 * - Actionable navigation options
 *
 * @module app/403/page
 */

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Access Denied - SwiftTriage',
  description: 'You do not have permission to access this resource',
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <ShieldAlert 
            className="h-24 w-24 text-red-500" 
            aria-hidden="true"
          />
        </div>

        {/* Error Code */}
        <div>
          <h1 className="text-6xl font-bold text-gray-900">
            403
          </h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Access Denied
          </h2>
        </div>

        {/* Error Message */}
        <div className="mt-4">
          <p className="text-lg text-gray-600">
            You don't have permission to access this resource.
          </p>
          <p className="mt-2 text-base text-gray-500">
            This page or feature requires specific permissions that your account doesn't have. 
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Go to Home
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a 
              href="mailto:support@swifttriage.com" 
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
