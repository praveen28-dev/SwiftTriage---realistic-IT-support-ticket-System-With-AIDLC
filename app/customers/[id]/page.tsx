/**
 * Customer Detail Page
 * View and manage individual customer with tabbed interface
 */

'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { useCustomer } from '@/hooks/useCustomer';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Star,
  Ticket,
  Activity,
  Package,
  Calendar,
  FileText,
  Users,
  Shield,
  CheckSquare,
} from 'lucide-react';

const TABS = [
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'sla', label: 'SLA', icon: Shield },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
];

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');

  const { customer, tickets, activities, products, isLoading, error } = useCustomer(params.id);

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

  if (error) {
    return (
      <EnterpriseLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            Error loading customer: {error.message}
          </div>
        </div>
      </EnterpriseLayout>
    );
  }

  if (!customer) {
    return (
      <EnterpriseLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Customer not found</h3>
          </div>
        </div>
      </EnterpriseLayout>
    );
  }

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
        {/* Customer Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {customer.logoUrl ? (
                <img
                  src={customer.logoUrl}
                  alt={customer.company || customer.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-blue-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {customer.company || customer.name}
                </h1>
                <p className="text-gray-600">{customer.name}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {customer.tier || 'Standard'}
                  </span>
                  {customer.clientId && (
                    <span className="text-sm text-gray-600">ID: {customer.clientId}</span>
                  )}
                </div>
              </div>
            </div>

            {/* CDI Rating */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Star className={`w-6 h-6 ${getCDIColor(customer.cdiRating)}`} />
                <span className={`text-3xl font-bold ${getCDIColor(customer.cdiRating)}`}>
                  {customer.cdiRating || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600">CDI Rating</p>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            {customer.email && (
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                </div>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.territory && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600">Territory</p>
                  <p className="text-sm font-medium text-gray-900">{customer.territory}</p>
                </div>
              </div>
            )}
            {customer.annualRevenue && (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600">Annual Revenue</p>
                  <p className="text-sm font-medium text-gray-900">
                    ${parseFloat(customer.annualRevenue).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company</label>
                    <p className="text-gray-900">{customer.company || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Primary Contact</label>
                    <p className="text-gray-900">{customer.primaryContact || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Client ID</label>
                    <p className="text-gray-900">{customer.clientId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-gray-900">{customer.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Tickets ({tickets.length})
                </h3>
                {tickets.length > 0 ? (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{ticket.userInput}</p>
                            <div className="flex items-center space-x-3 mt-2 text-sm text-gray-600">
                              <span className="capitalize">{ticket.category}</span>
                              <span>•</span>
                              <span className="capitalize">{ticket.status}</span>
                              <span>•</span>
                              <span>Score: {ticket.urgencyScore}</span>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {ticket.priority || 'Medium'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No tickets found</p>
                )}
              </div>
            )}

            {activeTab === 'activities' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activities ({activities.length})
                </h3>
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{activity.subject}</p>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                              <span className="capitalize">{activity.activityType}</span>
                              <span>•</span>
                              <span>{activity.performedBy}</span>
                              <span>•</span>
                              <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No activities found</p>
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Products ({products.length})
                </h3>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.product.description}</p>
                        <div className="flex items-center justify-between mt-3 text-sm">
                          <span className="text-gray-600">Quantity: {item.quantity}</span>
                          {item.product.price && (
                            <span className="font-medium text-gray-900">
                              ${parseFloat(item.product.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No products found</p>
                )}
              </div>
            )}

            {['contacts', 'calendar', 'sla', 'tasks'].includes(activeTab) && (
              <div className="text-center py-12 text-gray-500">
                <p>This section is coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
