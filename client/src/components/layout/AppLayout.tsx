'use client';

import AuthGuard from './AuthGuard';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen overflow-x-hidden bg-[#101111] p-4 sm:p-5 lg:p-6">
        <div
          className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1800px] overflow-hidden rounded-[24px] border border-white/20 shadow-[0_24px_70px_rgba(0,0,0,0.36)] max-md:flex-col sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3rem)]"
          style={{
            background: 'var(--page-accent-1), var(--page-accent-2), var(--page-accent-3), var(--page-gradient)',
          }}
        >
          <Sidebar />
          <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
