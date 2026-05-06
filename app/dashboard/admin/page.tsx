/**
 * Admin Page
 * System administration interface for ADMIN role users.
 * Includes User Management, System Health, and Audit Log panels.
 */

'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { useUsers } from '@/hooks/useUsers';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { User, HealthStatus, AuditLogEntry } from '@/types/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// ─── UserManagementPanel ──────────────────────────────────────────────────────

interface UserManagementPanelProps {
  users: User[];
  isLoading: boolean;
  onRoleToggle: (userId: string, newRole: 'ADMIN' | 'STAFF') => Promise<void>;
}

function UserManagementPanel({ users, isLoading, onRoleToggle }: Readonly<UserManagementPanelProps>) {
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleToggle = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'STAFF' : 'ADMIN';
    setLoadingId(user.id);
    setError(null);
    try {
      await onRoleToggle(user.id, newRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--gray-900)' }}>
        User Management
      </h2>

      {error && (
        <p className="text-sm mb-3" style={{ color: 'var(--error-600)' }}>
          {error}
        </p>
      )}

      {isLoading && <LoadingSpinner centered size="md" />}
      {!isLoading && users.length === 0 && <EmptyState title="No users found" />}
      {!isLoading && users.length > 0 && (
        <ul className="space-y-3" aria-label="IT staff users">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'var(--gray-100)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--gray-900)' }}>
                    {user.username}
                  </p>
                  <Badge variant={user.role === 'ADMIN' ? 'info' : 'gray'} size="sm">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <button
                className={`btn text-xs px-3 py-1.5 h-auto flex-shrink-0 ${
                  user.role === 'ADMIN' ? 'btn-danger' : 'btn-primary'
                }`}
                onClick={() => handleToggle(user)}
                disabled={loadingId === user.id}
                aria-label={
                  user.role === 'ADMIN'
                    ? `Demote ${user.username} to Staff`
                    : `Promote ${user.username} to Admin`
                }
              >
                {loadingId === user.id && (
                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loadingId !== user.id && user.role === 'ADMIN' && 'Demote to Staff'}
                {loadingId !== user.id && user.role !== 'ADMIN' && 'Promote to Admin'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── SystemHealthPanel ────────────────────────────────────────────────────────

interface SystemHealthPanelProps {
  groqStatus: HealthStatus | undefined;
  databaseStatus: HealthStatus | undefined;
  isLoading: boolean;
  onRefresh: () => void;
}

function healthBadgeVariant(
  status: HealthStatus['status']
): 'success' | 'error' | 'warning' {
  if (status === 'connected') return 'success';
  if (status === 'disconnected') return 'error';
  return 'warning';
}

function HealthServiceRow({ health }: Readonly<{ health: HealthStatus }>) {
  return (
    <div
      className="p-4 rounded-lg mb-3"
      style={{ backgroundColor: 'var(--gray-100)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold capitalize" style={{ color: 'var(--gray-800)' }}>
          {health.service === 'groq' ? 'Groq API' : 'Neon DB'}
        </span>
        <Badge variant={healthBadgeVariant(health.status)} size="sm">
          {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
        </Badge>
      </div>
      <p className="text-xs" style={{ color: 'var(--gray-500)' }}>
        Last check: {formatTimestamp(health.lastCheck)}
      </p>
      {health.responseTime !== undefined && (
        <p className="text-xs" style={{ color: 'var(--gray-500)' }}>
          Response time: {health.responseTime}ms
        </p>
      )}
      {health.error && (
        <p className="text-xs mt-1" style={{ color: 'var(--error-600)' }}>
          {health.error}
        </p>
      )}
    </div>
  );
}

function SystemHealthPanel({
  groqStatus,
  databaseStatus,
  isLoading,
  onRefresh,
}: Readonly<SystemHealthPanelProps>) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--gray-900)' }}>
          System Health
        </h2>
        <button
          className="btn btn-secondary text-xs px-3 py-1.5 h-auto"
          onClick={onRefresh}
          aria-label="Refresh health status"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner centered size="md" />
      ) : (
        <>
          {groqStatus && <HealthServiceRow health={groqStatus} />}
          {databaseStatus && <HealthServiceRow health={databaseStatus} />}
          {!groqStatus && !databaseStatus && (
            <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
              Health data unavailable.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── AuditLogPanel ────────────────────────────────────────────────────────────

function auditIconColor(actionType: string): string {
  const type = actionType.toLowerCase();
  if (type.includes('error') || type.includes('fail') || type.includes('delete')) {
    return 'var(--error-500)';
  }
  if (type.includes('warn') || type.includes('update') || type.includes('change')) {
    return 'var(--warning-500)';
  }
  if (type.includes('create') || type.includes('success') || type.includes('resolve')) {
    return 'var(--success-500)';
  }
  return 'var(--info-500)';
}

interface AuditLogPanelProps {
  entries: AuditLogEntry[];
  isLoading: boolean;
}

function AuditLogPanel({ entries, isLoading }: Readonly<AuditLogPanelProps>) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--gray-900)' }}>
          Audit Log
        </h2>
        {/* FUTURE: Navigate to full audit log page when implemented */}
        <button
          type="button"
          className="text-sm font-medium bg-transparent border-0 cursor-not-allowed opacity-60"
          style={{ color: 'var(--primary-600)' }}
          disabled
          title="Full audit log — coming soon"
          aria-label="View all audit log entries (coming soon)"
        >
          View All
        </button>
      </div>

      {isLoading && <LoadingSpinner centered size="md" />}
      {!isLoading && entries.length === 0 && <EmptyState title="No recent activity" />}
      {!isLoading && entries.length > 0 && (
        <ul className="space-y-3" aria-label="Recent audit log entries">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3">
              {/* Colored dot */}
              <span
                className="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: auditIconColor(entry.actionType) }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--gray-900)' }}>
                  {entry.description}
                </p>
                <p className="text-xs" style={{ color: 'var(--gray-500)' }}>
                  {entry.performedBy} · {relativeTime(entry.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const role = session?.user?.role;
      if (role === 'it_staff') {
        // Non-admin IT staff — redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  // Data fetching
  const { users, isLoading: usersLoading, mutate: mutateUsers } = useUsers();
  const {
    groqStatus,
    databaseStatus,
    isLoading: healthLoading,
    mutate: mutateHealth,
  } = useSystemHealth({ refreshInterval: 10000 });
  const { entries, isLoading: auditLoading } = useAuditLog({
    limit: 10,
    refreshInterval: 15000,
  });

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

  // Only render for ADMIN role
  if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') {
    return null;
  }

  const handleRoleToggle = async (userId: string, newRole: 'ADMIN' | 'STAFF') => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update user role');
    }
    mutateUsers();
  };

  return (
    <EnterpriseLayout>
      <div className="p-8">
        <h1 className="text-3xl font-black mb-6" style={{ color: 'var(--gray-900)' }}>
          System Administration
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 — User Management */}
          <Card padding="lg">
            <UserManagementPanel
              users={users}
              isLoading={usersLoading}
              onRoleToggle={handleRoleToggle}
            />
          </Card>

          {/* Column 2 — System Health */}
          <Card padding="lg">
            <SystemHealthPanel
              groqStatus={groqStatus}
              databaseStatus={databaseStatus}
              isLoading={healthLoading}
              onRefresh={() => mutateHealth()}
            />
          </Card>

          {/* Column 3 — Audit Log */}
          <Card padding="lg">
            <AuditLogPanel entries={entries} isLoading={auditLoading} />
          </Card>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
