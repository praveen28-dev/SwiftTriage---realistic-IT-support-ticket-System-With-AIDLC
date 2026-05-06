/**
 * TicketSubmissionForm Component
 * Enhanced form for end users to submit IT issues
 */

'use client';

import React, { useState } from 'react';
import { useTicketSubmission } from '@/hooks/useTicketSubmission';
import { ticketSubmissionSchema } from '@/lib/validation/schemas';
import { Button } from '@/app/components/ui/Button';
import { formatTicketId } from '@/lib/utils/format';

export function TicketSubmissionForm() {
  const [userInput, setUserInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);
  const { submitTicket, isSubmitting, error } = useTicketSubmission();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Client-side validation
    try {
      ticketSubmissionSchema.parse({ userInput });
    } catch (err: any) {
      setValidationError(err.errors[0]?.message || 'Invalid input');
      return;
    }

    // Submit ticket
    try {
      const response = await submitTicket(userInput);
      setSuccessTicketId(response.ticketId);
      setUserInput('');
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleSubmitAnother = () => {
    setSuccessTicketId(null);
    setUserInput('');
  };

  // Success State
  if (successTicketId) {
    return (
      <div className="text-center py-8" data-testid="ticket-success">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 animate-bounce" 
          style={{ backgroundColor: 'var(--success-100)' }}>
          <svg className="h-8 w-8" style={{ color: 'var(--success-600)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--gray-900)' }}>
          Ticket Submitted Successfully!
        </h2>
        <p className="mb-6" style={{ color: 'var(--gray-600)' }}>
          Your IT issue has been received and automatically triaged by our AI system.
        </p>

        {/* Ticket ID Display */}
        <div className="rounded-xl p-6 mb-8" style={{ 
          background: 'linear-gradient(to right, var(--primary-100), var(--primary-200))'
        }}>
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Your Ticket ID</p>
          <div className="text-4xl font-mono font-bold gradient-text" data-testid="ticket-id">
            {formatTicketId(successTicketId)}
          </div>
          <p className="text-sm mt-3" style={{ color: 'var(--gray-600)' }}>
            Save this ID to track your ticket status
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleSubmitAnother} variant="primary" size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Submit Another Ticket
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="secondary" size="lg">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Form State
  const charCount = userInput.length;
  const maxChars = 5000;
  const minChars = 10;
  const isValid = charCount >= minChars && charCount <= maxChars;

  return (
    <form onSubmit={handleSubmit} data-testid="ticket-submission-form" className="space-y-6">
      {/* Form Header */}
      <div>
        <label htmlFor="userInput" className="block text-lg font-semibold mb-2" style={{ color: 'var(--gray-900)' }}>
          Describe Your IT Issue
        </label>
        <p className="text-sm mb-4" style={{ color: 'var(--gray-600)' }}>
          Be as detailed as possible. Include what happened, when it started, and any error messages you saw.
        </p>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          id="userInput"
          value={userInput}
          onChange={handleInputChange}
          rows={8}
          className="input w-full resize-none"
          style={{ minHeight: '200px' }}
          placeholder="Example: My computer won't start. When I press the power button, nothing happens. The power light doesn't turn on either..."
          data-testid="ticket-input"
        />
        
        {/* Character Count */}
        <div className={`absolute bottom-3 right-3 text-sm font-medium`}
          style={{ 
            color: charCount > maxChars ? 'var(--error-600)' : 
                   charCount >= minChars ? 'var(--success-600)' : 
                   'var(--gray-400)'
          }}>
          {charCount} / {maxChars}
        </div>
      </div>

      {/* Helpful Tips */}
      <div className="rounded-xl p-4" style={{ 
        backgroundColor: 'var(--primary-100)', 
        borderColor: 'var(--primary-200)',
        borderWidth: '1px'
      }}>
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm" style={{ color: 'var(--primary-900)' }}>
            <p className="font-semibold mb-1">💡 Tips for better support:</p>
            <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--primary-800)' }}>
              <li>Include specific error messages or codes</li>
              <li>Mention when the problem started</li>
              <li>Describe what you were doing when it happened</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="p-4 rounded-xl flex items-start space-x-3" 
          style={{ 
            backgroundColor: 'var(--error-100)', 
            borderColor: 'var(--error-200)',
            borderWidth: '1px'
          }} 
          data-testid="validation-error">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--error-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--error-700)' }}>{validationError}</p>
        </div>
      )}

      {/* Submission Error */}
      {error && (
        <div className="p-4 rounded-xl flex items-start space-x-3" 
          style={{ 
            backgroundColor: 'var(--error-100)', 
            borderColor: 'var(--error-200)',
            borderWidth: '1px'
          }} 
          data-testid="submission-error">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--error-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm" style={{ color: 'var(--error-700)' }}>
            <p className="font-semibold">Submission failed</p>
            <p>{error.message}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting}
        disabled={isSubmitting || !isValid}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting Ticket...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Submit Ticket
          </>
        )}
      </Button>

      {/* Privacy Note */}
      <p className="text-xs text-center" style={{ color: 'var(--gray-500)' }}>
        By submitting, you agree that your issue will be reviewed by IT staff. We respect your privacy and will only use this information to resolve your issue.
      </p>
    </form>
  );
}
