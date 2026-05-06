'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { useUsers } from '@/hooks/useUsers';
import { Shield, Plus, X, Check, ChevronDown, ChevronRight, Upload, Camera, Lock, Unlock, Copy } from 'lucide-react';

// ─── IAM Policy Types ─────────────────────────────────────────────────────────

interface PolicyStatement {
  id: string;
  effect: 'Allow' | 'Deny';
  actions: string[];
  resources: string[];
}

interface Policy {
  id: string;
  name: string;
  description: string;
  type: 'managed' | 'inline' | 'custom';
  statements: PolicyStatement[];
  attachedTo: string[];
}

interface UserWithPolicy {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  createdAt: string;
  avatar?: string;
  status: 'active' | 'inactive';
  policies: string[];
  lastLogin?: string;
}

// ─── Pre-defined IAM-style Policies ──────────────────────────────────────────

const MANAGED_POLICIES: Policy[] = [
  {
    id: 'pol-admin-full',
    name: 'AdministratorAccess',
    description: 'Provides full access to all SwiftTriage resources and settings',
    type: 'managed',
    attachedTo: [],
    statements: [
      { id: 's1', effect: 'Allow', actions: ['*'], resources: ['*'] },
    ],
  },
  {
    id: 'pol-ticket-rw',
    name: 'TicketReadWrite',
    description: 'Allows creating, reading, updating, and closing tickets',
    type: 'managed',
    attachedTo: [],
    statements: [
      { id: 's1', effect: 'Allow', actions: ['ticket:Create', 'ticket:Read', 'ticket:Update', 'ticket:Close'], resources: ['arn:swifttriage:tickets:*'] },
    ],
  },
  {
    id: 'pol-ticket-ro',
    name: 'TicketReadOnly',
    description: 'Read-only access to tickets and reports',
    type: 'managed',
    attachedTo: [],
    statements: [
      { id: 's1', effect: 'Allow', actions: ['ticket:Read', 'report:Read'], resources: ['arn:swifttriage:tickets:*'] },
      { id: 's2', effect: 'Deny', actions: ['ticket:Delete', 'ticket:Create'], resources: ['*'] },
    ],
  },
  {
    id: 'pol-user-mgmt',
    name: 'UserManagement',
    description: 'Manage IT staff users and their roles',
    type: 'managed',
    attachedTo: [],
    statements: [
      { id: 's1', effect: 'Allow', actions: ['user:Create', 'user:Read', 'user:Update', 'user:Delete'], resources: ['arn:swifttriage:users:*'] },
    ],
  },
  {
    id: 'pol-kb-editor',
    name: 'KnowledgeBaseEditor',
    description: 'Create and edit knowledge base articles and wiki pages',
    type: 'managed',
    attachedTo: [],
    statements: [
      { id: 's1', effect: 'Allow', actions: ['kb:Create', 'kb:Read', 'kb:Update', 'wiki:Write'], resources: ['arn:swifttriage:kb:*', 'arn:swifttriage:wiki:*'] },
    ],
  },
  {
    id: 'pol-reports-only',
    name: 'ReportsAndInsights',
    description: 'Access to reports, insights, and analytics dashboards',
    type: 'managed',
    attachedTo: [],
    statements: [
      { id: 's1', effect: 'Allow', actions: ['report:Read', 'insight:Read', 'dashboard:Read'], resources: ['arn:swifttriage:reports:*'] },
    ],
  },
];

const ROLE_POLICY_MAP: Record<string, string[]> = {
  ADMIN: ['pol-admin-full', 'pol-ticket-rw', 'pol-user-mgmt', 'pol-kb-editor', 'pol-reports-only'],
  STAFF: ['pol-ticket-rw', 'pol-kb-editor', 'pol-reports-only'],
};

// ─── Avatar Upload ────────────────────────────────────────────────────────────

function AvatarUpload({ username, currentAvatar, onUpload }: {
  username: string;
  currentAvatar?: string;
  onUpload: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(currentAvatar);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreview(url);
      onUpload(url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative w-20 h-20 rounded-full border-2 border-dashed cursor-pointer transition-all ${dragging ? 'border-blue-500 scale-105' : 'border-gray-300 hover:border-blue-400'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        aria-label="Upload avatar"
      >
        {preview ? (
          <img src={preview} alt={username} className="w-full h-full rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-black"
            style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
            {username.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--primary-600)' }}>
          <Camera className="w-3 h-3 text-white" />
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <button onClick={() => inputRef.current?.click()} className="text-xs flex items-center gap-1 hover:underline" style={{ color: 'var(--primary-600)' }}>
        <Upload className="w-3 h-3" /> Upload photo
      </button>
    </div>
  );
}

// ─── Policy Badge ─────────────────────────────────────────────────────────────

function PolicyBadge({ policy, onDetach }: { policy: Policy; onDetach?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--gray-200)' }}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 flex-shrink-0" style={{ color: policy.type === 'managed' ? 'var(--primary-500)' : 'var(--warning-500)' }} />
          <div className="text-left">
            <p className="text-xs font-semibold" style={{ color: 'var(--gray-900)' }}>{policy.name}</p>
            <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{policy.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onDetach && (
            <button onClick={(e) => { e.stopPropagation(); onDetach(); }}
              className="p-1 rounded hover:bg-red-50 transition-colors" aria-label="Detach policy">
              <X className="w-3 h-3" style={{ color: 'var(--error-500)' }} />
            </button>
          )}
          {expanded ? <ChevronDown className="w-3 h-3" style={{ color: 'var(--gray-400)' }} /> : <ChevronRight className="w-3 h-3" style={{ color: 'var(--gray-400)' }} />}
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t" style={{ borderColor: 'var(--gray-100)', backgroundColor: 'var(--gray-50)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--gray-600)' }}>{policy.description}</p>
          {policy.statements.map(stmt => (
            <div key={stmt.id} className="mb-2 last:mb-0">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded mr-2 ${stmt.effect === 'Allow' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                {stmt.effect}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--gray-700)' }}>{stmt.actions.join(', ')}</span>
              <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--gray-400)' }}>{stmt.resources.join(', ')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── User Detail Panel ────────────────────────────────────────────────────────

function UserDetailPanel({ user, onClose, onAvatarUpload, onPolicyAttach, onPolicyDetach, onStatusToggle }: {
  user: UserWithPolicy;
  onClose: () => void;
  onAvatarUpload: (userId: string, url: string) => void;
  onPolicyAttach: (userId: string, policyId: string) => void;
  onPolicyDetach: (userId: string, policyId: string) => void;
  onStatusToggle: (userId: string) => void;
}) {
  const [tab, setTab] = useState<'overview' | 'policies' | 'permissions'>('overview');
  const [showAttach, setShowAttach] = useState(false);

  const attachedPolicies = MANAGED_POLICIES.filter(p => user.policies.includes(p.id));
  const availablePolicies = MANAGED_POLICIES.filter(p => !user.policies.includes(p.id));

  const allActions = Array.from(new Set(
    attachedPolicies.flatMap(p => p.statements.filter(s => s.effect === 'Allow').flatMap(s => s.actions))
  ));
  const deniedActions = Array.from(new Set(
    attachedPolicies.flatMap(p => p.statements.filter(s => s.effect === 'Deny').flatMap(s => s.actions))
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--gray-200)', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-black text-white" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-white">{user.username}</p>
              <p className="text-xs text-white/70">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--gray-200)' }}>
          {(['overview', 'policies', 'permissions'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center">
                <AvatarUpload
                  username={user.username}
                  currentAvatar={user.avatar}
                  onUpload={(url) => onAvatarUpload(user.id, url)}
                />
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'User ID', value: user.id, mono: true },
                  { label: 'Role', value: user.role },
                  { label: 'Status', value: user.status },
                  { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString() },
                  { label: 'Policies', value: `${user.policies.length} attached` },
                  { label: 'Last Login', value: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A' },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--gray-50)' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--gray-500)' }}>{item.label}</p>
                    <p className={`text-sm font-semibold ${item.mono ? 'font-mono text-xs' : ''}`} style={{ color: 'var(--gray-900)' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => onStatusToggle(user.id)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${user.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}
                  style={{ border: `1px solid ${user.status === 'active' ? 'var(--error-300)' : 'var(--success-300)'}`, color: user.status === 'active' ? 'var(--error-600)' : 'var(--success-600)' }}
                >
                  {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  {user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(user.id)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  style={{ border: '1px solid var(--gray-300)', color: 'var(--gray-700)' }}
                >
                  <Copy className="w-4 h-4" /> Copy User ARN
                </button>
              </div>
            </div>
          )}

          {tab === 'policies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: 'var(--gray-900)' }}>
                  Attached Policies ({attachedPolicies.length})
                </p>
                <button
                  onClick={() => setShowAttach(s => !s)}
                  className="btn btn-primary text-xs px-3 py-1.5 h-auto flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Attach Policy
                </button>
              </div>

              {/* Attach dropdown */}
              {showAttach && availablePolicies.length > 0 && (
                <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: 'var(--primary-200)', backgroundColor: 'var(--primary-50)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--primary-700)' }}>Select a policy to attach:</p>
                  {availablePolicies.map(p => (
                    <button key={p.id} onClick={() => { onPolicyAttach(user.id, p.id); setShowAttach(false); }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white transition-colors"
                      style={{ border: '1px solid var(--primary-200)' }}>
                      <Shield className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--primary-500)' }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--gray-900)' }}>{p.name}</p>
                        <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{p.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {attachedPolicies.length === 0 ? (
                <EmptyState title="No policies attached" description="Attach a managed policy to grant permissions." />
              ) : (
                <div className="space-y-2">
                  {attachedPolicies.map(p => (
                    <PolicyBadge key={p.id} policy={p} onDetach={() => onPolicyDetach(user.id, p.id)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'permissions' && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--gray-600)' }}>
                Effective permissions derived from all attached policies.
              </p>

              {allActions.length === 0 ? (
                <EmptyState title="No permissions" description="Attach policies to grant permissions to this user." />
              ) : (
                <>
                  <div>
                    <p className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: 'var(--success-700)' }}>
                      <Check className="w-3 h-3" /> Allowed Actions ({allActions.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {allActions.map(a => (
                        <span key={a} className="text-xs px-2 py-1 rounded font-mono" style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-700)', border: '1px solid var(--success-200)' }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {deniedActions.length > 0 && (
                    <div>
                      <p className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: 'var(--error-700)' }}>
                        <X className="w-3 h-3" /> Denied Actions ({deniedActions.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {deniedActions.map(a => (
                          <span key={a} className="text-xs px-2 py-1 rounded font-mono" style={{ backgroundColor: 'var(--error-50)', color: 'var(--error-700)', border: '1px solid var(--error-200)' }}>
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { users: rawUsers, isLoading } = useUsers();

  // Enrich users with IAM data
  const [users, setUsers] = useState<UserWithPolicy[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithPolicy | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'ADMIN' | 'STAFF'>('all');

  useEffect(() => {
    if (rawUsers.length > 0) {
      setUsers(rawUsers.map(u => ({
        ...u,
        status: 'active' as const,
        policies: ROLE_POLICY_MAP[u.role] ?? [],
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      })));
    }
  }, [rawUsers]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'it_staff' && role !== 'ADMIN') router.push('/');
    }
  }, [status, session, router]);

  const handleAvatarUpload = (userId: string, url: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, avatar: url } : u));
    setSelectedUser(prev => prev?.id === userId ? { ...prev, avatar: url } : prev);
  };

  const handlePolicyAttach = (userId: string, policyId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, policies: [...u.policies, policyId] } : u));
    setSelectedUser(prev => prev?.id === userId ? { ...prev, policies: [...(prev.policies ?? []), policyId] } : prev);
  };

  const handlePolicyDetach = (userId: string, policyId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, policies: u.policies.filter(p => p !== policyId) } : u));
    setSelectedUser(prev => prev?.id === userId ? { ...prev, policies: (prev.policies ?? []).filter(p => p !== policyId) } : prev);
  };

  const handleStatusToggle = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    setSelectedUser(prev => prev?.id === userId ? { ...prev, status: prev.status === 'active' ? 'inactive' : 'active' } : prev);
  };

  const filtered = users.filter(u =>
    (filterRole === 'all' || u.role === filterRole) &&
    (!search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (status === 'loading' || isLoading) return (
    <EnterpriseLayout>
      <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div>
    </EnterpriseLayout>
  );
  if (status !== 'authenticated') return null;

  return (
    <EnterpriseLayout>
      <div className="p-8" style={{ backgroundColor: 'var(--gray-100)' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>Users & Access Management</h1>
            <p style={{ color: 'var(--gray-600)' }}>Manage IT staff identities, roles, and IAM-style policy permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
              {users.length} users
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ backgroundColor: 'var(--success-100)', color: 'var(--success-700)' }}>
              {users.filter(u => u.status === 'active').length} active
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: users.length, color: 'var(--primary-600)', bg: 'var(--primary-50)' },
            { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: 'var(--warning-600)', bg: 'var(--warning-50)' },
            { label: 'Staff', value: users.filter(u => u.role === 'STAFF').length, color: 'var(--info-600)', bg: 'var(--info-50)' },
            { label: 'Policies', value: MANAGED_POLICIES.length, color: 'var(--success-600)', bg: 'var(--success-50)' },
          ].map(s => (
            <Card key={s.label} padding="md">
              <p className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--gray-600)' }}>{s.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Table */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--gray-400)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    className="input w-full pl-9 text-sm"
                    placeholder="Search users…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="input text-sm px-3 py-2"
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value as any)}
                >
                  <option value="all">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>

              {filtered.length === 0 ? (
                <EmptyState title="No users found" description="Try adjusting your search or filter." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-label="IT staff users">
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                        {['User', 'Role', 'Policies', 'Status', ''].map(h => (
                          <th key={h} className="text-left py-3 px-3 font-semibold text-xs" style={{ color: 'var(--gray-600)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(user => (
                        <tr
                          key={user.id}
                          style={{ borderBottom: '1px solid var(--gray-100)', cursor: 'pointer' }}
                          className={`hover:bg-blue-50 transition-colors ${selectedUser?.id === user.id ? 'bg-blue-50' : ''}`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-sm font-bold"
                                    style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-xs" style={{ color: 'var(--gray-900)' }}>{user.username}</p>
                                <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant={user.role === 'ADMIN' ? 'warning' : 'info'} size="sm">{user.role}</Badge>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3" style={{ color: 'var(--primary-500)' }} />
                              <span className="text-xs font-medium" style={{ color: 'var(--gray-700)' }}>{user.policies.length}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.status === 'active' ? 'text-green-700 bg-green-100' : 'text-gray-500 bg-gray-100'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                              className="text-xs font-medium hover:underline"
                              style={{ color: 'var(--primary-600)' }}
                            >
                              Manage →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Managed Policies Sidebar */}
          <div>
            <Card padding="lg">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--gray-900)' }}>
                <Shield className="w-4 h-4" style={{ color: 'var(--primary-500)' }} />
                Managed Policies
              </h2>
              <div className="space-y-2">
                {MANAGED_POLICIES.map(p => (
                  <PolicyBadge key={p.id} policy={p} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* User Detail Slide-over */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onAvatarUpload={handleAvatarUpload}
          onPolicyAttach={handlePolicyAttach}
          onPolicyDetach={handlePolicyDetach}
          onStatusToggle={handleStatusToggle}
        />
      )}
    </EnterpriseLayout>
  );
}
