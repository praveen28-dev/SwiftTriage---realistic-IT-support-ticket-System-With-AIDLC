'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { Badge } from '@/app/components/ui/Badge';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { useTickets } from '@/hooks/useTickets';
import { useCustomers } from '@/hooks/useCustomers';

type ResultType = 'ticket' | 'customer';
interface Result { id: string; type: ResultType; title: string; subtitle: string; meta?: string; }

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | ResultType>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { tickets, isLoading: ticketsLoading } = useTickets();
  const { customers, isLoading: customersLoading } = useCustomers();

  const isLoading = ticketsLoading || customersLoading;

  const results: Result[] = query.trim().length < 2 ? [] : [
    ...(filter === 'all' || filter === 'ticket'
      ? tickets
          .filter(t =>
            t.id.toLowerCase().includes(query.toLowerCase()) ||
            (t.aiSummary ?? '').toLowerCase().includes(query.toLowerCase()) ||
            (t.category ?? '').toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 10)
          .map(t => ({ id: t.id, type: 'ticket' as ResultType, title: (t.aiSummary ?? t.userInput ?? '').slice(0, 80), subtitle: `${t.category} · ${t.status}`, meta: t.id.slice(0, 8) }))
      : []),
    ...(filter === 'all' || filter === 'customer'
      ? (customers ?? [])
          .filter((c: any) =>
            (c.name ?? '').toLowerCase().includes(query.toLowerCase()) ||
            (c.email ?? '').toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 10)
          .map((c: any) => ({ id: c.id, type: 'customer' as ResultType, title: c.name ?? c.email, subtitle: c.email ?? '', meta: 'Customer' }))
      : []),
  ];

  if (status === 'loading') return <EnterpriseLayout><div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div></EnterpriseLayout>;
  if (status !== 'authenticated') return null;

  return (
    <EnterpriseLayout>
      <div className="p-8" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>Search</h1>
          <p style={{ color: 'var(--gray-600)' }}>Search across tickets, customers, and more</p>
        </div>

        <Card padding="lg">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <Input
                ref={inputRef}
                placeholder="Type at least 2 characters to search…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                fullWidth
                leftIcon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'ticket', 'customer'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? 'text-white' : 'hover:bg-gray-100'}`} style={filter === f ? { backgroundColor: 'var(--primary-600)' } : { backgroundColor: 'var(--gray-200)', color: 'var(--gray-700)' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {isLoading && <div className="py-8"><LoadingSpinner centered size="md" /></div>}

          {!isLoading && query.trim().length < 2 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <p style={{ color: 'var(--gray-500)' }}>Start typing to search…</p>
            </div>
          )}

          {!isLoading && query.trim().length >= 2 && results.length === 0 && (
            <EmptyState title="No results found" description={`No matches for "${query}". Try a different search term.`} />
          )}

          {!isLoading && results.length > 0 && (
            <ul className="divide-y" style={{ borderColor: 'var(--gray-200)' }}>
              {results.map(r => (
                <li key={`${r.type}-${r.id}`} className="flex items-center gap-4 py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--gray-900)' }}>{r.title}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--gray-500)' }}>{r.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {r.meta && <span className="text-xs font-mono" style={{ color: 'var(--gray-400)' }}>{r.meta}</span>}
                    <Badge variant={r.type === 'ticket' ? 'info' : 'success'} size="sm">{r.type}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
