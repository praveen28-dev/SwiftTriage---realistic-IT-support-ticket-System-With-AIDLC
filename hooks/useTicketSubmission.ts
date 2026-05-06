/**
 * useTicketSubmission Hook
 * Handle ticket submission with loading and error states
 */

import { useState } from 'react';
import { TicketResponse } from '@/lib/types/api';

interface UseTicketSubmissionReturn {
  submitTicket: (userInput: string) => Promise<TicketResponse>;
  isSubmitting: boolean;
  error: Error | null;
  reset: () => void;
}

export function useTicketSubmission(): UseTicketSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitTicket = async (userInput: string): Promise<TicketResponse> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit ticket');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setError(null);
    setIsSubmitting(false);
  };

  return {
    submitTicket,
    isSubmitting,
    error,
    reset,
  };
}
