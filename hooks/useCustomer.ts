/**
 * useCustomer Hook
 * Fetch single customer with related data
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

interface Ticket {
  id: string;
  customerId?: string;
  userInput: string;
  category: string;
  urgencyScore: number;
  aiSummary: string;
  status: string;
  assignedTo?: string;
  tags?: string;
  priority?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  customerId?: string;
  ticketId?: string;
  activityType: string;
  subject: string;
  description?: string;
  performedBy?: string;
  createdAt: string;
}

interface CustomerProduct {
  id: string;
  quantity: number;
  purchaseDate: string;
  product: {
    id: string;
    name: string;
    description?: string;
    sku?: string;
    category?: string;
    price?: string;
    isActive: boolean;
    createdAt: string;
  };
}

interface CustomerDetailResponse {
  customer: Customer;
  tickets: Ticket[];
  activities: Activity[];
  products: CustomerProduct[];
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    if (res.status === 404) throw new Error('Customer not found');
    throw new Error('Failed to fetch customer');
  }
  return res.json();
});

export function useCustomer(customerId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<CustomerDetailResponse>(
    customerId ? `/api/customers/${customerId}` : null,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    customer: data?.customer,
    tickets: data?.tickets || [],
    activities: data?.activities || [],
    products: data?.products || [],
    isLoading,
    error,
    mutate,
  };
}
