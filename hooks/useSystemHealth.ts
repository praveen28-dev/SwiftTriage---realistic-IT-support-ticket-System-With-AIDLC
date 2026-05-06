/**
 * useSystemHealth Hook
 * Fetches Groq API and database health status with SWR polling
 */

import useSWR from 'swr';
import { GetHealthResponse, HealthStatus } from '@/types/api';

interface UseSystemHealthOptions {
  refreshInterval?: number;
}

interface UseSystemHealthReturn {
  groqStatus: HealthStatus | undefined;
  databaseStatus: HealthStatus | undefined;
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSystemHealth(
  options: UseSystemHealthOptions = {}
): UseSystemHealthReturn {
  const { refreshInterval = 10000 } = options;

  const { data, error, mutate } = useSWR<GetHealthResponse>(
    '/api/health',
    fetcher,
    { refreshInterval, revalidateOnFocus: true }
  );

  return {
    groqStatus: data?.groq,
    databaseStatus: data?.database,
    isLoading: !error && !data,
    isError: !!error,
    mutate,
  };
}
