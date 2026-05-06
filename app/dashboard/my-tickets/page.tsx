/**
 * My Tickets Page
 * Displays tickets assigned to the logged-in IT staff member.
 * Supports real-time updates, search, sort, and quick actions.
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card, CardHeader } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { Badge, StatusBadge, UrgencyBadge } from '@/app/components/ui/Badge';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { EmptyState, ErrorEmptyState } from '@/app/components/ui/EmptyState';
import { useTickets } from '@/hooks/useTickets';
import { Ticket } from '@/lib/db/schema';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortColumn = 'urgencyScore' | 'createdAt' | 'status' | 'category';
type SortDirection = 'asc' | 'desc';

const TICKET_STATUSES = [
  'PENDING',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'ASSIGNED',
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

// ─── QuickActionButtons ───────────────────────────────────────────────────────

interface QuickActionButtonsProps {
  ticket: Ticket;
  onMutate: () => void;
}

function QuickActionButtons({ ticket, onMutate }: QuickActionButtonsProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }
      setStatusOpen(false);
      onMutate();
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommentLoading(true);
    setCommentError(null);
    try {
      // POST to comments endpoint (stub — route may not exist yet)
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to add comment');
      }
      setComment('');
      setCommentOpen(false);
      onMutate();
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Change Status */}
      <div className="relative">
        <button
          className="btn btn-primary text-xs px-3 py-1.5 h-auto"
          onClick={() => setStatusOpen((o) => !o)}
          disabled={statusLoading}
          aria-expanded={statusOpen}
          aria-haspopup="listbox"
        >
          {statusLoading ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Updating…
            </span>
          ) : (
            'Change Status'
          )}
        </button>

        {statusOpen && (
          <div
            className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px]"
            role="listbox"
            aria-label="Select new status"
          >
            {TICKET_STATUSES.map((s) => (
              <button
                key={s}
                role="option"
                aria-selected={ticket.status === s}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  ticket.status === s ? 'font-semibold text-blue-600' : 'text-gray-700'
                }`}
                onClick={() => handleStatusChange(s)}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}

        {statusError && (
          <p className="text-xs mt-1" style={{ color: 'var(--error-600)' }}>
            {statusError}
          </p>
        )}
      </div>

      {/* Add Comment */}
      <div className="relative">
        <button
          className="btn btn-secondary text-xs px-3 py-1.5 h-auto"
          onClick={() => setCommentOpen((o) => !o)}
          disabled={commentLoading}
        >
          {commentLoading ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </span>
          ) : (
            'Add Comment'
          )}
        </button>

        {commentOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64">
            <form onSubmit={handleAddComment}>
              <textarea
                className="input text-sm resize-none w-full mb-2"
                rows={3}
                placeholder="Enter your comment…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                aria-label="Comment text"
              />
              {commentError && (
                <p className="text-xs mb-2" style={{ color: 'var(--error-600)' }}>
                  {commentError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary text-xs px-3 py-1.5 h-auto flex-1"
                  disabled={commentLoading || !comment.trim()}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary text-xs px-3 py-1.5 h-auto"
                  onClick={() => {
                    setCommentOpen(false);
                    setComment('');
                    setCommentError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SortIcon ─────────────────────────────────────────────────────────────────

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) {
    return (
      <svg className="w-4 h-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return direction === 'asc' ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('urgencyScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const role = session?.user?.role;
      if (role !== 'it_staff' && role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  // Data fetching — poll every 5 seconds
  const { tickets, isLoading, isError, mutate } = useTickets({
    assignedTo: session?.user?.name ?? undefined,
    refreshInterval: 5000,
  });

  // Client-side filter + sort
  const filteredAndSortedTickets = useMemo(() => {
    const q = searchQuery.toLowerCase();

    const filtered = q
      ? tickets.filter(
          (t) =>
            t.id.toLowerCase().includes(q) ||
            (t.aiSummary ?? '').toLowerCase().includes(q) ||
            (t.category ?? '').toLowerCase().includes(q) ||
            (t.status ?? '').toLowerCase().includes(q)
        )
      : tickets;

    return [...filtered].sort((a, b) => {
      let aVal: string | number | Date | null = a[sortColumn] ?? '';
      let bVal: string | number | Date | null = b[sortColumn] ?? '';

      if (sortColumn === 'createdAt') {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tickets, searchQuery, sortColumn, sortDirection]);

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <EnterpriseLayout>
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner centered size="lg" />
        </div>
      </EnterpriseLayout>
    );
  }

  // Don't render content for unauthorized users (redirect in progress)
  if (
    status === 'unauthenticated' ||
    (status === 'authenticated' &&
      session?.user?.role !== 'it_staff' &&
      session?.user?.role !== 'ADMIN')
  ) {
    return null;
  }

  const columns: { key: SortColumn; label: string }[] = [
    { key: 'urgencyScore', label: 'Urgency' },
    { key: 'createdAt', label: 'Created' },
    { key: 'status', label: 'Status' },
    { key: 'category', label: 'Category' },
  ];

  return (
    <EnterpriseLayout>
      <div className="p-8">
        <Card padding="lg">
          <CardHeader
            title="My Tickets"
            subtitle={`${filteredAndSortedTickets.length} ticket${filteredAndSortedTickets.length !== 1 ? 's' : ''} assigned to you`}
          />

          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search by ID, summary, category, or status…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              aria-label="Search tickets"
            />
          </div>

          {/* Error state */}
          {isError && (
            <ErrorEmptyState onRetry={() => mutate()} />
          )}

          {/* Loading state */}
          {isLoading && !isError && (
            <div className="py-12">
              <LoadingSpinner centered size="lg" />
            </div>
          )}

          {/* Data table */}
          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="My assigned tickets">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--gray-700)' }}>
                      ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--gray-700)' }}>
                      Summary
                    </th>
                    {columns.map(({ key, label }) => (
                      <th
                        key={key}
                        className="text-left py-3 px-4 font-semibold cursor-pointer select-none"
                        style={{ color: 'var(--gray-700)' }}
                        onClick={() => handleSort(key)}
                        aria-sort={
                          sortColumn === key
                            ? sortDirection === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : 'none'
                        }
                      >
                        <span className="flex items-center gap-1">
                          {label}
                          <SortIcon active={sortColumn === key} direction={sortDirection} />
                        </span>
                      </th>
                    ))}
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--gray-700)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4">
                        <EmptyState
                          title="No tickets found matching your search"
                          description="Try adjusting your search terms or clear the search to see all tickets."
                          action={
                            searchQuery
                              ? { label: 'Clear Search', onClick: () => setSearchQuery('') }
                              : undefined
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        style={{ borderBottom: '1px solid var(--gray-200)' }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--gray-600)' }}>
                          {truncate(ticket.id, 8)}
                        </td>
                        <td className="py-3 px-4 max-w-xs" style={{ color: 'var(--gray-900)' }}>
                          {truncate(ticket.aiSummary, 80)}
                        </td>
                        <td className="py-3 px-4">
                          <UrgencyBadge urgency={ticket.urgencyScore} />
                        </td>
                        <td className="py-3 px-4">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="gray" size="sm">
                            {ticket.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <QuickActionButtons ticket={ticket} onMutate={mutate} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
