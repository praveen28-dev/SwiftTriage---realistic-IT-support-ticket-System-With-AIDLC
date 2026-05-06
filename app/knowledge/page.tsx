'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { EmptyState } from '@/app/components/ui/EmptyState';

interface Article { id: string; title: string; category: string; excerpt: string; views: number; updatedAt: string; }

const ARTICLES: Article[] = [
  { id: '1', title: 'How to Reset Your Password', category: 'Account', excerpt: 'Step-by-step guide to resetting your account password through the self-service portal.', views: 342, updatedAt: '2025-04-10' },
  { id: '2', title: 'VPN Setup for Remote Access', category: 'Network', excerpt: 'Configure the corporate VPN client on Windows, macOS, and Linux devices.', views: 218, updatedAt: '2025-04-15' },
  { id: '3', title: 'Printer Troubleshooting Guide', category: 'Hardware', excerpt: 'Common printer issues and how to resolve them without raising a support ticket.', views: 189, updatedAt: '2025-03-28' },
  { id: '4', title: 'Software Installation Policy', category: 'Software', excerpt: 'Approved software list and the process for requesting new software installations.', views: 156, updatedAt: '2025-04-01' },
  { id: '5', title: 'Email Configuration on Mobile', category: 'Email', excerpt: 'Set up corporate email on iOS and Android devices using Exchange ActiveSync.', views: 134, updatedAt: '2025-04-20' },
  { id: '6', title: 'Multi-Factor Authentication Setup', category: 'Security', excerpt: 'Enable and configure MFA for your corporate account to improve security.', views: 298, updatedAt: '2025-04-18' },
];

const CATEGORIES = ['All', ...Array.from(new Set(ARTICLES.map(a => a.category)))];

export default function KnowledgeBasePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') return <EnterpriseLayout><div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div></EnterpriseLayout>;
  if (status !== 'authenticated') return null;

  const filtered = ARTICLES.filter(a =>
    (category === 'All' || a.category === category) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <EnterpriseLayout>
      <div className="p-8" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>Knowledge Base</h1>
          <p style={{ color: 'var(--gray-600)' }}>Find answers to common IT questions and self-service guides</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} fullWidth leftIcon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === c ? 'text-white' : 'hover:bg-gray-200'}`} style={category === c ? { backgroundColor: 'var(--primary-600)' } : { backgroundColor: 'var(--gray-200)', color: 'var(--gray-700)' }}>
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No articles found" description="Try a different search term or category." action={{ label: 'Clear Search', onClick: () => { setSearch(''); setCategory('All'); } }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(article => (
              <Card key={article.id} padding="lg" className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>{article.category}</span>
                  <span className="text-xs" style={{ color: 'var(--gray-500)' }}>{article.views} views</span>
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--gray-900)' }}>{article.title}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--gray-600)' }}>{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--gray-400)' }}>Updated {article.updatedAt}</span>
                  <button className="text-sm font-medium" style={{ color: 'var(--primary-600)' }}>Read more →</button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </EnterpriseLayout>
  );
}
