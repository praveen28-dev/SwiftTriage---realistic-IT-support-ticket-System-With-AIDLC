/**
 * Top Navigation Component
 * Global search, notifications, user profile with live data panels
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Search,
  Bell,
  MessageCircle,
  HelpCircle,
  LogOut,
  X,
  CheckCheck,
  Ticket,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink,
  Settings,
  User,
  Shield,
} from 'lucide-react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useTickets } from '@/hooks/useTickets';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: 'ticket' | 'alert' | 'info' | 'success';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relTime(ts: string | Date): string {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function notifIcon(type: Notification['type']) {
  switch (type) {
    case 'ticket': return <Ticket className="w-4 h-4" style={{ color: 'var(--primary-500)' }} />;
    case 'alert': return <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning-500)' }} />;
    case 'success': return <CheckCircle className="w-4 h-4" style={{ color: 'var(--success-500)' }} />;
    default: return <Info className="w-4 h-4" style={{ color: 'var(--info-500)' }} />;
  }
}

// ─── NotificationsPanel ───────────────────────────────────────────────────────

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { activities, isLoading } = useActivityFeed({ limit: 15 });
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Map activities to notifications
  const notifications: Notification[] = (activities ?? []).map((a: any) => ({
    id: a.id ?? String(Math.random()),
    type: a.activityType?.toLowerCase().includes('error') ? 'alert'
      : a.activityType?.toLowerCase().includes('resolve') ? 'success'
      : a.activityType?.toLowerCase().includes('assign') ? 'ticket'
      : 'info',
    title: a.activityType ?? 'System Event',
    body: a.subject ?? a.description ?? 'Activity recorded',
    time: a.createdAt ?? a.timestamp ?? new Date().toISOString(),
    read: readIds.has(a.id),
  }));

  const unread = notifications.filter(n => !n.read).length;

  const markAll = () => setReadIds(new Set(notifications.map(n => n.id)));

  return (
    <div className="absolute right-0 top-full mt-2 w-96 rounded-xl shadow-2xl border z-50 overflow-hidden"
      style={{ backgroundColor: 'var(--white)', borderColor: 'var(--gray-200)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm" style={{ color: 'var(--gray-900)' }}>Notifications</h3>
          {unread > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ backgroundColor: 'var(--error-500)' }}>
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAll} className="text-xs flex items-center gap-1 hover:underline" style={{ color: 'var(--primary-600)' }}>
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-4 h-4" style={{ color: 'var(--gray-500)' }} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="py-8 text-center text-sm" style={{ color: 'var(--gray-500)' }}>Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: 'var(--gray-500)' }}>No notifications</div>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => setReadIds(prev => new Set([...prev, n.id]))}
              className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-0"
              style={{ borderColor: 'var(--gray-100)', backgroundColor: n.read ? 'transparent' : 'var(--primary-50)' }}
            >
              <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--gray-100)' }}>
                {notifIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--gray-900)' }}>{n.title}</p>
                <p className="text-xs truncate" style={{ color: 'var(--gray-600)' }}>{n.body}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--gray-400)' }}>{relTime(n.time)}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: 'var(--primary-500)' }} />}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t text-center" style={{ borderColor: 'var(--gray-200)' }}>
        <a href="/insights" className="text-xs font-medium flex items-center justify-center gap-1 hover:underline" style={{ color: 'var(--primary-600)' }}>
          View all activity <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// ─── ChatPanel ────────────────────────────────────────────────────────────────

function ChatPanel({ onClose }: { onClose: () => void }) {
  const { tickets, isLoading } = useTickets({ refreshInterval: 10000 });
  const router = useRouter();

  // Show recently updated tickets as "messages"
  const recent = [...(tickets ?? [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl border z-50 overflow-hidden"
      style={{ backgroundColor: 'var(--white)', borderColor: 'var(--gray-200)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
        <h3 className="font-bold text-sm" style={{ color: 'var(--gray-900)' }}>Recent Ticket Updates</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
          <X className="w-4 h-4" style={{ color: 'var(--gray-500)' }} />
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {isLoading ? (
          <div className="py-8 text-center text-sm" style={{ color: 'var(--gray-500)' }}>Loading…</div>
        ) : recent.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: 'var(--gray-500)' }}>No recent updates</div>
        ) : (
          recent.map(t => (
            <button
              key={t.id}
              onClick={() => { router.push('/all-tickets'); onClose(); }}
              className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-0"
              style={{ borderColor: 'var(--gray-100)' }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                {(t.assignedTo ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--gray-900)' }}>
                  {(t.aiSummary ?? t.userInput ?? '').slice(0, 50)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                    style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-600)' }}>
                    {t.status}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--gray-400)' }}>{relTime(t.updatedAt)}</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="px-4 py-2 border-t text-center" style={{ borderColor: 'var(--gray-200)' }}>
        <a href="/all-tickets" className="text-xs font-medium flex items-center justify-center gap-1 hover:underline" style={{ color: 'var(--primary-600)' }}>
          View all tickets <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// ─── HelpPanel ────────────────────────────────────────────────────────────────

function HelpPanel({ onClose }: { onClose: () => void }) {
  const links = [
    { icon: '📖', label: 'Knowledge Base', href: '/knowledge', desc: 'Self-service guides and FAQs' },
    { icon: '🌐', label: 'Community Forum', href: '/community', desc: 'Ask questions, share tips' },
    { icon: '📋', label: 'Wiki', href: '/wiki', desc: 'Internal IT documentation' },
    { icon: '🎫', label: 'Submit a Ticket', href: '/submit', desc: 'Report an issue or request' },
    { icon: '📊', label: 'Reports', href: '/reports', desc: 'View ticket metrics' },
  ];

  return (
    <div className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl border z-50 overflow-hidden"
      style={{ backgroundColor: 'var(--white)', borderColor: 'var(--gray-200)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
        <h3 className="font-bold text-sm" style={{ color: 'var(--gray-900)' }}>Help & Resources</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
          <X className="w-4 h-4" style={{ color: 'var(--gray-500)' }} />
        </button>
      </div>
      <div className="p-2">
        {links.map(l => (
          <a key={l.href} href={l.href}
            className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onClose}>
            <span className="text-lg flex-shrink-0">{l.icon}</span>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--gray-900)' }}>{l.label}</p>
              <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{l.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── UserMenuPanel ────────────────────────────────────────────────────────────

function UserMenuPanel({ session, onClose }: { session: any; onClose: () => void }) {
  const role = session?.user?.role ?? 'it_staff';

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl border z-50 overflow-hidden"
      style={{ backgroundColor: 'var(--white)', borderColor: 'var(--gray-200)' }}>
      {/* Profile header */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--gray-200)', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            {(session?.user?.name ?? 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{session?.user?.name ?? 'User'}</p>
            <p className="text-xs text-white/70 capitalize">{role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="p-2">
        <a href="/users" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          style={{ color: 'var(--gray-700)' }}>
          <User className="w-4 h-4" /> My Profile
        </a>
        {role === 'ADMIN' && (
          <a href="/dashboard/admin" onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            style={{ color: 'var(--gray-700)' }}>
            <Shield className="w-4 h-4" /> Admin Panel
          </a>
        )}
        <a href="/dashboard" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          style={{ color: 'var(--gray-700)' }}>
          <Settings className="w-4 h-4" /> Settings
        </a>
        <div className="border-t my-1" style={{ borderColor: 'var(--gray-200)' }} />
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm"
          style={{ color: 'var(--error-600)' }}>
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── TopNav ───────────────────────────────────────────────────────────────────

type Panel = 'chat' | 'notifications' | 'help' | 'user' | null;

export function TopNav() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);

  // Live unread counts
  const { activities } = useActivityFeed({ limit: 20 });
  const { tickets } = useTickets({ refreshInterval: 10000 });

  const notifCount = Math.min((activities ?? []).slice(0, 5).length, 9);
  const chatCount = Math.min((tickets ?? []).filter(t => t.status === 'PENDING' || t.status === 'OPEN').length, 9);

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (panel: Panel) => setOpenPanel(prev => prev === panel ? null : panel);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&sort=${sortBy}`);
      setOpenPanel(null);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-40">
      <div className="flex items-center flex-1 space-x-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets, customers, products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="absolute right-2 text-sm border-l border-gray-300 pl-2 pr-8 py-1 bg-white focus:outline-none"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </form>
      </div>

      {/* Right Actions */}
      <div ref={containerRef} className="flex items-center space-x-1">

        {/* Chat / Recent Tickets */}
        <div className="relative">
          <button
            onClick={() => toggle('chat')}
            className={`relative p-2 rounded-lg transition-colors ${openPanel === 'chat' ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
            aria-label="Recent ticket updates"
          >
            <MessageCircle className="w-5 h-5 text-gray-600" />
            {chatCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: 'var(--success-500)' }}>
                {chatCount > 9 ? '9+' : chatCount}
              </span>
            )}
          </button>
          {openPanel === 'chat' && <ChatPanel onClose={() => setOpenPanel(null)} />}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => toggle('notifications')}
            className={`relative p-2 rounded-lg transition-colors ${openPanel === 'notifications' ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: 'var(--error-500)' }}>
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>
          {openPanel === 'notifications' && <NotificationsPanel onClose={() => setOpenPanel(null)} />}
        </div>

        {/* Help */}
        <div className="relative">
          <button
            onClick={() => toggle('help')}
            className={`p-2 rounded-lg transition-colors ${openPanel === 'help' ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
            aria-label="Help and resources"
          >
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>
          {openPanel === 'help' && <HelpPanel onClose={() => setOpenPanel(null)} />}
        </div>

        {/* User Menu */}
        <div className="relative pl-3 border-l border-gray-200 ml-1">
          <button
            onClick={() => toggle('user')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${openPanel === 'user' ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))' }}>
              {(session?.user?.name ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-tight">{session?.user?.name ?? 'User'}</p>
              <p className="text-xs text-green-500 leading-tight">● Online</p>
            </div>
          </button>
          {openPanel === 'user' && <UserMenuPanel session={session} onClose={() => setOpenPanel(null)} />}
        </div>
      </div>
    </header>
  );
}
