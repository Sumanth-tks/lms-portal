'use client';

import { useState, useEffect } from 'react';
import AuthGuard from './AuthGuard';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AuthGuard>
      <div className="app-workspace">
        <div className="app-shell flex min-h-screen w-full">
          {/* Mobile hamburger */}
          {isMobile && !mobileOpen && (
            <button
              onClick={() => setMobileOpen(true)}
              className="liquid-control fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-[var(--slate-600)]" />
            </button>
          )}

          {/* Mobile overlay backdrop */}
          {isMobile && mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={
            isMobile
              ? `fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
              : ''
          }>
            <Sidebar
              collapsed={isMobile ? false : sidebarCollapsed}
              onToggle={() => {
                if (isMobile) {
                  setMobileOpen(false);
                } else {
                  setSidebarCollapsed((current) => !current);
                }
              }}
            />
          </div>

          <main className={`min-w-0 flex-1 transition-[padding] duration-300 ${
            isMobile ? 'p-4 pt-16' : 'p-4 sm:p-6 lg:p-8'
          }`}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
