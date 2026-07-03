'use client';

import { useState } from 'react';
import AuthGuard from './AuthGuard';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div
        className="min-h-screen overflow-x-hidden"
        style={{
          background: 'var(--page-accent-1), var(--page-accent-2), var(--page-accent-3), var(--page-gradient)',
        }}
      >
        <div className="flex min-h-screen w-full">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((current) => !current)}
          />
          <main className="min-w-0 flex-1 p-5 transition-[padding] duration-300 sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
