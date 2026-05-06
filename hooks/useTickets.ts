/**
 * useTickets Hook
 * Fetch tickets with SWR and optional polling
 */

import useSWR from 'swr';
import { Ticket } from '@/lib/db/schema';
import { TicketFilters } from '@/lib/validation/schemas';

interface UseTicketsOptions {
  /** Filter tickets by the username they are assigned to */
  assignedTo?: string;
  filters?: TicketFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  refreshInterval?: number;
}

interface UseTicketsReturn {
  tickets: Ticket[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => Promise<void>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTickets(options: UseTicketsOptions = {}): UseTicketsReturn {
  const {
    assignedTo,
    filters = {},
    sortBy = 'urgencyScore',
    sortOrder = 'desc',
    refreshInterval = 5000,
  } = options;

  // Build query string
  const params = new URLSearchParams();
  if (assignedTo) params.append('assignedTo', assignedTo);
  if (filters.category) params.append('category', filters.category);
  if (filters.urgency) params.append('urgency', filters.urgency.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  params.append('sortBy', sortBy);
  params.append('sortOrder', sortOrder);

  const url = `/api/tickets?${params.toString()}`;

  const { data, error, mutate } = useSWR(url, fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
  });

  return {
    tickets: data?.tickets || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: !!error,
    error,
    mutate: async () => {
      await mutate();
    },
  };
}
