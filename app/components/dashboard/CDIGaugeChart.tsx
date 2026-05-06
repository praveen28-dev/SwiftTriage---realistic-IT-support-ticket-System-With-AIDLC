/**
 * CDI Gauge Chart Component
 * Customer Satisfaction Index gauge with color coding
 */

'use client';

import React from 'react';

interface CDIGaugeChartProps {
  rating: number; // 0-100
  customerName?: string;
}

export function CDIGaugeChart({ rating, customerName }: CDIGaugeChartProps) {
  // Clamp rating between 0 and 100
  const clampedRating = Math.max(0, Math.min(100, rating));
  
  // Calculate rotation angle (0-180 degrees for half circle)
  const angle = (clampedRating / 100) * 180;
  
  // Determine color based on rating
  const getColor = (rating: number) => {
    if (rating >= 80) return { bg: 'bg-green-500', text: 'text-green-600', label: 'Excellent' };
    if (rating >= 60) return { bg: 'bg-blue-500', text: 'text-blue-600', label: 'Good' };
    if (rating >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Fair' };
    if (rating >= 20) return { bg: 'bg-orange-500', text: 'text-orange-600', label: 'Poor' };
    return { bg: 'bg-red-500', text: 'text-red-600', label: 'Critical' };
  };

  const colorInfo = getColor(clampedRating);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Customer Satisfaction Index (CDI)
      </h3>
      
      {customerName && (
        <p className="text-sm text-gray-600 mb-4">{customerName}</p>
      )}

      <div className="relative w-full max-w-xs mx-auto">
        {/* Gauge Background */}
        <div className="relative w-64 h-32 mx-auto">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 10 90 A 80 80 0 0 1 190 90"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="20"
              strokeLinecap="round"
            />
            
            {/* Colored segments */}
            <path
              d="M 10 90 A 80 80 0 0 1 46 30"
              fill="none"
              stroke="#ef4444"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 46 30 A 80 80 0 0 1 82 10"
              fill="none"
              stroke="#f97316"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 82 10 A 80 80 0 0 1 118 10"
              fill="none"
              stroke="#eab308"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 118 10 A 80 80 0 0 1 154 30"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 154 30 A 80 80 0 0 1 190 90"
              fill="none"
              stroke="#10b981"
              strokeWidth="20"
              strokeLinecap="round"
            />
            
            {/* Needle */}
            <g transform={`rotate(${angle - 90} 100 90)`}>
              <line
                x1="100"
                y1="90"
                x2="100"
                y2="20"
                stroke="#1f2937"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="90" r="6" fill="#1f2937" />
            </g>
          </svg>
        </div>

        {/* Rating Display */}
        <div className="text-center mt-4">
          <div className={`text-4xl font-bold ${colorInfo.text}`}>
            {clampedRating}
          </div>
          <div className="text-sm text-gray-600 mt-1">out of 100</div>
          <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${colorInfo.bg} text-white`}>
            {colorInfo.label}
          </div>
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}
