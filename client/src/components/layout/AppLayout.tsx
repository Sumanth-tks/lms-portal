'use client';

import AuthGuard from './AuthGuard';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="relative flex min-h-screen overflow-hidden">
        <div
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background: 'var(--page-accent-1), var(--page-accent-2), var(--page-accent-3), var(--page-gradient)',
          }}
        />
        <Sidebar />
        <main className="ml-64 flex-1 p-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
