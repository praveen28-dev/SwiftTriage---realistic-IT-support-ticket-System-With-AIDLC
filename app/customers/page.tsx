/**
 * Customers List Page
 * Browse and search all customers
 */

'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { useCustomers } from '@/hooks/useCustomers';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { Search, Plus, Building2, Star, TrendingUp } from 'lucide-react';

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { customers, pagination, isLoading, error } = useCustomers({
    page,
    limit: 20,
    search: searchQuery,
    tier: tierFilter || undefined,
    isActive: true,
  });

  // Redirect if not authenticated or not IT staff
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'it_staff') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading' || isLoading) {
    return (
      <EnterpriseLayout>
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" />
        </div>
      </EnterpriseLayout>
    );
  }

  if (!session || (session.user as any)?.role !== 'it_staff') {
    return null;
  }

  const getTierBadgeColor = (tier?: string) => {
    switch (tier) {
      case 'Enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Premium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Standard':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCDIColor = (rating?: number) => {
    if (!rating) return 'text-gray-400';
    if (rating >= 80) return 'text-green-600';
    if (rating >= 60) return 'text-blue-600';
    if (rating >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <EnterpriseLayout>
      <div className="p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">
              Manage customer accounts and relationships
            </p>
          </div>
          <Link
            href="/customers/new"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Customer</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or company..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tiers</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Customers Grid */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            Error loading customers: {error.message}
          </div>
        ) : customers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-blue-300"
                >
                  {/* Customer Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {customer.logoUrl ? (
                        <img
                          src={customer.logoUrl}
                          alt={customer.company || customer.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {customer.company || customer.name}
                        </h3>
                        <p className="text-sm text-gray-600">{customer.name}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getTierBadgeColor(
                        customer.tier
                      )}`}
                    >
                      {customer.tier || 'Standard'}
                    </span>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Email:</span>
                      <span className="truncate">{customer.email}</span>
                    </div>
                    {customer.territory && (
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium mr-2">Territory:</span>
                        <span>{customer.territory}</span>
                      </div>
                    )}
                  </div>

                  {/* CDI Rating */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">CDI Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className={`w-4 h-4 ${getCDIColor(customer.cdiRating)}`} />
                        <span className={`font-bold ${getCDIColor(customer.cdiRating)}`}>
                          {customer.cdiRating || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || tierFilter
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first customer'}
            </p>
            <Link
              href="/customers/new"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Customer</span>
            </Link>
          </div>
        )}
      </div>
    </EnterpriseLayout>
  );
}
