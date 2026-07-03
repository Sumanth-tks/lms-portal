'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  BookOpen,
  Users,
  LayoutDashboard,
  LogOut,
  GraduationCap,
  ClipboardCheck,
  MessageSquare,
  CheckSquare,
  Calendar,
  MessageCircle,
  FileText,
  Brain,
  GitBranch,
  Briefcase,
  Trophy,
  Rocket,
  TrendingUp,
  Bell,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const menuItems = {
  ADMIN: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/curriculum', label: 'Curriculum', icon: BookOpen },
    { href: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/standups', label: 'Standups', icon: MessageSquare },
    { href: '/tasks', label: 'Daily Tasks', icon: CheckSquare },
    { href: '/assignments', label: 'Assignments', icon: FileText },
    { href: '/quizzes', label: 'Quizzes', icon: Brain },
    { href: '/github', label: 'GitHub', icon: GitBranch },
    { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/hackathons', label: 'Hackathons', icon: Trophy },
    { href: '/capstone', label: 'Capstone', icon: Rocket },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/discord', label: 'Discord', icon: MessageCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
  ],
  MENTOR: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users', label: 'My Interns', icon: Users },
    { href: '/curriculum', label: 'Curriculum', icon: BookOpen },
    { href: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/standups', label: 'Standups', icon: MessageSquare },
    { href: '/tasks', label: 'Daily Tasks', icon: CheckSquare },
    { href: '/assignments', label: 'Assignments', icon: FileText },
    { href: '/quizzes', label: 'Quizzes', icon: Brain },
    { href: '/github', label: 'GitHub', icon: GitBranch },
    { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/hackathons', label: 'Hackathons', icon: Trophy },
    { href: '/capstone', label: 'Capstone', icon: Rocket },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/discord', label: 'Discord', icon: MessageCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
  ],
  INTERN: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/curriculum', label: 'My Courses', icon: BookOpen },
    { href: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/standups', label: 'Standup', icon: MessageSquare },
    { href: '/tasks', label: 'My Tasks', icon: CheckSquare },
    { href: '/assignments', label: 'Assignments', icon: FileText },
    { href: '/quizzes', label: 'Quizzes', icon: Brain },
    { href: '/github', label: 'GitHub', icon: GitBranch },
    { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/hackathons', label: 'Hackathons', icon: Trophy },
    { href: '/capstone', label: 'Capstone', icon: Rocket },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/discord', label: 'Discord', icon: MessageCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
  ],
};

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const items = menuItems[user.role] || [];

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 p-4 pr-3 transition-[width] duration-300 ease-out ${
        collapsed ? 'w-[92px]' : 'w-72 lg:w-80'
      }`}
    >
      <div
        className="glass-panel flex h-[calc(100vh-2rem)] w-full flex-col overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.34)',
          border: '0.5px solid rgba(255, 255, 255, 0.5)',
          borderRadius: collapsed ? '20px' : '22px',
          boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.62), 0 18px 42px rgba(59,108,181,0.1), 0 2px 12px rgba(30,42,58,0.04)',
        }}
      >
        <div
          className={`flex h-16 shrink-0 items-center gap-2.5 px-3 ${collapsed ? 'justify-center' : ''}`}
          style={{ borderBottom: '0.5px solid rgba(0, 0, 0, 0.06)' }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(59, 108, 181, 0.18)',
              border: '0.5px solid rgba(59, 108, 181, 0.1)',
              boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.3)',
            }}
          >
            <GraduationCap className="h-5 w-5 text-[var(--primary-600)]" />
          </div>
          {!collapsed && (
            <span className="truncate text-[15px] font-semibold text-[var(--slate-700)]">Kantaka Sodhana</span>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={onToggle}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[var(--slate-400)] outline-none transition hover:bg-white/25 hover:text-[var(--primary-600)] focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.28)]"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="px-2 pt-3">
            <button
              type="button"
              onClick={onToggle}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="flex h-10 w-full items-center justify-center rounded-xl text-[var(--primary-600)] outline-none transition hover:bg-white/28 focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.28)]"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '0.5px solid rgba(255,255,255,0.35)',
              }}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        <nav className={`scrollbar-none flex flex-1 flex-col gap-0.5 overflow-y-auto py-3 ${collapsed ? 'px-2' : 'px-2'}`}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-xl py-2 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.28)] ${
                  collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                } ${
                  active
                    ? 'text-[var(--primary-600)]'
                    : 'text-[var(--slate-500)] hover:text-[var(--slate-700)]'
                }`}
                style={
                  active
                    ? {
                        background: 'rgba(59, 108, 181, 0.12)',
                        border: '0.5px solid rgba(59, 108, 181, 0.12)',
                        boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.25)',
                      }
                    : undefined
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          className={`shrink-0 p-3 ${collapsed ? 'text-center' : ''}`}
          style={{ borderTop: '0.5px solid rgba(0, 0, 0, 0.06)' }}
        >
          {!collapsed && (
            <div className="mb-3 px-2">
              <p className="truncate text-sm font-semibold text-[var(--slate-700)]">{user.name}</p>
              <p className="text-xs text-[var(--slate-400)]">{user.role}</p>
            </div>
          )}
          <button
            onClick={() => logout()}
            title={collapsed ? 'Logout' : undefined}
            className={`flex w-full items-center rounded-xl text-sm font-medium text-[var(--danger-500)] outline-none transition-colors hover:bg-[rgba(181,59,59,0.08)] focus-visible:ring-2 focus-visible:ring-[rgba(181,59,59,0.18)] ${
              collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-2.5 py-2'
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={collapsed ? 'sr-only' : 'truncate'}>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
