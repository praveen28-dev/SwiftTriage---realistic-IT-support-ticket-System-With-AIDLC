/**
 * useAuditLog Hook
 * Fetches recent audit log entries with SWR polling
 */

import useSWR from 'swr';
import { GetAuditLogResponse, AuditLogEntry } from '@/types/api';

interface UseAuditLogOptions {
  limit?: number;
  refreshInterval?: number;
}

interface UseAuditLogReturn {
  entries: AuditLogEntry[];
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAuditLog(
  options: UseAuditLogOptions = {}
): UseAuditLogReturn {
  const { limit = 10, refreshInterval = 15000 } = options;

  const { data, error, mutate } = useSWR<GetAuditLogResponse>(
    `/api/audit-log?limit=${limit}`,
    fetcher,
    { refreshInterval, revalidateOnFocus: true }
  );

  return {
    entries: data?.entries || [],
    isLoading: !error && !data,
    isError: !!error,
    mutate,
  };
}
