/**
 * TicketList Component
 * Display filtered and sorted list of tickets
 */

'use client';

import React, { useState } from 'react';
import { useTickets } from '@/hooks/useTickets';
import { TicketFilters } from '@/lib/validation/schemas';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { formatRelativeTime, formatTicketId, truncateText } from '@/lib/utils/format';

interface TicketListProps {
  filters: TicketFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function TicketList({ filters, sortBy, sortOrder, onSortChange }: TicketListProps) {
  const { tickets, isLoading, isError } = useTickets({ filters, sortBy, sortOrder });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      onSortChange(column, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(column, 'desc');
    }
  };

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 4) return 'bg-red-100 text-red-800';
    if (urgency === 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Hardware: 'bg-blue-100 text-blue-800',
      Network: 'bg-purple-100 text-purple-800',
      Access: 'bg-orange-100 text-orange-800',
      Software: 'bg-green-100 text-green-800',
      Uncategorized: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <LoadingSpinner centered />;
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load tickets. Please try again.
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid="empty-state">
        No tickets found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid="ticket-list">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ticket ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Issue
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('category')}
            >
              Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('urgencyScore')}
            >
              Urgency {sortBy === 'urgencyScore' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              AI Summary
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('createdAt')}
            >
              Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
              data-testid={`ticket-row-${ticket.id}`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                {formatTicketId(ticket.id)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {expandedId === ticket.id ? ticket.userInput : truncateText(ticket.userInput, 100)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(ticket.category)}`}>
                  {ticket.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(ticket.urgencyScore)}`}>
                  {ticket.urgencyScore}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {truncateText(ticket.aiSummary, 80)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatRelativeTime(new Date(ticket.createdAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
