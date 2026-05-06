'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { Badge } from '@/app/components/ui/Badge';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { useTickets } from '@/hooks/useTickets';

type SortCol = 'urgencyScore' | 'createdAt' | 'status' | 'category';
type SortDir = 'asc' | 'desc';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'info', IN_PROGRESS: 'warning', RESOLVED: 'success',
  CLOSED: 'gray', PENDING: 'warning', ASSIGNED: 'info',
};

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="opacity-30 ml-1">↕</span>;
  return <span className="ml-1">{dir === 'asc' ? '↑' : '↓'}</span>;
}

export default function AllTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<SortCol>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (status === 'authenticated' && (session?.user as any)?.role === 'end_user') router.push('/');
  }, [status, session, router]);

  const { tickets, isLoading, isError, mutate } = useTickets({ refreshInterval: 10000 });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...tickets]
      .filter(t =>
        (!statusFilter || t.status === statusFilter) &&
        (!q || t.id.toLowerCase().includes(q) || (t.aiSummary ?? '').toLowerCase().includes(q) ||
          (t.category ?? '').toLowerCase().includes(q) || (t.assignedTo ?? '').toLowerCase().includes(q))
      )
      .sort((a, b) => {
        const av = sortCol === 'createdAt' ? new Date(a[sortCol]).getTime() : (a[sortCol] ?? '');
        const bv = sortCol === 'createdAt' ? new Date(b[sortCol]).getTime() : (b[sortCol] ?? '');
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [tickets, search, statusFilter, sortCol, sortDir]);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  if (status === 'loading') return <EnterpriseLayout><div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div></EnterpriseLayout>;
  if (status !== 'authenticated') return null;

  const statuses = ['OPEN', 'IN_PROGRESS', 'PENDING', 'ASSIGNED', 'RESOLVED', 'CLOSED'];

  return (
    <EnterpriseLayout>
      <div className="p-8" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>All Tickets</h1>
          <p style={{ color: 'var(--gray-600)' }}>View and manage all support tickets across the system</p>
        </div>

        <Card padding="lg">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by ID, summary, category, or assignee…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                fullWidth
                leftIcon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              />
            </div>
            <select
              className="input px-3 py-2 text-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <button className="btn btn-secondary text-sm" onClick={() => { setSearch(''); setStatusFilter(''); }}>
              Clear
            </button>
          </div>

          <p className="text-sm mb-4" style={{ color: 'var(--gray-500)' }}>
            Showing {filtered.length} of {tickets.length} tickets
          </p>

          {isError && (
            <div className="text-center py-8">
              <p style={{ color: 'var(--error-600)' }} className="mb-3">Failed to load tickets.</p>
              <button className="btn btn-primary" onClick={() => mutate()}>Retry</button>
            </div>
          )}

          {isLoading && !isError && <div className="py-12"><LoadingSpinner centered size="lg" /></div>}

          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="All tickets">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                    {(['ID', 'Summary', 'Category', 'Assigned To'] as const).map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--gray-700)' }}>{h}</th>
                    ))}
                    {(['urgencyScore', 'createdAt', 'status'] as SortCol[]).map(col => (
                      <th key={col} className="text-left py-3 px-4 font-semibold cursor-pointer select-none" style={{ color: 'var(--gray-700)' }} onClick={() => handleSort(col)}>
                        {col === 'urgencyScore' ? 'Urgency' : col === 'createdAt' ? 'Created' : 'Status'}
                        <SortArrow active={sortCol === col} dir={sortDir} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-4">
                      <EmptyState title="No tickets found" description="Try adjusting your search or filters." action={search || statusFilter ? { label: 'Clear Filters', onClick: () => { setSearch(''); setStatusFilter(''); } } : undefined} />
                    </td></tr>
                  ) : filtered.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--gray-200)' }} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--gray-600)' }}>{t.id.slice(0, 8)}</td>
                      <td className="py-3 px-4 max-w-xs" style={{ color: 'var(--gray-900)' }}>{(t.aiSummary ?? '').slice(0, 80)}{(t.aiSummary ?? '').length > 80 ? '…' : ''}</td>
                      <td className="py-3 px-4"><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-700)' }}>{t.category}</span></td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--gray-600)' }}>{t.assignedTo ?? <span className="italic opacity-50">Unassigned</span>}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: t.urgencyScore >= 8 ? 'var(--error-100)' : t.urgencyScore >= 5 ? 'var(--warning-100)' : 'var(--success-100)', color: t.urgencyScore >= 8 ? 'var(--error-700)' : t.urgencyScore >= 5 ? 'var(--warning-700)' : 'var(--success-700)' }}>
                          {t.urgencyScore}/10
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--gray-600)' }}>{fmt(t.createdAt)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={(STATUS_COLORS[t.status] as any) ?? 'gray'} size="sm">{t.status.replace('_', ' ')}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
