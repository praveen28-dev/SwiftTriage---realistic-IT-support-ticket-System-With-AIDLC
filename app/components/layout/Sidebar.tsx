/**
 * Enterprise Sidebar Component
 * Collapsible navigation sidebar with role-based visibility
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Ticket,
  Tags,
  BookOpen,
  Users as UsersIcon,
  Calendar,
  UserCircle,
  Building2,
  BarChart3,
  Lightbulb,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  roles?: string[]; // If specified, only show for these roles
}

const navigationItems: NavItem[] = [
  // Core Modules
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Tickets', href: '/dashboard/my-tickets', icon: Ticket, roles: ['it_staff', 'ADMIN'] },
  { name: 'All Tickets', href: '/all-tickets', icon: Ticket, roles: ['it_staff', 'ADMIN'] },

  // Management
  { name: 'Ticket Tags', href: '/tags', icon: Tags },
  { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
  { name: 'Community', href: '/community', icon: UsersIcon },
  { name: 'Wiki', href: '/wiki', icon: BookOpen },

  // Utility
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Calendar', href: '/calendar', icon: Calendar },

  // System (IT Staff Only)
  { name: 'Users', href: '/users', icon: UserCircle, roles: ['it_staff', 'ADMIN'] },
  { name: 'Groups', href: '/groups', icon: UsersIcon, roles: ['it_staff', 'ADMIN'] },
  { name: 'Customers', href: '/customers', icon: Building2, roles: ['it_staff', 'ADMIN'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['it_staff', 'ADMIN'] },
  { name: 'Insights', href: '/insights', icon: Lightbulb, roles: ['it_staff', 'ADMIN'] },

  // Admin — visible to ADMIN role only
  { name: 'Admin', href: '/dashboard/admin', icon: Settings, roles: ['ADMIN'] },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const userRole = (session?.user as any)?.role || 'end_user';

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter(item => {
    if (!item.roles) return true; // Show to all if no roles specified
    return item.roles.includes(userRole);
  });

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-50 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <span className="font-bold text-lg">SwiftTriage</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* New Ticket Button */}
      {!isCollapsed && (
        <div className="p-4">
          <Link
            href="/submit"
            className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Ticket</span>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {!isCollapsed && session && (
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user?.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{userRole.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
