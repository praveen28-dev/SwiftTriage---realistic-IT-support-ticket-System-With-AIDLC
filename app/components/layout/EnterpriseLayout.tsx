/**
 * Enterprise Layout Component
 * Main layout wrapper with sidebar and top navigation
 */

'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface EnterpriseLayoutProps {
  children: React.ReactNode;
}

export function EnterpriseLayout({ children }: EnterpriseLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Navigation */}
        <TopNav />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
