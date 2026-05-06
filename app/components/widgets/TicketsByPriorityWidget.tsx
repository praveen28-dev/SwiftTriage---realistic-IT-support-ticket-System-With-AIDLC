/**
 * Tickets by Priority Widget
 * Pie chart showing ticket distribution by priority level
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { WidgetContainer } from './WidgetContainer';
import { AlertCircle } from 'lucide-react';

interface PriorityData {
  label: string;
  value: string;
  count: number;
  color: string;
}

interface TicketsByPriorityWidgetProps {
  id: string;
  data: PriorityData[];
  onEdit?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#dc3545',
  high: '#fd7e14',
  medium: '#ffc107',
  low: '#10b981',
};

export function TicketsByPriorityWidget({
  id,
  data,
  onEdit,
  onRemove,
  onRefresh,
}: TicketsByPriorityWidgetProps) {
  const router = useRouter();

  const chartData = data.map(item => ({
    name: item.label,
    value: item.count,
    color: item.color || PRIORITY_COLORS[item.value.toLowerCase()] || '#6c757d',
    filterValue: item.value,
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const handleLegendClick = (filterValue: string) => {
    router.push(`/all-tickets?priority=${filterValue}`);
  };

  const handleExport = () => {
    const csv = [
      ['Priority', 'Count', 'Percentage'],
      ...data.map(item => [
        item.label,
        item.count,
        `${((item.count / total) * 100).toFixed(1)}%`,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets-by-priority.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPriorityIcon = (priority: string) => {
    const level = priority.toLowerCase();
    if (level === 'critical' || level === 'high') {
      return <AlertCircle className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <WidgetContainer
      id={id}
      title="Tickets by Priority"
      onEdit={onEdit}
      onRemove={onRemove}
      onRefresh={onRefresh}
      onExport={handleExport}
    >
      {total > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* Clickable Legend with Icons */}
          <div className="mt-4 space-y-2">
            {data.map((item) => (
              <button
                key={item.value}
                onClick={() => handleLegendClick(item.value)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        item.color || PRIORITY_COLORS[item.value.toLowerCase()] || '#6c757d',
                    }}
                  />
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  {getPriorityIcon(item.value)}
                </div>
                <span className="text-lg font-bold text-gray-900">{item.count}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No priority data available</div>
      )}
    </WidgetContainer>
  );
}
