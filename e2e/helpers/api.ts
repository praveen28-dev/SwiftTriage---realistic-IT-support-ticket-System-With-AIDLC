/**
 * API helpers for Playwright tests.
 * Used to set up and tear down test data without going through the UI.
 */

import { APIRequestContext } from '@playwright/test';

/**
 * Submit a ticket via the API and return the created ticket.
 * Requires an authenticated request context.
 */
export async function createTicketViaApi(
  request: APIRequestContext,
  userInput: string
): Promise<{
  ticketId: string;
  category: string;
  urgencyScore: number;
  aiSummary: string;
  status: string;
}> {
  const response = await request.post('/api/tickets', {
    data: { userInput },
  });

  if (!response.ok()) {
    throw new Error(
      `Failed to create ticket: ${response.status()} ${await response.text()}`
    );
  }

  return response.json();
}

/**
 * Fetch all tickets via the API (requires it_staff or ADMIN session).
 */
export async function getTicketsViaApi(
  request: APIRequestContext
): Promise<{ tickets: any[]; total: number }> {
  const response = await request.get('/api/tickets');

  if (!response.ok()) {
    throw new Error(
      `Failed to fetch tickets: ${response.status()} ${await response.text()}`
    );
  }

  return response.json();
}
