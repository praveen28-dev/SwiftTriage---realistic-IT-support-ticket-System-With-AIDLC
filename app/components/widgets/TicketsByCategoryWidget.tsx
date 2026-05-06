/**
 * Tickets by Category Widget
 * Donut chart showing ticket distribution by category
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { WidgetContainer } from './WidgetContainer';

interface CategoryData {
  label: string;
  value: string;
  count: number;
  color: string;
}

interface TicketsByCategoryWidgetProps {
  id: string;
  data: CategoryData[];
  onEdit?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
}

export function TicketsByCategoryWidget({
  id,
  data,
  onEdit,
  onRemove,
  onRefresh,
}: TicketsByCategoryWidgetProps) {
  const router = useRouter();

  const chartData = data.map(item => ({
    name: item.label,
    value: item.count,
    color: item.color,
    filterValue: item.value,
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const handleClick = (filterValue: string) => {
    router.push(`/all-tickets?category=${filterValue}`);
  };

  const handleExport = () => {
    const csv = [
      ['Category', 'Count', 'Percentage'],
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
    a.download = 'tickets-by-category.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WidgetContainer
      id={id}
      title="Tickets by Category"
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
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleClick(entry.filterValue)}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Total */}
          <div className="text-center -mt-32 mb-24 pointer-events-none">
            <div className="text-3xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-600">Total Tickets</div>
          </div>

          {/* Category List */}
          <div className="grid grid-cols-2 gap-2">
            {data.map((item) => (
              <button
                key={item.value}
                onClick={() => handleClick(item.value)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded transition-colors text-left"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 truncate flex-1">
                  {item.label}
                </span>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No category data available</div>
      )}
    </WidgetContainer>
  );
}
