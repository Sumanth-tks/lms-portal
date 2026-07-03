'use client';

import AuthGuard from './AuthGuard';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#f8f9fb]">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
