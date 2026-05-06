/**
 * Tickets by Status Widget
 * Pie chart showing ticket distribution by status
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { WidgetContainer } from './WidgetContainer';

interface StatusData {
  label: string;
  value: string;
  count: number;
  color: string;
}

interface TicketsByStatusWidgetProps {
  id: string;
  data: StatusData[];
  onEdit?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  open: '#007bff',
  closed: '#fd7e14',
  resolved: '#10b981',
  approved: '#dc3545',
  pending: '#17a2b8',
  cancelled: '#ffc107',
  assigned: '#28a745',
  denied: '#f8d7da',
  in_progress: '#6f42c1',
};

export function TicketsByStatusWidget({
  id,
  data,
  onEdit,
  onRemove,
  onRefresh,
}: TicketsByStatusWidgetProps) {
  const router = useRouter();

  const chartData = data.map(item => ({
    name: item.label,
    value: item.count,
    color: item.color || STATUS_COLORS[item.value.toLowerCase()] || '#6c757d',
    filterValue: item.value,
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const handleLegendClick = (filterValue: string) => {
    router.push(`/all-tickets?status=${filterValue}`);
  };

  const handleExport = () => {
    const csv = [
      ['Status', 'Count', 'Percentage'],
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
    a.download = 'tickets-by-status.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WidgetContainer
      id={id}
      title="Tickets by Status"
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
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* Clickable Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.map((item) => (
              <button
                key={item.value}
                onClick={() => handleLegendClick(item.value)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded transition-colors text-left"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      item.color || STATUS_COLORS[item.value.toLowerCase()] || '#6c757d',
                  }}
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">[{item.count}]</span> {item.label}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No ticket data available</div>
      )}
    </WidgetContainer>
  );
}
