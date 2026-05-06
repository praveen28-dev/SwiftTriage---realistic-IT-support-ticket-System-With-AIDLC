'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { EmptyState } from '@/app/components/ui/EmptyState';

interface Group { id: string; name: string; description: string; members: string[]; ticketCount: number; }

const GROUPS: Group[] = [
  { id: '1', name: 'Network Team', description: 'Handles all network infrastructure and connectivity issues', members: ['it_admin', 'it_staff1'], ticketCount: 24 },
  { id: '2', name: 'Hardware Support', description: 'Manages physical device repairs, replacements, and procurement', members: ['it_staff2'], ticketCount: 18 },
  { id: '3', name: 'Software & Applications', description: 'Supports software installations, licenses, and application issues', members: ['it_admin', 'it_staff1', 'it_staff2'], ticketCount: 31 },
  { id: '4', name: 'Security Operations', description: 'Monitors security incidents, access control, and compliance', members: ['it_admin'], ticketCount: 9 },
];

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<Group | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'it_staff' && role !== 'ADMIN') router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') return <EnterpriseLayout><div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div></EnterpriseLayout>;
  if (status !== 'authenticated') return null;

  return (
    <EnterpriseLayout>
      <div className="p-8" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>Groups</h1>
          <p style={{ color: 'var(--gray-600)' }}>IT team groups and their assigned ticket queues</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Group List */}
          <div className="space-y-4">
            {GROUPS.map(group => (
              <button key={group.id} onClick={() => setSelected(group)} className="w-full text-left" aria-pressed={selected?.id === group.id}>
                <Card padding="md" className={`hover:shadow-md transition-shadow ${selected?.id === group.id ? 'ring-2 ring-blue-500' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--gray-900)' }}>{group.name}</h3>
                    <Badge variant="info" size="sm">{group.ticketCount}</Badge>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</p>
                </Card>
              </button>
            ))}
          </div>

          {/* Group Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <Card padding="lg">
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--gray-900)' }}>{selected.name}</h2>
                <p className="mb-6" style={{ color: 'var(--gray-600)' }}>{selected.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--primary-50)' }}>
                    <p className="text-3xl font-black" style={{ color: 'var(--primary-700)' }}>{selected.members.length}</p>
                    <p className="text-sm" style={{ color: 'var(--primary-600)' }}>Members</p>
                  </div>
                  <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--info-50)' }}>
                    <p className="text-3xl font-black" style={{ color: 'var(--info-700)' }}>{selected.ticketCount}</p>
                    <p className="text-sm" style={{ color: 'var(--info-600)' }}>Open Tickets</p>
                  </div>
                </div>

                <h3 className="text-base font-bold mb-3" style={{ color: 'var(--gray-900)' }}>Members</h3>
                <ul className="space-y-2">
                  {selected.members.map(m => (
                    <li key={m} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--gray-50)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                        {m.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--gray-900)' }}>{m}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : (
              <EmptyState title="Select a group" description="Click a group on the left to view its details and members." />
            )}
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
