/**
 * Ticket Distribution Chart Component
 * Pie chart showing Open vs Closed tickets
 */

'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TicketDistributionChartProps {
  openTickets: number;
  closedTickets: number;
}

const COLORS = {
  open: '#3b82f6', // blue-500
  closed: '#10b981', // green-500
};

export function TicketDistributionChart({ openTickets, closedTickets }: TicketDistributionChartProps) {
  const data = [
    { name: 'Open Tickets', value: openTickets, color: COLORS.open },
    { name: 'Closed Tickets', value: closedTickets, color: COLORS.closed },
  ];

  const total = openTickets + closedTickets;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Distribution</h3>
      
      {total > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{openTickets}</div>
              <div className="text-sm text-gray-600">Open</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{closedTickets}</div>
              <div className="text-sm text-gray-600">Closed</div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No ticket data available
        </div>
      )}
    </div>
  );
}
