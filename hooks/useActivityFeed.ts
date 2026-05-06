/**
 * useActivityFeed Hook
 * Fetch activity feed with SWR and polling
 */

import useSWR from 'swr';

interface ActivityItem {
  id: string;
  ticket_id: string;
  ticket_number: string;
  action_type: string;
  action_detail: string;
  comment_snippet?: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  timestamp: string;
  relative_time: string;
  is_expandable: boolean;
  expanded_content?: string;
}

interface ActivityFeedResponse {
  activities: ActivityItem[];
  total: number;
  has_more: boolean;
  next_offset: number;
}

interface UseActivityFeedOptions {
  limit?: number;
  offset?: number;
  ticketId?: string;
  userId?: string;
  actionTypes?: string[];
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch activity feed');
  return res.json();
});

export function useActivityFeed(options: UseActivityFeedOptions = {}) {
  const {
    limit = 5,
    offset = 0,
    ticketId,
    userId,
    actionTypes,
  } = options;

  // Build query string
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (ticketId) params.append('ticket_id', ticketId);
  if (userId) params.append('user_id', userId);
  if (actionTypes && actionTypes.length > 0) {
    params.append('action_types', actionTypes.join(','));
  }

  const { data, error, isLoading, mutate } = useSWR<ActivityFeedResponse>(
    `/api/v1/activity-feed?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 10000, // Poll every 10 seconds for real-time updates
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    activities: data?.activities || [],
    total: data?.total || 0,
    hasMore: data?.has_more || false,
    nextOffset: data?.next_offset || 0,
    isLoading,
    error,
    mutate,
  };
}
