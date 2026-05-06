/**
 * Tickets by Alert Condition Widget
 * Simple bar chart for SLA breach monitoring
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { WidgetContainer } from './WidgetContainer';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AlertConditionData {
  label: string;
  value: string;
  count: number;
  color: string;
}

interface TicketsByAlertConditionWidgetProps {
  id: string;
  data: AlertConditionData[];
  onEdit?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
}

export function TicketsByAlertConditionWidget({
  id,
  data,
  onEdit,
  onRemove,
  onRefresh,
}: TicketsByAlertConditionWidgetProps) {
  const router = useRouter();

  const chartData = data.map(item => ({
    name: item.label,
    count: item.count,
    color: item.color,
    filterValue: item.value,
  }));

  const handleBarClick = (filterValue: string) => {
    router.push(`/all-tickets?alert_condition=${filterValue}`);
  };

  const handleExport = () => {
    const csv = [
      ['Alert Condition', 'Count'],
      ...data.map(item => [item.label, item.count]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets-by-alert-condition.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WidgetContainer
      id={id}
      title="Tickets by Alert Condition"
      onEdit={onEdit}
      onRemove={onRemove}
      onRefresh={onRefresh}
      onExport={handleExport}
    >
      {data.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="category" dataKey="name" />
              <YAxis type="number" />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
          <div className="mt-4 space-y-2">
            {data.map((item) => (
              <button
                key={item.value}
                onClick={() => handleBarClick(item.value)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <div className="flex items-center space-x-2">
                  {item.label === 'No Alerts' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No alert condition data available</div>
      )}
    </WidgetContainer>
  );
}
