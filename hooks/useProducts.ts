/**
 * useProducts Hook
 * Fetch and manage products list with SWR
 */

import useSWR from 'swr';

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  price?: string;
  isActive: boolean;
  createdAt: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
});

export function useProducts(options: UseProductsOptions = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    category,
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
  if (category) params.append('category', category);
  if (isActive !== undefined) params.append('isActive', isActive.toString());

  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    `/api/products?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    products: data?.products || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}
