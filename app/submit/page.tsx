/**
 * Ticket Submission Page
 * Enhanced page for end users to submit IT issues
 */

import Link from 'next/link';
import { TicketSubmissionForm } from '@/app/components/tickets/TicketSubmissionForm';

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xl font-bold text-gray-900">SwiftTriage</span>
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              📝 New Ticket
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Submit IT Issue
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Describe your IT problem below. Our AI will automatically categorize and prioritize your ticket for faster resolution.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
            <TicketSubmissionForm />
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact IT support at{' '}
              <a href="mailto:support@swifttriage.com" className="text-blue-600 hover:underline">
                support@swifttriage.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
