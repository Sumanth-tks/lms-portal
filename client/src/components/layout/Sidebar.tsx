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
  Eye,
  AlertTriangle,
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
    { href: '/peer-reviews', label: 'Peer Reviews', icon: Eye },
    { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/hackathons', label: 'Hackathons', icon: Trophy },
    { href: '/capstone', label: 'Capstone', icon: Rocket },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/risk-alerts', label: 'Risk Alerts', icon: AlertTriangle },
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
    { href: '/peer-reviews', label: 'Peer Reviews', icon: Eye },
    { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/hackathons', label: 'Hackathons', icon: Trophy },
    { href: '/capstone', label: 'Capstone', icon: Rocket },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/risk-alerts', label: 'Risk Alerts', icon: AlertTriangle },
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
    { href: '/peer-reviews', label: 'Peer Reviews', icon: Eye },
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
  const labelMotion = collapsed
    ? 'w-0 translate-x-2 opacity-0'
    : 'w-36 translate-x-0 opacity-100 lg:w-44';

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 transition-[width,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        collapsed ? 'w-[88px] p-3 pr-2' : 'w-[292px] p-4 pr-3 lg:w-[316px]'
      }`}
    >
      <div
        className={`liquid-panel flex w-full flex-col transition-[border-radius,box-shadow] duration-500 ${
          collapsed ? 'h-[calc(100vh-1.5rem)] rounded-[22px]' : 'h-[calc(100vh-2rem)] rounded-[26px]'
        }`}
      >
        <div
          className={`flex h-[76px] shrink-0 items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-4'}`}
          style={{ borderBottom: '0.5px solid rgba(0, 0, 0, 0.06)' }}
        >
          <div
            className="liquid-control flex h-10 w-10 shrink-0 items-center justify-center"
            style={{
              background: 'rgba(59, 108, 181, 0.18)',
            }}
          >
            <GraduationCap className="h-5 w-5 text-[var(--primary-600)]" />
          </div>
          <span
            className={`overflow-hidden whitespace-nowrap text-[15px] font-semibold text-[var(--slate-700)] transition-all duration-300 ${labelMotion}`}
          >
            Kantaka Sodhana
          </span>
          {!collapsed && (
            <button
              type="button"
              onClick={onToggle}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="liquid-control ml-auto flex h-9 w-9 items-center justify-center text-[var(--slate-400)] outline-none transition hover:text-[var(--primary-600)] focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.28)]"
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
              className="liquid-control flex h-10 w-full items-center justify-center text-[var(--primary-600)] outline-none transition focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.28)]"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        <nav className={`scrollbar-none flex flex-1 flex-col gap-1 overflow-y-auto py-3 ${collapsed ? 'px-2' : 'px-3'}`}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                className={`sidebar-nav-link flex items-center rounded-2xl py-2.5 text-[13px] font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.28)] ${
                  collapsed ? 'sidebar-nav-link-collapsed justify-center px-0' : 'gap-3 px-3.5'
                } ${
                  active
                    ? 'sidebar-nav-link-active'
                    : 'text-[var(--slate-500)] hover:bg-white/25 hover:text-[var(--slate-700)]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span
                  className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ${labelMotion}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          className={`shrink-0 p-3 ${collapsed ? 'text-center' : ''}`}
          style={{ borderTop: '0.5px solid rgba(0, 0, 0, 0.06)' }}
        >
          {!collapsed && (
            <div className="liquid-pill mb-3 px-3 py-3">
              <p className="truncate text-sm font-semibold text-[var(--slate-700)]">{user.name}</p>
              <p className="text-xs text-[var(--slate-400)]">{user.role}</p>
            </div>
          )}
          <button
            onClick={() => logout()}
            aria-label="Logout"
            title={collapsed ? 'Logout' : undefined}
            className={`flex w-full items-center rounded-2xl text-sm font-medium text-[var(--danger-500)] outline-none transition hover:bg-[rgba(181,59,59,0.08)] focus-visible:ring-2 focus-visible:ring-[rgba(181,59,59,0.18)] ${
              collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ${labelMotion}`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
