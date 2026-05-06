/**
 * useCustomers Hook
 * Fetch and manage customers list with SWR
 */

import useSWR from 'swr';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  logoUrl?: string;
  tier?: string;
  annualRevenue?: string;
  clientId?: string;
  territory?: string;
  primaryContact?: string;
  cdiRating?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomersResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseCustomersOptions {
  page?: number;
  limit?: number;
  search?: string;
  tier?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
});

export function useCustomers(options: UseCustomersOptions = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    tier,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  // Build query string
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  if (search) params.append('search', search);
  if (tier) params.append('tier', tier);
  if (isActive !== undefined) params.append('isActive', isActive.toString());

  const { data, error, isLoading, mutate } = useSWR<CustomersResponse>(
    `/api/customers?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    customers: data?.customers || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}
