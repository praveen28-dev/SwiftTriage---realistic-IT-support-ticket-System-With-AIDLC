/**
 * useUsers Hook
 * Fetches IT staff user list with SWR
 */

import useSWR from 'swr';
import { GetUsersResponse, User } from '@/types/api';

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUsers(): UseUsersReturn {
  const { data, error, mutate } = useSWR<GetUsersResponse>(
    '/api/users',
    fetcher,
    { revalidateOnFocus: true }
  );

  return {
    users: data?.users || [],
    isLoading: !error && !data,
    isError: !!error,
    mutate,
  };
}
