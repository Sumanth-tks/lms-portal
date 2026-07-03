'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import type { Notification as Notif } from '@/types';
import {
  BookOpen, Users, FolderOpen, ClipboardCheck, FileText,
  Brain, GitBranch, Trophy, Zap, Award, Flame, Bell, Check,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  stats: Record<string, number | string | boolean | null>;
  notifications?: Notif[];
  recentUsers?: { id: string; name: string; email: string; role: string; status: string; createdAt: string }[];
  todayAttendance?: { status: string; intern?: { id: string; name: string } }[];
  recentStandups?: { internId: string; yesterday: string; today: string; intern?: { id: string; name: string } }[];
  recentSubmissions?: { id: string; status: string; grade: number | null; assignment?: { title: string; maxScore: number } }[];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const endpoint = user?.role === 'ADMIN' ? '/dashboard/admin'
          : user?.role === 'MENTOR' ? '/dashboard/mentor'
          : '/dashboard/intern';
        const res = await api.get(endpoint);
        setData(res.data.data);
      } catch { /* handled */ } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.role]);

  async function markAllRead() {
    await api.put('/dashboard/notifications/read');
    const endpoint = user?.role === 'ADMIN' ? '/dashboard/admin'
      : user?.role === 'MENTOR' ? '/dashboard/mentor'
      : '/dashboard/intern';
    const res = await api.get(endpoint);
    setData(res.data.data);
  }

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
      </div>
    );
  }

  const s = data.stats;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-[var(--slate-800)]">Welcome back, {user?.name}</h1>
      <p className="mb-6 text-sm text-[var(--slate-400)]">
        {user?.role === 'ADMIN' ? 'Admin Dashboard' : user?.role === 'MENTOR' ? 'Mentor Dashboard' : 'Your Learning Dashboard'}
      </p>

      {/* Admin Dashboard */}
      {user?.role === 'ADMIN' && (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={<Users className="h-5 w-5 text-[var(--primary-600)]" />} label="Total Users" value={s.totalUsers as number} colorClass="si-blue" />
            <StatCard icon={<BookOpen className="h-5 w-5 text-[var(--sage-500)]" />} label="Courses" value={s.courses as number} colorClass="si-green" />
            <StatCard icon={<FileText className="h-5 w-5 text-[var(--gold-500)]" />} label="Pending Submissions" value={s.pendingSubmissions as number} colorClass="si-gold" />
            <StatCard icon={<ClipboardCheck className="h-5 w-5 text-[var(--rose-500)]" />} label="Present Today" value={`${s.presentToday}/${s.totalToday}`} colorClass="si-purple" />
          </div>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MiniStat label="Admins" value={s.admins as number} />
            <MiniStat label="Mentors" value={s.mentors as number} />
            <MiniStat label="Interns" value={s.interns as number} />
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <QuickLinks role="ADMIN" />
            {data.recentUsers && (
              <div className="glass-card min-h-[220px] p-5">
                <h3 className="mb-3 text-sm font-semibold text-[var(--slate-700)]">Recent Users</h3>
                <div className="space-y-1.5">
                  {data.recentUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm"
                      style={{ background: 'rgba(255,255,255,0.16)' }}
                    >
                      <span className="text-[var(--slate-600)]">{u.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.role === 'ADMIN' ? 'bg-[var(--danger-50)] text-[var(--danger-500)]' : u.role === 'MENTOR' ? 'bg-[var(--primary-50)] text-[var(--primary-600)]' : 'bg-[var(--sage-50)] text-[var(--sage-500)]'}`}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mentor Dashboard */}
      {user?.role === 'MENTOR' && (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={<Users className="h-5 w-5 text-[var(--primary-600)]" />} label="My Interns" value={s.menteeCount as number} colorClass="si-blue" />
            <StatCard icon={<ClipboardCheck className="h-5 w-5 text-[var(--sage-500)]" />} label="Present Today" value={`${s.presentToday}/${s.totalToday}`} colorClass="si-green" />
            <StatCard icon={<FileText className="h-5 w-5 text-[var(--gold-500)]" />} label="Pending Reviews" value={(s.pendingSubmissions as number) + (s.pendingReviews as number)} colorClass="si-gold" />
            <StatCard icon={<Brain className="h-5 w-5 text-[var(--rose-500)]" />} label="Standups Today" value={s.standupsDone as number} colorClass="si-purple" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <QuickLinks role="MENTOR" />
            {data.todayAttendance && data.todayAttendance.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-[var(--slate-700)]">Today&apos;s Attendance</h3>
                <div className="space-y-2">
                  {data.todayAttendance.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--slate-600)]">{a.intern?.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.status === 'PRESENT' ? 'bg-[var(--sage-50)] text-[var(--sage-500)]' : a.status === 'LATE' ? 'bg-[var(--gold-50)] text-[var(--gold-500)]' : 'bg-[var(--danger-50)] text-[var(--danger-500)]'}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Intern Dashboard */}
      {user?.role === 'INTERN' && (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={<ClipboardCheck className="h-5 w-5 text-[var(--primary-600)]" />} label="Attendance" value={`${s.attendanceRate}%`} colorClass="si-blue" />
          </div>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <MiniStat label="Today Tasks" value={`${s.completedTasks}/${s.todayTasks}`} />
            <MiniStat label="Submissions" value={s.totalSubmissions as number} />
            <MiniStat label="Quiz Attempts" value={s.quizAttempts as number} />
            <MiniStat label="Commits" value={s.commits as number} />
            <MiniStat label="Capstone" value={(s.capstonePhase as string) || 'Not started'} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <QuickLinks role="INTERN" />
            {data.recentSubmissions && data.recentSubmissions.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-[var(--slate-700)]">Recent Submissions</h3>
                <div className="space-y-2">
                  {data.recentSubmissions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--slate-600)]">{sub.assignment?.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sub.status === 'GRADED' ? 'bg-[var(--sage-50)] text-[var(--sage-500)]' : 'bg-[var(--primary-50)] text-[var(--primary-600)]'}`}>
                        {sub.status === 'GRADED' ? `${sub.grade}/${sub.assignment?.maxScore}` : sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {data.notifications && data.notifications.length > 0 && (
        <div className="glass-card mt-6 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[var(--slate-400)]" />
              <h3 className="text-sm font-semibold text-[var(--slate-700)]">Notifications</h3>
            </div>
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[var(--primary-400)] hover:text-[var(--primary-600)]">
              <Check className="h-3 w-3" /> Mark all read
            </button>
          </div>
          <div className="space-y-2">
            {data.notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 rounded-lg px-3 py-2 text-sm"
                style={n.read ? { color: 'var(--slate-400)' } : { background: 'rgba(59,108,181,0.06)', color: 'var(--slate-600)' }}
              >
                <div className="flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs">{n.message}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-[var(--slate-300)]">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const iconStyles: Record<string, React.CSSProperties> = {
  'si-blue': { background: 'rgba(59,108,181,0.15)', border: '0.5px solid rgba(59,108,181,0.08)', boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.25)' },
  'si-green': { background: 'rgba(45,122,79,0.15)', border: '0.5px solid rgba(45,122,79,0.08)', boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.25)' },
  'si-gold': { background: 'rgba(154,107,30,0.15)', border: '0.5px solid rgba(154,107,30,0.08)', boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.25)' },
  'si-purple': { background: 'rgba(107,63,160,0.13)', border: '0.5px solid rgba(107,63,160,0.08)', boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.25)' },
};

function StatCard({ icon, label, value, colorClass }: { icon: React.ReactNode; label: string; value: number | string; colorClass: string }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={iconStyles[colorClass]}>{icon}</div>
        <div>
          <p className="text-xl font-semibold leading-tight text-[var(--slate-800)]">{value}</p>
          <p className="text-xs text-[var(--slate-400)]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass-card-sm px-3 py-2.5 text-center">
      <p className="text-xs text-[var(--slate-400)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--slate-700)]">{typeof value === 'number' ? value : value}</p>
    </div>
  );
}

function QuickLinks({ role }: { role: string }) {
  const links = role === 'ADMIN' ? [
    { href: '/users', label: 'Manage Users', icon: Users },
    { href: '/assignments', label: 'Assignments', icon: FileText },
    { href: '/progress', label: 'Progress Reports', icon: ClipboardCheck },
    { href: '/hackathons', label: 'Hackathons', icon: Trophy },
  ] : role === 'MENTOR' ? [
    { href: '/assignments', label: 'Grade Work', icon: FileText },
    { href: '/progress', label: 'Student Progress', icon: ClipboardCheck },
    { href: '/github', label: 'Code Reviews', icon: GitBranch },
    { href: '/hackathons', label: 'Hackathons', icon: Trophy },
  ] : [
    { href: '/attendance', label: 'Mark Attendance', icon: ClipboardCheck },
    { href: '/tasks', label: 'Daily Tasks', icon: FileText },
  ];

  return (
    <div className="glass-card min-h-[220px] p-5">
      <h3 className="mb-3 text-sm font-semibold text-[var(--slate-700)]">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-w-0 items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-[var(--slate-500)] outline-none transition hover:-translate-y-0.5 hover:text-[var(--primary-600)] focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.22)]"
              style={{
                background: 'rgba(255,255,255,0.32)',
                border: '0.5px solid rgba(255,255,255,0.42)',
                boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.4)',
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">{l.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
