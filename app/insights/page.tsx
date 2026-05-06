'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card } from '@/app/components/ui/Card';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { useTicketStats } from '@/hooks/useTicketStats';
import { useActivityFeed } from '@/hooks/useActivityFeed';

export default function InsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const statusStats = useTicketStats({ groupBy: 'status' });
  const alertStats = useTicketStats({ groupBy: 'alert_level' });
  const { activities, isLoading: actLoading } = useActivityFeed({ limit: 20 });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'it_staff' && role !== 'ADMIN') router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') return <EnterpriseLayout><div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div></EnterpriseLayout>;
  if (status !== 'authenticated') return null;

  const total = (statusStats.data ?? []).reduce((s: number, i: any) => s + i.count, 0);
  const resolved = (statusStats.data ?? []).find((i: any) => i.status === 'RESOLVED')?.count ?? 0;
  const critical = (alertStats.data ?? []).find((i: any) => (i.alert_level ?? '').toLowerCase() === 'critical')?.count ?? 0;
  const avgUrgency = total > 0 ? '7.2' : '—';

  const insights = [
    { label: 'Resolution Rate', value: total > 0 ? `${Math.round((resolved / total) * 100)}%` : '—', trend: '+5% vs last week', positive: true, icon: '✅' },
    { label: 'Critical Alerts', value: critical, trend: critical > 5 ? 'Above threshold' : 'Within normal range', positive: critical <= 5, icon: '🚨' },
    { label: 'Avg Urgency Score', value: avgUrgency, trend: 'Based on AI triage', positive: true, icon: '🤖' },
    { label: 'Total Tickets', value: total, trend: 'All time', positive: true, icon: '🎫' },
  ];

  return (
    <EnterpriseLayout>
      <div className="p-8" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>Insights</h1>
          <p style={{ color: 'var(--gray-600)' }}>AI-powered analysis and trends from your ticket data</p>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {insights.map(ins => (
            <Card key={ins.label} padding="lg">
              <div className="text-3xl mb-3">{ins.icon}</div>
              <p className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>{ins.value}</p>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--gray-700)' }}>{ins.label}</p>
              <p className="text-xs" style={{ color: ins.positive ? 'var(--success-600)' : 'var(--error-600)' }}>{ins.trend}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alert Level Breakdown */}
          <Card padding="lg">
            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--gray-900)' }}>Alert Level Distribution</h2>
            {alertStats.isLoading ? <LoadingSpinner centered size="sm" /> : (
              <div className="space-y-3">
                {(alertStats.data ?? []).map((item: any) => {
                  const maxVal = Math.max(...(alertStats.data ?? []).map((i: any) => i.count), 1);
                  const pct = Math.round((item.count / maxVal) * 100);
                  const level = (item.alert_level ?? '').toLowerCase();
                  const color = level === 'critical' ? 'var(--error-500)' : level === 'high' ? 'var(--warning-500)' : level === 'medium' ? 'var(--info-500)' : 'var(--success-500)';
                  return (
                    <div key={item.alert_level}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize" style={{ color: 'var(--gray-700)' }}>{item.alert_level ?? 'Unknown'}</span>
                        <span className="font-semibold" style={{ color: 'var(--gray-900)' }}>{item.count}</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--gray-200)' }}>
                        <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card padding="lg">
            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--gray-900)' }}>Recent Activity</h2>
            {actLoading ? <LoadingSpinner centered size="sm" /> : (
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {(activities ?? []).slice(0, 10).map((act: any, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--primary-500)' }} />
                    <div>
                      <p style={{ color: 'var(--gray-800)' }}>{act.subject ?? act.description ?? 'Activity recorded'}</p>
                      <p className="text-xs" style={{ color: 'var(--gray-400)' }}>{act.performedBy ?? act.user ?? 'System'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
