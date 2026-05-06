/**
 * StatsPanel Component
 * Display basic statistics and analytics
 */

'use client';

import React from 'react';
import { useStats } from '@/hooks/useStats';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

export function StatsPanel() {
  const { stats, isLoading, isError } = useStats();

  if (isLoading) {
    return <LoadingSpinner centered />;
  }

  if (isError || !stats) {
    return (
      <div className="text-center py-4 text-red-600">
        Failed to load statistics
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-testid="stats-panel">
      {/* Total Tickets */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Tickets</h3>
        <p className="text-3xl font-bold text-gray-900">{stats.totalTickets}</p>
      </div>

      {/* Average Urgency */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Average Urgency</h3>
        <p className="text-3xl font-bold text-gray-900">{stats.averageUrgency.toFixed(1)}</p>
      </div>

      {/* Category Distribution */}
      <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Tickets by Category</h3>
        <div className="space-y-2">
          {stats.categoryDistribution.map((item) => (
            <div key={item.category} className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{item.category}</span>
              <span className="text-sm font-semibold text-gray-900">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency Distribution */}
      <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2 lg:col-span-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Urgency Distribution</h3>
        <div className="flex space-x-4">
          {stats.urgencyDistribution.map((item) => (
            <div key={item.urgency} className="flex-1 text-center">
              <div className="text-2xl font-bold text-gray-900">{item.count}</div>
              <div className="text-xs text-gray-500">Level {item.urgency}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
