/**
 * Customer Satisfaction Widget
 * Display average CDI rating with trend
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WidgetContainer } from './WidgetContainer';
import { TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';

interface CustomerSatisfactionWidgetProps {
  id: string;
  averageRating: number;
  totalCustomers: number;
  trend?: number; // Percentage change from previous period
  onEdit?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
}

export function CustomerSatisfactionWidget({
  id,
  averageRating,
  totalCustomers,
  trend = 0,
  onEdit,
  onRemove,
  onRefresh,
}: CustomerSatisfactionWidgetProps) {
  const router = useRouter();

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-green-600';
    if (rating >= 60) return 'text-blue-600';
    if (rating >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 80) return 'Excellent';
    if (rating >= 60) return 'Good';
    if (rating >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleExport = () => {
    const csv = [
      ['Metric', 'Value'],
      ['Average CDI Rating', averageRating],
      ['Total Customers', totalCustomers],
      ['Trend', `${trend > 0 ? '+' : ''}${trend}%`],
      ['Rating Label', getRatingLabel(averageRating)],
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer-satisfaction.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WidgetContainer
      id={id}
      title="Customer Satisfaction (CDI)"
      onEdit={onEdit}
      onRemove={onRemove}
      onRefresh={onRefresh}
      onExport={handleExport}
    >
      <div className="text-center py-8">
        {/* Rating Display */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Star className={`w-12 h-12 ${getRatingColor(averageRating)}`} fill="currentColor" />
          <div className={`text-6xl font-bold ${getRatingColor(averageRating)}`}>
            {averageRating}
          </div>
        </div>

        {/* Rating Label */}
        <div className="text-lg font-medium text-gray-900 mb-2">
          {getRatingLabel(averageRating)}
        </div>

        {/* Trend */}
        {trend !== 0 && (
          <div className="flex items-center justify-center space-x-2 mb-4">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trend > 0 ? '+' : ''}{trend}% from last period
            </span>
          </div>
        )}

        {/* Customer Count */}
        <div className="text-sm text-gray-600">
          Based on {totalCustomers} customer{totalCustomers !== 1 ? 's' : ''}
        </div>

        {/* Rating Scale */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
          <div className="relative h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full">
            <div
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-900 rounded-full shadow-lg"
              style={{ left: `${averageRating}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => router.push('/customers')}
          className="mt-6 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All Customers →
        </button>
      </div>
    </WidgetContainer>
  );
}
