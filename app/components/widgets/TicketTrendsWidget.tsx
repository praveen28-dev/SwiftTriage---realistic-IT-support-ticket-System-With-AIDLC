/**
 * Ticket Trends Widget
 * Line chart showing ticket volume over time
 */

'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { WidgetContainer } from './WidgetContainer';

interface TrendData {
  date: string;
  open: number;
  closed: number;
  total: number;
}

interface TicketTrendsWidgetProps {
  id: string;
  data: TrendData[];
  onEdit?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
}

export function TicketTrendsWidget({
  id,
  data,
  onEdit,
  onRemove,
  onRefresh,
}: TicketTrendsWidgetProps) {
  const handleExport = () => {
    const csv = [
      ['Date', 'Open', 'Closed', 'Total'],
      ...data.map(item => [item.date, item.open, item.closed, item.total]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ticket-trends.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate summary stats
  const totalOpen = data.reduce((sum, item) => sum + item.open, 0);
  const totalClosed = data.reduce((sum, item) => sum + item.closed, 0);
  const avgDaily = data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.total, 0) / data.length) : 0;

  return (
    <WidgetContainer
      id={id}
      title="Ticket Trends"
      onEdit={onEdit}
      onRemove={onRemove}
      onRefresh={onRefresh}
      onExport={handleExport}
      className="lg:col-span-2"
    >
      {data.length > 0 ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalOpen}</div>
              <div className="text-sm text-gray-600">Total Open</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalClosed}</div>
              <div className="text-sm text-gray-600">Total Closed</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{avgDaily}</div>
              <div className="text-sm text-gray-600">Avg Daily</div>
            </div>
          </div>

          {/* Line Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="open"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Open Tickets"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="closed"
                stroke="#10b981"
                strokeWidth={2}
                name="Closed Tickets"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#6f42c1"
                strokeWidth={2}
                name="Total Tickets"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No trend data available</div>
      )}
    </WidgetContainer>
  );
}
