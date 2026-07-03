'use client';

import { useState } from 'react';
import AuthGuard from './AuthGuard';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div className="app-workspace">
        <div className="app-shell flex min-h-screen w-full">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((current) => !current)}
          />
          <main className="min-w-0 flex-1 p-4 transition-[padding] duration-300 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
