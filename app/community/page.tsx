'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card } from '@/app/components/ui/Card';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

interface Post { id: string; author: string; title: string; body: string; replies: number; likes: number; createdAt: string; category: string; }

const POSTS: Post[] = [
  { id: '1', author: 'it_admin', title: 'Best practices for ticket escalation', body: 'When should we escalate a ticket to Tier 2? Looking for team input on defining clear criteria.', replies: 4, likes: 7, createdAt: '2025-05-01', category: 'Process' },
  { id: '2', author: 'it_staff1', title: 'New VPN client rollout — feedback thread', body: 'We are rolling out the new GlobalProtect client next week. Please share any issues you encounter here.', replies: 12, likes: 3, createdAt: '2025-04-28', category: 'Announcements' },
  { id: '3', author: 'it_staff2', title: 'Tip: Use keyboard shortcuts in the ticket form', body: 'Press Ctrl+Enter to submit a ticket quickly. Share your favourite shortcuts below!', replies: 6, likes: 15, createdAt: '2025-04-22', category: 'Tips' },
  { id: '4', author: 'it_admin', title: 'Monthly maintenance window — May 10', body: 'Scheduled downtime from 02:00–04:00 UTC on May 10. All non-critical tickets will be queued.', replies: 2, likes: 5, createdAt: '2025-04-18', category: 'Announcements' },
];

const CATEGORIES = ['All', 'Announcements', 'Process', 'Tips'];

export default function CommunityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [category, setCategory] = useState('All');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [posts, setPosts] = useState<Post[]>(POSTS);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') return <EnterpriseLayout><div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div></EnterpriseLayout>;
  if (status !== 'authenticated') return null;

  const filtered = category === 'All' ? posts : posts.filter(p => p.category === category);

  const handlePost = () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    setPosts(prev => [{
      id: Date.now().toString(),
      author: session.user?.name ?? 'You',
      title: newTitle.trim(),
      body: newBody.trim(),
      replies: 0,
      likes: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      category: 'Process',
    }, ...prev]);
    setNewTitle('');
    setNewBody('');
  };

  return (
    <EnterpriseLayout>
      <div className="p-8" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>Community</h1>
          <p style={{ color: 'var(--gray-600)' }}>Share tips, announcements, and discussions with your IT team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Post */}
          <div>
            <Card padding="lg">
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--gray-900)' }}>New Post</h2>
              <div className="space-y-3">
                <input className="input w-full" placeholder="Title…" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                <textarea className="input w-full resize-none" rows={4} placeholder="What's on your mind?" value={newBody} onChange={e => setNewBody(e.target.value)} />
                <button className="btn btn-primary w-full" onClick={handlePost} disabled={!newTitle.trim() || !newBody.trim()}>Post</button>
              </div>
            </Card>

            {/* Category Filter */}
            <Card padding="lg" className="mt-4">
              <h2 className="text-base font-bold mb-3" style={{ color: 'var(--gray-900)' }}>Categories</h2>
              <ul className="space-y-1">
                {CATEGORIES.map(c => (
                  <li key={c}>
                    <button onClick={() => setCategory(c)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === c ? 'font-semibold text-white' : 'hover:bg-gray-100'}`} style={category === c ? { backgroundColor: 'var(--primary-600)' } : { color: 'var(--gray-700)' }}>
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Posts */}
          <div className="lg:col-span-2 space-y-4">
            {filtered.map(post => (
              <Card key={post.id} padding="lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full mr-2 font-medium" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>{post.category}</span>
                    <span className="text-xs" style={{ color: 'var(--gray-400)' }}>{post.createdAt}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--gray-500)' }}>by {post.author}</span>
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--gray-900)' }}>{post.title}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--gray-600)' }}>{post.body}</p>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--gray-500)' }}>
                  <span>💬 {post.replies} replies</span>
                  <span>👍 {post.likes} likes</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
