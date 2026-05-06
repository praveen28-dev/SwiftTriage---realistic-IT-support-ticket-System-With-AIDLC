/**
 * useTicketStats Hook
 * Fetch ticket statistics with SWR
 */

import useSWR from 'swr';

interface TicketStatsData {
  label: string;
  value: string;
  count: number;
  color: string;
  percentage: number;
}

interface TicketStatsResponse {
  data: TicketStatsData[];
  total: number;
  group_by: string;
  timestamp: string;
}

interface UseTicketStatsOptions {
  groupBy: 'status' | 'tech_group' | 'alert_level' | 'request_type' | 'alert_condition' | 'priority' | 'category';
  sort?: 'asc' | 'desc';
  limit?: number;
  dateRange?: 'all' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom';
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch ticket statistics');
  return res.json();
});

export function useTicketStats(options: UseTicketStatsOptions) {
  const {
    groupBy,
    sort = 'desc',
    limit = 20,
    dateRange = 'all',
    startDate,
    endDate,
    filters,
  } = options;

  // Build query string
  const params = new URLSearchParams({
    group_by: groupBy,
    sort,
    limit: limit.toString(),
    date_range: dateRange,
  });

  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (filters) params.append('filters', JSON.stringify(filters));

  const { data, error, isLoading, mutate } = useSWR<TicketStatsResponse>(
    `/api/v1/tickets/stats?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    data: data?.data || [],
    total: data?.total || 0,
    groupBy: data?.group_by || groupBy,
    timestamp: data?.timestamp,
    isLoading,
    error,
    mutate,
  };
}
