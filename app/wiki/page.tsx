'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { EmptyState } from '@/app/components/ui/EmptyState';

interface WikiPage { id: string; title: string; section: string; content: string; lastEditor: string; updatedAt: string; }

const WIKI_PAGES: WikiPage[] = [
  { id: '1', title: 'Onboarding Checklist', section: 'HR & Onboarding', content: '1. Create AD account\n2. Assign laptop\n3. Configure email\n4. Grant system access\n5. Schedule orientation', lastEditor: 'it_admin', updatedAt: '2025-04-30' },
  { id: '2', title: 'Network Architecture Overview', section: 'Infrastructure', content: 'Our network uses a three-tier architecture: core, distribution, and access layers. VLAN segmentation is used for security isolation.', lastEditor: 'it_staff1', updatedAt: '2025-04-25' },
  { id: '3', title: 'Incident Response Playbook', section: 'Security', content: 'Step 1: Identify and contain\nStep 2: Notify stakeholders\nStep 3: Investigate root cause\nStep 4: Remediate\nStep 5: Post-incident review', lastEditor: 'it_admin', updatedAt: '2025-04-20' },
  { id: '4', title: 'Software Procurement Process', section: 'Procurement', content: 'All software requests must be submitted via the IT portal. Approval required from department head and IT security before purchase.', lastEditor: 'it_staff2', updatedAt: '2025-04-15' },
  { id: '5', title: 'Backup & Recovery Procedures', section: 'Infrastructure', content: 'Daily incremental backups at 02:00 UTC. Weekly full backups on Sunday. Recovery time objective (RTO): 4 hours. Recovery point objective (RPO): 24 hours.', lastEditor: 'it_admin', updatedAt: '2025-04-10' },
];

const SECTIONS = ['All', ...Array.from(new Set(WIKI_PAGES.map(p => p.section)))];

export default function WikiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('All');
  const [selected, setSelected] = useState<WikiPage | null>(WIKI_PAGES[0]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') return <EnterpriseLayout><div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div></EnterpriseLayout>;
  if (status !== 'authenticated') return null;

  const filtered = WIKI_PAGES.filter(p =>
    (section === 'All' || p.section === section) &&
    (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <EnterpriseLayout>
      <div className="p-8" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>Wiki</h1>
          <p style={{ color: 'var(--gray-600)' }}>Internal documentation and runbooks for the IT team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Input placeholder="Search wiki…" value={search} onChange={e => setSearch(e.target.value)} fullWidth leftIcon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
            <Card padding="md">
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--gray-700)' }}>Sections</h3>
              <ul className="space-y-1">
                {SECTIONS.map(s => (
                  <li key={s}>
                    <button onClick={() => setSection(s)} className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${section === s ? 'font-semibold' : 'hover:bg-gray-100'}`} style={section === s ? { color: 'var(--primary-600)' } : { color: 'var(--gray-700)' }}>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
            <Card padding="md">
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--gray-700)' }}>Pages</h3>
              {filtered.length === 0 ? <p className="text-xs" style={{ color: 'var(--gray-500)' }}>No pages found</p> : (
                <ul className="space-y-1">
                  {filtered.map(p => (
                    <li key={p.id}>
                      <button onClick={() => setSelected(p)} className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${selected?.id === p.id ? 'font-semibold' : 'hover:bg-gray-100'}`} style={selected?.id === p.id ? { color: 'var(--primary-600)' } : { color: 'var(--gray-700)' }}>
                        {p.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {selected ? (
              <Card padding="lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium mb-2 inline-block" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>{selected.section}</span>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>{selected.title}</h2>
                  </div>
                  <button className="btn btn-secondary text-sm">Edit</button>
                </div>
                <pre className="text-sm whitespace-pre-wrap leading-relaxed mb-6" style={{ color: 'var(--gray-700)', fontFamily: 'inherit' }}>{selected.content}</pre>
                <div className="flex items-center gap-4 text-xs pt-4" style={{ borderTop: '1px solid var(--gray-200)', color: 'var(--gray-400)' }}>
                  <span>Last edited by <strong>{selected.lastEditor}</strong></span>
                  <span>on {selected.updatedAt}</span>
                </div>
              </Card>
            ) : (
              <EmptyState title="Select a page" description="Choose a wiki page from the sidebar to view its content." />
            )}
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
