/**
 * Tickets by Request Type Widget
 * Horizontal bar chart showing ticket distribution by request type
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { WidgetContainer } from './WidgetContainer';

interface RequestTypeData {
  label: string;
  value: string;
  count: number;
  color?: string;
}

interface TicketsByRequestTypeWidgetProps {
  id: string;
  data: RequestTypeData[];
  onEdit?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
}

const COLORS = [
  '#007bff',
  '#fd7e14',
  '#10b981',
  '#dc3545',
  '#17a2b8',
  '#ffc107',
  '#28a745',
  '#6f42c1',
  '#e83e8c',
  '#20c997',
];

export function TicketsByRequestTypeWidget({
  id,
  data,
  onEdit,
  onRemove,
  onRefresh,
}: TicketsByRequestTypeWidgetProps) {
  const router = useRouter();

  // Sort by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  const chartData = sortedData.map((item, index) => ({
    name: item.label,
    count: item.count,
    color: item.color || COLORS[index % COLORS.length],
    filterValue: item.value,
  }));

  const handleBarClick = (filterValue: string) => {
    router.push(`/all-tickets?request_type=${filterValue}`);
  };

  const handleExport = () => {
    const csv = [
      ['Request Type', 'Count'],
      ...sortedData.map(item => [item.label, item.count]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets-by-request-type.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WidgetContainer
      id={id}
      title="Tickets by Request Type"
      onEdit={onEdit}
      onRemove={onRemove}
      onRefresh={onRefresh}
      onExport={handleExport}
      className="lg:col-span-2"
    >
      {sortedData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={90} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleBarClick(entry.filterValue)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Clickable Counts */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            {sortedData.slice(0, 6).map((item) => (
              <button
                key={item.value}
                onClick={() => handleBarClick(item.value)}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
              >
                <span className="text-sm text-gray-700 truncate">{item.label}</span>
                <span className="text-sm font-bold text-blue-600 ml-2">{item.count}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No request type data available</div>
      )}
    </WidgetContainer>
  );
}
