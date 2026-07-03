'use client';

import AuthGuard from './AuthGuard';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="relative flex min-h-screen">
        {/* Gradient background with color accents */}
        <div
          className="pointer-events-none fixed inset-0 -z-10"
          style={