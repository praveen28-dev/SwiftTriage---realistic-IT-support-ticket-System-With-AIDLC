'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card } from '@/app/components/ui/Card';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { useTicketStats } from '@/hooks/useTicketStats';

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const statusStats = useTicketStats({ groupBy: 'status' });
  const categoryStats = useTicketStats({ groupBy: 'request_type' });
  const techStats = useTicketStats({ groupBy: 'tech_group' });

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
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const StatBar = ({ label, count, max, color }: { label: string; count: number; max: number; color: string }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color: 'var(--gray-700)' }}>{label}</span>
        <span className="font-semibold" style={{ color: 'var(--gray-900)' }}>{count}</span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--gray-200)' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${max > 0 ? (count / max) * 100 : 0}%`, backgroundColor: color }} />
      </div>
    </div>
  );

  return (
    <EnterpriseLayout>
      <div className="p-8" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>Reports</h1>
          <p style={{ color: 'var(--gray-600)' }}>Ticket metrics and performance summaries</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Tickets', value: total, color: 'var(--primary-600)', bg: 'var(--primary-50)' },
            { label: 'Resolved', value: resolved, color: 'var(--success-600)', bg: 'var(--success-50)' },
            { label: 'Resolution Rate', value: `${resolutionRate}%`, color: 'var(--info-600)', bg: 'var(--info-50)' },
            { label: 'Categories', value: (categoryStats.data ?? []).length, color: 'var(--warning-600)', bg: 'var(--warning-50)' },
          ].map(kpi => (
            <Card key={kpi.label} padding="lg">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: kpi.bg }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: kpi.color }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <p className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>{kpi.value}</p>
              <p className="text-sm" style={{ color: 'var(--gray-600)' }}>{kpi.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* By Status */}
          <Card padding="lg">
            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--gray-900)' }}>Tickets by Status</h2>
            {statusStats.isLoading ? <LoadingSpinner centered size="sm" /> : (statusStats.data ?? []).map((item: any) => (
              <StatBar key={item.status} label={item.status} count={item.count} max={total} color="var(--primary-500)" />
            ))}
          </Card>

          {/* By Category */}
          <Card padding="lg">
            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--gray-900)' }}>Tickets by Category</h2>
            {categoryStats.isLoading ? <LoadingSpinner centered size="sm" /> : (() => {
              const maxCat = Math.max(...(categoryStats.data ?? []).map((i: any) => i.count), 1);
              return (categoryStats.data ?? []).map((item: any) => (
                <StatBar key={item.request_type ?? item.category ?? item.label} label={item.request_type ?? item.category ?? item.label ?? 'Unknown'} count={item.count} max={maxCat} color="var(--info-500)" />
              ));
            })()}
          </Card>

          {/* By Tech Group */}
          <Card padding="lg">
            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--gray-900)' }}>Tickets by Tech Group</h2>
            {techStats.isLoading ? <LoadingSpinner centered size="sm" /> : (() => {
              const maxTech = Math.max(...(techStats.data ?? []).map((i: any) => i.count), 1);
              return (techStats.data ?? []).map((item: any) => (
                <StatBar key={item.tech_group ?? item.label} label={item.tech_group ?? item.label ?? 'Unknown'} count={item.count} max={maxTech} color="var(--success-500)" />
              ));
            })()}
          </Card>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
