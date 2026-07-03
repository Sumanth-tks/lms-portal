'use client';

import AuthGuard from './AuthGuard';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div
        className="min-h-screen overflow-x-hidden p-3 sm:p-4 lg:p-5"
        style={{
          background: 'var(--page-accent-1), var(--page-accent-2), var(--page-accent-3), var(--page-gradient)',
        }}
      >
        <div
          className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full overflow-hidden rounded-[28px] border border-white/35 shadow-[0_22px_65px_rgba(59,108,181,0.14)] max-md:flex-col sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-2.5rem)]"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08))',
          }}
        >
          <Sidebar />
          <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
