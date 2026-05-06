/**
 * Recent Tickets Widget Component
 * Displays a list of recent tickets with clickable IDs
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface TicketItem {
  id: string;
  userInput: string;
  category: string;
  status: string;
  priority: string;
  urgencyScore: number;
  createdAt: string;
}

interface RecentTicketsWidgetProps {
  tickets: TicketItem[];
  maxItems?: number;
}

export function RecentTicketsWidget({ tickets, maxItems = 10 }: RecentTicketsWidgetProps) {
  const displayTickets = tickets.slice(0, maxItems);

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'RESOLVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CLOSED':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'PENDING':
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Tickets</h3>
        <Link
          href="/all-tickets"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>

      {displayTickets.length > 0 ? (
        <div className="space-y-3">
          {displayTickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getStatusIcon(ticket.status)}
                    <span className="text-sm font-mono text-blue-600 group-hover:text-blue-700">
                      #{ticket.id.slice(0, 8)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 truncate mb-1" title={ticket.userInput}>
                    {ticket.userInput}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="capitalize">{ticket.category}</span>
                    <span>•</span>
                    <span>Score: {ticket.urgencyScore}</span>
                    <span>•</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No recent tickets</p>
        </div>
      )}
    </div>
  );
}
