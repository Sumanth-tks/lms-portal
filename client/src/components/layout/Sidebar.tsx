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

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const items = menuItems[user.role] || [];

  return (
    <aside className="flex w-full shrink-0 p-3 pb-0 md:w-[248px] md:p-4 md:pr-2">
      <div
        className="glass-panel flex max-h-[515px] min-h-[220px] w-full flex-col overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.34)',
          border: '0.5px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '18px',
          boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.55), 0 1px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div
          className="flex h-16 shrink-0 items-center gap-2.5 px-4"
          style={{ borderBottom: '0.5px solid rgba(0, 0, 0, 0.06)' }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: 'rgba(59, 108, 181, 0.18)',
              border: '0.5px solid rgba(59, 108, 181, 0.1)',
              boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.3)',
            }}
          >
            <GraduationCap className="h-5 w-5 text-[var(--primary-600)]" />
          </div>
          <span className="truncate text-[15px] font-semibold text-[var(--slate-700)]">Kantaka Sodhana</span>
        </div>

        <nav className="scrollbar-none flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
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
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          className="shrink-0 p-3"
          style={{ borderTop: '0.5px solid rgba(0, 0, 0, 0.06)' }}
        >
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-semibold text-[var(--slate-700)]">{user.name}</p>
            <p className="text-xs text-[var(--slate-400)]">{user.role}</p>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--danger-500)] transition-colors hover:bg-[rgba(181,59,59,0.08)]"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
