/**
 * useStats Hook
 * Fetch ticket statistics with SWR and optional polling
 */

import useSWR from 'swr';
import { TicketStatistics } from '@/lib/types/api';

interface UseStatsOptions {
  refreshInterval?: number;
}

interface UseStatsReturn {
  stats: TicketStatistics | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => Promise<void>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useStats(options: UseStatsOptions = {}): UseStatsReturn {
  const { refreshInterval = 5000 } = options;

  const { data, error, mutate } = useSWR('/api/stats', fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
  });

  return {
    stats: data,
    isLoading: !error && !data,
    isError: !!error,
    error,
    mutate: async () => {
      await mutate();
    },
  };
}
