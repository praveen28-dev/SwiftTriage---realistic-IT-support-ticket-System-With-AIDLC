/**
 * Tickets by Alert Level Widget
 * Pie chart showing SLA alert status distribution
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { WidgetContainer } from './WidgetContainer';
import { AlertTriangle } from 'lucide-react';

interface AlertLevelData {
  label: string;
  value: string;
  count: number;
  color: string;
}

interface TicketsByAlertLevelWidgetProps {
  id: string;
  data: AlertLevelData[];
  onEdit?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
}

export function TicketsByAlertLevelWidget({
  id,
  data,
  onEdit,
  onRemove,
  onRefresh,
}: TicketsByAlertLevelWidgetProps) {
  const router = useRouter();

  const chartData = data.map(item => ({
    name: item.label,
    value: item.count,
    color: item.color,
    filterValue: item.value,
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const handleLegendClick = (filterValue: string) => {
    router.push(`/all-tickets?alert_level=${filterValue}`);
  };

  const handleExport = () => {
    const csv = [
      ['Alert Level', 'Count', 'Percentage'],
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
    a.download = 'tickets-by-alert-level.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WidgetContainer
      id={id}
      title="Tickets by Alert Level"
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
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">{item.count}</span>
                  {item.label !== 'No Alerts' && (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No alert level data available</div>
      )}
    </WidgetContainer>
  );
}
