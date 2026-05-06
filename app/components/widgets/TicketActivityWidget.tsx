/**
 * Ticket Activity Widget
 * Real-time activity feed showing recent ticket changes
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, User, Clock } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';

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

interface TicketActivityWidgetProps {
  id: string;
  activities: ActivityItem[];
  onEdit?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
}

export function TicketActivityWidget({
  id,
  activities,
  onEdit,
  onRemove,
  onRefresh,
}: TicketActivityWidgetProps) {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (activityId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const handleExport = () => {
    const csv = [
      ['Ticket', 'User', 'Action', 'Time'],
      ...activities.map(item => [
        item.ticket_number,
        item.user_name,
        item.action_detail,
        item.relative_time,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ticket-activity.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WidgetContainer
      id={id}
      title="Ticket Activity"
      onEdit={onEdit}
      onRemove={onRemove}
      onRefresh={onRefresh}
      onExport={handleExport}
      className="lg:col-span-2"
    >
      {activities.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => {
            const isExpanded = expandedIds.has(activity.id);

            return (
              <div
                key={activity.id}
                className="border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-start p-3">
                  {/* Ticket Badge */}
                  <button
                    onClick={() => router.push(`/tickets/${activity.ticket_id}`)}
                    className="flex-shrink-0 bg-teal-600 text-white px-3 py-1 rounded text-sm font-mono font-bold hover:bg-teal-700 transition-colors"
                  >
                    {activity.ticket_number}
                  </button>

                  {/* Activity Content */}
                  <div className="flex-1 ml-3 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <button
                        onClick={() => router.push(`/users/${activity.user_id}`)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {activity.user_name}
                      </button>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.relative_time}
                      </span>
                    </div>

                    {activity.comment_snippet && (
                      <p className="text-sm text-gray-700 mb-1">
                        "{activity.comment_snippet}"
                      </p>
                    )}

                    <p className="text-sm text-gray-600">{activity.action_detail}</p>

                    {isExpanded && activity.expanded_content && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        {activity.expanded_content}
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  {activity.is_expandable && (
                    <button
                      onClick={() => toggleExpand(activity.id)}
                      className="flex-shrink-0 ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No recent activity</p>
        </div>
      )}
    </WidgetContainer>
  );
}
