/**
 * Statistics Cards Component
 * Overview cards for key metrics
 */

'use client';

import React from 'react';
import {
  Ticket,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  AlertTriangle,
} from 'lucide-react';

interface StatisticsCardsProps {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  inProgressTickets: number;
  avgResolutionTime?: number; // in hours
  totalCustomers?: number;
  criticalTickets?: number;
}

interface StatCard {
  name: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  textColor: string;
  bgColor: string;
  suffix?: string;
}

export function StatisticsCards({
  totalTickets,
  openTickets,
  closedTickets,
  inProgressTickets,
  avgResolutionTime,
  totalCustomers,
  criticalTickets,
}: StatisticsCardsProps) {
  const stats: StatCard[] = [
    {
      name: 'Total Tickets',
      value: totalTickets,
      icon: Ticket,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Open Tickets',
      value: openTickets,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'In Progress',
      value: inProgressTickets,
      icon: Clock,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Resolved',
      value: closedTickets,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  // Add optional stats if provided
  if (criticalTickets !== undefined) {
    stats.push({
      name: 'Critical',
      value: criticalTickets,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    });
  }

  if (totalCustomers !== undefined) {
    stats.push({
      name: 'Customers',
      value: totalCustomers,
      icon: Users,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    });
  }

  if (avgResolutionTime !== undefined) {
    stats.push({
      name: 'Avg Resolution',
      value: Number.parseFloat(avgResolutionTime.toFixed(1)),
      icon: TrendingUp,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      suffix: 'h',
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.name}
                </p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  {stat.suffix && <span className="text-xl ml-1">{stat.suffix}</span>}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
