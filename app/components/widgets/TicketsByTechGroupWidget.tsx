/**
 * Tickets by Tech Group Widget
 * Pie chart showing workload distribution across tech teams
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { WidgetContainer } from './WidgetContainer';

interface TechGroupData {
  label: string;
  value: string;
  count: number;
  color: string;
}

interface TicketsByTechGroupWidgetProps {
  id: string;
  data: TechGroupData[];
  onEdit?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
}

export function TicketsByTechGroupWidget({
  id,
  data,
  onEdit,
  onRemove,
  onRefresh,
}: TicketsByTechGroupWidgetProps) {
  const router = useRouter();

  const chartData = data.map(item => ({
    name: item.label,
    value: item.count,
    color: item.color,
    filterValue: item.value,
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const handleLegendClick = (filterValue: string) => {
    router.push(`/all-tickets?tech_group=${filterValue}`);
  };

  const handleExport = () => {
    const csv = [
      ['Tech Group', 'Count', 'Percentage'],
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
    a.download = 'tickets-by-tech-group.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WidgetContainer
      id={id}
      title="Tickets by Tech Group"
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
          <div className="mt-4 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {data.map((item) => (
              <button
                key={item.value}
                onClick={() => handleLegendClick(item.value)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded transition-colors text-left"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 truncate">
                  <span className="font-medium">[{item.count}]</span> {item.label}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No tech group data available</div>
      )}
    </WidgetContainer>
  );
}
