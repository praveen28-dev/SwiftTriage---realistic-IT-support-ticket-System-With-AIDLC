'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card } from '@/app/components/ui/Card';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { useEffect } from 'react';

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

interface Tag { id: string; name: string; color: string; ticketCount: number; }

const MOCK_TAGS: Tag[] = [
  { id: '1', name: 'network', color: '#3B82F6', ticketCount: 12 },
  { id: '2', name: 'hardware', color: '#10B981', ticketCount: 8 },
  { id: '3', name: 'software', color: '#F59E0B', ticketCount: 15 },
  { id: '4', name: 'urgent', color: '#EF4444', ticketCount: 5 },
  { id: '5', name: 'vpn', color: '#8B5CF6', ticketCount: 3 },
];

export default function TagsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') return <EnterpriseLayout><div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div></EnterpriseLayout>;
  if (status !== 'authenticated') return null;

  const handleCreate = () => {
    if (!newName.trim()) return;
    setTags(prev => [...prev, { id: Date.now().toString(), name: newName.trim().toLowerCase(), color: newColor, ticketCount: 0 }]);
    setNewName('');
    setNewColor(PRESET_COLORS[0]);
  };

  const handleDelete = (id: string) => setTags(prev => prev.filter(t => t.id !== id));

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    setTags(prev => prev.map(t => t.id === editId ? { ...t, name: editName.trim(), color: editColor } : t));
    setEditId(null);
  };

  return (
    <EnterpriseLayout>
      <div className="p-8" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>Ticket Tags</h1>
          <p style={{ color: 'var(--gray-600)' }}>Create and manage tags to categorize and filter tickets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Tag */}
          <Card padding="lg">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--gray-900)' }}>Create New Tag</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--gray-700)' }}>Tag Name</label>
                <input className="input w-full" placeholder="e.g. network, urgent…" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--gray-700)' }}>Color</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)} className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110" style={{ backgroundColor: c, borderColor: newColor === c ? 'var(--gray-900)' : 'transparent' }} aria-label={`Color ${c}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm px-3 py-1 rounded-full text-white font-medium" style={{ backgroundColor: newColor }}>{newName || 'preview'}</span>
              </div>
              <button className="btn btn-primary w-full" onClick={handleCreate} disabled={!newName.trim()}>Create Tag</button>
            </div>
          </Card>

          {/* Tag List */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--gray-900)' }}>All Tags ({tags.length})</h2>
              {tags.length === 0 ? (
                <EmptyState title="No tags yet" description="Create your first tag to start organizing tickets." />
              ) : (
                <ul className="space-y-3">
                  {tags.map(tag => (
                    <li key={tag.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                      {editId === tag.id ? (
                        <div className="flex items-center gap-3 flex-1">
                          <input className="input text-sm flex-1" value={editName} onChange={e => setEditName(e.target.value)} />
                          <div className="flex gap-1">
                            {PRESET_COLORS.map(c => (
                              <button key={c} onClick={() => setEditColor(c)} className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: c, borderColor: editColor === c ? 'var(--gray-900)' : 'transparent' }} />
                            ))}
                          </div>
                          <button className="btn btn-primary text-xs px-3 py-1.5 h-auto" onClick={handleSaveEdit}>Save</button>
                          <button className="btn btn-secondary text-xs px-3 py-1.5 h-auto" onClick={() => setEditId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                            <button onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)} className="text-sm font-medium hover:underline" style={{ color: 'var(--gray-900)' }}>{tag.name}</button>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--gray-200)', color: 'var(--gray-600)' }}>{tag.ticketCount} tickets</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="btn btn-secondary text-xs px-3 py-1.5 h-auto" onClick={() => { setEditId(tag.id); setEditName(tag.name); setEditColor(tag.color); }}>Edit</button>
                            <button className="btn btn-danger text-xs px-3 py-1.5 h-auto" onClick={() => handleDelete(tag.id)}>Delete</button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
