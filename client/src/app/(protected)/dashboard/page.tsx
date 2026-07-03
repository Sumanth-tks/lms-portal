'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import type { Assignment, CalendarEvent, Course, Notification as Notif } from '@/types';
import {
  Activity, ArrowRight, BookOpen, Users, ClipboardCheck, FileText,
  Brain, GitBranch, Trophy, Bell, Check, TrendingUp, Route,
  CalendarDays, Flag, ListChecks, MessageSquare, Pin,
  CheckCircle2, Circle, Target,
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
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<Assignment[]>([]);
  const [studentEvents, setStudentEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const endpoint = user?.role === 'ADMIN' ? '/dashboard/admin'
          : user?.role === 'MENTOR' ? '/dashboard/mentor'
          : '/dashboard/intern';
        const res = await api.get(endpoint);
        if (!active) return;
        setData(res.data.data);

        if (user?.role === 'INTERN') {
          const now = new Date();
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          const [coursesRes, assignmentsRes, thisMonthEventsRes, nextMonthEventsRes] = await Promise.allSettled([
            api.get('/courses'),
            api.get('/assignments'),
            api.get(`/calendar-events?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
            api.get(`/calendar-events?month=${nextMonth.getMonth() + 1}&year=${nextMonth.getFullYear()}`),
          ]);

          if (!active) return;
          setStudentCourses(coursesRes.status === 'fulfilled' ? coursesRes.value.data.data : []);
          setStudentAssignments(assignmentsRes.status === 'fulfilled' ? assignmentsRes.value.data.data : []);
          const thisMonthEvents = thisMonthEventsRes.status === 'fulfilled' ? thisMonthEventsRes.value.data.data : [];
          const nextMonthEvents = nextMonthEventsRes.status === 'fulfilled' ? nextMonthEventsRes.value.data.data : [];
          setStudentEvents(dedupeById([...thisMonthEvents, ...nextMonthEvents]));
        } else {
          setStudentCourses([]);
          setStudentAssignments([]);
          setStudentEvents([]);
        }
      } catch { /* handled */ } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
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
    <div className="liquid-enter w-full space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-[var(--slate-800)]">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">
            {user?.role === 'ADMIN' ? 'Admin Dashboard' : user?.role === 'MENTOR' ? 'Mentor Dashboard' : 'Your Learning Dashboard'}
          </p>
        </div>
        <div className="liquid-pill hidden items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--slate-500)] sm:flex">
          <Activity className="h-4 w-4 text-[var(--primary-500)]" />
          <span>{user?.role} workspace</span>
        </div>
      </header>

      {/* Admin Dashboard */}
      {user?.role === 'ADMIN' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard delayClass="liquid-stagger-1" icon={<Users className="h-5 w-5 text-[var(--primary-600)]" />} label="Total Users" value={s.totalUsers as number} colorClass="si-blue" />
            <StatCard delayClass="liquid-stagger-1" icon={<BookOpen className="h-5 w-5 text-[var(--sage-500)]" />} label="Courses" value={s.courses as number} colorClass="si-green" />
            <StatCard delayClass="liquid-stagger-2" icon={<FileText className="h-5 w-5 text-[var(--gold-500)]" />} label="Pending Submissions" value={s.pendingSubmissions as number} colorClass="si-gold" />
            <StatCard delayClass="liquid-stagger-2" icon={<ClipboardCheck className="h-5 w-5 text-[var(--rose-500)]" />} label="Present Today" value={`${s.presentToday}/${s.totalToday}`} colorClass="si-purple" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MiniStat label="Admins" value={s.admins as number} />
            <MiniStat label="Mentors" value={s.mentors as number} />
            <MiniStat label="Interns" value={s.interns as number} />
          </div>
          <DashboardAnalytics
            segments={[
              { label: 'Admins', value: s.admins as number, color: '#3B6CB5' },
              { label: 'Mentors', value: s.mentors as number, color: '#2D7A4F' },
              { label: 'Interns', value: s.interns as number, color: '#9A6B1E' },
            ]}
            bars={[
              { label: 'Attendance', value: percent(s.presentToday as number, s.totalToday as number), detail: `${s.presentToday}/${s.totalToday}` },
              { label: 'Submission Queue', value: Math.min(100, ((s.pendingSubmissions as number) || 0) * 20), detail: `${s.pendingSubmissions || 0} pending` },
            ]}
          />
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.86fr)]">
            <QuickLinks role="ADMIN" />
            {data.recentUsers && <RecentUsers users={data.recentUsers} />}
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
          <DashboardAnalytics
            segments={[
              { label: 'Present', value: s.presentToday as number, color: '#2D7A4F' },
              { label: 'Remaining', value: Math.max(0, (s.totalToday as number) - (s.presentToday as number)), color: '#9EAAB8' },
            ]}
            bars={[
              { label: 'Attendance', value: percent(s.presentToday as number, s.totalToday as number), detail: `${s.presentToday}/${s.totalToday}` },
              { label: 'Review Load', value: Math.min(100, (((s.pendingSubmissions as number) + (s.pendingReviews as number)) || 0) * 14), detail: `${(s.pendingSubmissions as number) + (s.pendingReviews as number)} queued` },
            ]}
          />
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <QuickLinks role="MENTOR" />
            {data.todayAttendance && data.todayAttendance.length > 0 && (
              <div className="liquid-card p-5">
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={<ClipboardCheck className="h-5 w-5 text-[var(--primary-600)]" />} label="Attendance" value={`${s.attendanceRate}%`} colorClass="si-blue" />
            <StatCard icon={<ListChecks className="h-5 w-5 text-[var(--sage-500)]" />} label="Today Tasks" value={`${s.completedTasks}/${s.todayTasks}`} colorClass="si-green" />
            <StatCard icon={<FileText className="h-5 w-5 text-[var(--gold-500)]" />} label="Submissions" value={s.totalSubmissions as number} colorClass="si-gold" />
            <StatCard icon={<Target className="h-5 w-5 text-[var(--rose-500)]" />} label="Capstone" value={(s.capstonePhase as string) || 'Not started'} colorClass="si-purple" />
          </div>

          <LearningPathMap courses={studentCourses} assignments={studentAssignments} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <PriorityQueue
              stats={s}
              assignments={studentAssignments}
              events={studentEvents}
              notifications={data.notifications || []}
            />
            <CalendarAgenda events={studentEvents} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <MentorNotes notifications={data.notifications || []} />
            <QuickLinks role="INTERN" />
          </div>
        </div>
      )}

      {/* Notifications */}
      {data.notifications && data.notifications.length > 0 && (
        <div className="liquid-card p-5">
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

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

type PriorityTone = 'primary' | 'sage' | 'gold' | 'rose';

interface PriorityItem {
  key: string;
  label: string;
  meta: string;
  tone: PriorityTone;
  icon: React.ReactNode;
  href?: string;
}

function dedupeById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function toNumber(value: unknown) {
  return typeof value === 'number' ? value : Number(value || 0);
}

function dateKey(value: string) {
  return value.split('T')[0];
}

function dateOnly(value: string) {
  const [year, month, day] = dateKey(value).split('-').map(Number);
  return new Date(year, month - 1, day);
}

function todayOnly() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getUpcomingEvents(events: CalendarEvent[], take = 4) {
  const today = todayOnly().getTime();
  return [...events]
    .filter((event) => dateOnly(event.date).getTime() >= today)
    .sort((a, b) => dateOnly(a.date).getTime() - dateOnly(b.date).getTime())
    .slice(0, take);
}

function getUpcomingAssignments(assignments: Assignment[], take = 3) {
  const now = Date.now();
  return [...assignments]
    .filter((assignment) => new Date(assignment.deadline).getTime() >= now)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, take);
}

function getActiveCourse(courses: Course[], assignments: Assignment[]) {
  const nearestAssignment = getUpcomingAssignments(assignments, 1)[0];
  const assignmentWeek = nearestAssignment?.module?.course?.weekNumber;
  return courses.find((course) => course.weekNumber === assignmentWeek) || courses[0] || null;
}

function formatRelativeDate(value: string) {
  const target = dateOnly(value);
  const diffDays = Math.round((target.getTime() - todayOnly().getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days`;
  return target.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatAssignmentDue(value: string) {
  const date = new Date(value);
  const today = todayOnly();
  const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return `Due today · ${date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
  if (diffDays === 1) return `Due tomorrow · ${date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
  return `Due ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
}

function formatTimeRange(event: CalendarEvent) {
  if (event.startTime && event.endTime) return `${event.startTime}-${event.endTime}`;
  return event.startTime || event.endTime || '';
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function statusLabel(state: 'previous' | 'active' | 'upcoming') {
  if (state === 'previous') return 'Previous';
  if (state === 'active') return 'Active';
  return 'Upcoming';
}

function buildPriorityItems(
  stats: DashboardData['stats'],
  assignments: Assignment[],
  events: CalendarEvent[],
  notifications: Notif[]
): PriorityItem[] {
  const items: PriorityItem[] = [];
  const completedTasks = toNumber(stats.completedTasks);
  const todayTasks = toNumber(stats.todayTasks);
  const remainingTasks = Math.max(0, todayTasks - completedTasks);
  const nearestAssignment = getUpcomingAssignments(assignments, 1)[0];
  const nearestEvent = getUpcomingEvents(events, 1)[0];
  const feedback = notifications.find((note) => /mentor|feedback|review|graded|resubmit/i.test(`${note.title} ${note.message} ${note.type}`));

  if (!stats.markedToday) {
    items.push({
      key: 'attendance',
      label: 'Mark attendance',
      meta: 'Due today',
      href: '/attendance',
      tone: 'primary',
      icon: <ClipboardCheck className="h-4 w-4" />,
    });
  }

  if (remainingTasks > 0) {
    items.push({
      key: 'tasks',
      label: `${remainingTasks} daily ${remainingTasks === 1 ? 'task' : 'tasks'}`,
      meta: `${completedTasks}/${todayTasks} completed`,
      href: '/tasks',
      tone: 'sage',
      icon: <ListChecks className="h-4 w-4" />,
    });
  }

  if (nearestAssignment) {
    items.push({
      key: `assignment-${nearestAssignment.id}`,
      label: nearestAssignment.title,
      meta: formatAssignmentDue(nearestAssignment.deadline),
      href: `/assignments/${nearestAssignment.id}`,
      tone: 'gold',
      icon: <FileText className="h-4 w-4" />,
    });
  }

  if (nearestEvent) {
    items.push({
      key: `event-${nearestEvent.id}`,
      label: nearestEvent.title,
      meta: `${titleCase(nearestEvent.type)} · ${formatRelativeDate(nearestEvent.date)}`,
      href: '/calendar',
      tone: nearestEvent.type === 'EXAM' ? 'rose' : 'primary',
      icon: <CalendarDays className="h-4 w-4" />,
    });
  }

  if (feedback) {
    items.push({
      key: `note-${feedback.id}`,
      label: feedback.title,
      meta: feedback.message,
      href: feedback.link || '/notifications',
      tone: 'primary',
      icon: <MessageSquare className="h-4 w-4" />,
    });
  }

  if (items.length === 0) {
    return [{
      key: 'clear',
      label: 'All clear today',
      meta: 'No urgent learning items',
      tone: 'sage',
      icon: <CheckCircle2 className="h-4 w-4" />,
    }];
  }

  return items.slice(0, 4);
}

function pathStateClass(state: 'previous' | 'active' | 'upcoming') {
  if (state === 'active') return 'border-[rgba(59,108,181,0.28)] bg-[rgba(59,108,181,0.12)] shadow-[0_16px_36px_rgba(59,108,181,0.12)]';
  if (state === 'previous') return 'border-[rgba(45,122,79,0.16)] bg-[rgba(45,122,79,0.08)]';
  return 'border-white/45 bg-white/25';
}

function priorityToneClass(tone: PriorityTone) {
  const classes = {
    primary: { icon: 'bg-[rgba(59,108,181,0.13)] text-[var(--primary-600)]' },
    sage: { icon: 'bg-[rgba(45,122,79,0.13)] text-[var(--sage-500)]' },
    gold: { icon: 'bg-[rgba(154,107,30,0.13)] text-[var(--gold-500)]' },
    rose: { icon: 'bg-[rgba(166,70,83,0.12)] text-[var(--rose-500)]' },
  };
  return classes[tone];
}

function eventToneClass(type: string) {
  if (type === 'EXAM') {
    return {
      icon: 'bg-[rgba(166,70,83,0.12)] text-[var(--rose-500)]',
      pill: 'bg-[var(--danger-50)] text-[var(--danger-500)]',
    };
  }
  if (type === 'DEADLINE') {
    return {
      icon: 'bg-[rgba(154,107,30,0.13)] text-[var(--gold-500)]',
      pill: 'bg-[var(--gold-50)] text-[var(--gold-500)]',
    };
  }
  if (type === 'SESSION') {
    return {
      icon: 'bg-[rgba(45,122,79,0.13)] text-[var(--sage-500)]',
      pill: 'bg-[var(--sage-50)] text-[var(--sage-500)]',
    };
  }
  return {
    icon: 'bg-[rgba(59,108,181,0.13)] text-[var(--primary-600)]',
    pill: 'bg-[var(--primary-50)] text-[var(--primary-600)]',
  };
}

function DashboardAnalytics({
  segments,
  bars,
}: {
  segments: { label: string; value: number; color: string }[];
  bars: { label: string; value: number; detail: string }[];
}) {
  const total = Math.max(segments.reduce((sum, item) => sum + item.value, 0), 1);
  let offset = 25;

  return (
    <div className="liquid-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--primary-500)]" />
          <h3 className="text-sm font-semibold text-[var(--slate-700)]">Analytics Snapshot</h3>
        </div>
        <span className="rounded-full bg-white/35 px-2.5 py-1 text-xs font-medium text-[var(--slate-400)]">Live</span>
      </div>
      <div className="grid gap-5 lg:grid-cols-[160px_minmax(0,1fr)]">
        <div className="flex items-center gap-4">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 42 42" aria-hidden="true">
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="6" />
            {segments.map((segment) => {
              const dash = (segment.value / total) * 100;
              const circle = (
                <circle
                  key={segment.label}
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke={segment.color}
                  strokeDasharray={`${dash} ${100 - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  strokeWidth="6"
                />
              );
              offset -= dash;
              return circle;
            })}
          </svg>
          <div className="space-y-1">
            {segments.map((segment) => (
              <div key={segment.label} className="flex items-center gap-2 text-xs text-[var(--slate-500)]">
                <span className="h-2 w-2 rounded-full" style={{ background: segment.color }} />
                <span>{segment.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {bars.map((bar) => (
            <div key={bar.label} className="liquid-control p-3">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-[var(--slate-500)]">{bar.label}</span>
                <span className="text-[var(--slate-400)]">{bar.detail}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/45">
                <div className="h-full rounded-full bg-[var(--primary-500)] transition-[width] duration-700" style={{ width: `${Math.max(0, Math.min(100, bar.value))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LearningPathMap({ courses, assignments }: { courses: Course[]; assignments: Assignment[] }) {
  const sortedCourses = [...courses].sort((a, b) => a.weekNumber - b.weekNumber || a.order - b.order);
  const activeCourse = getActiveCourse(sortedCourses, assignments);
  const activeIndex = activeCourse ? sortedCourses.findIndex((course) => course.id === activeCourse.id) : 0;
  const windowStart = Math.min(Math.max(activeIndex - 2, 0), Math.max(sortedCourses.length - 6, 0));
  const visibleCourses = sortedCourses.slice(windowStart, windowStart + 6);

  return (
    <div className="liquid-card p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-[var(--primary-500)]" />
            <h3 className="text-sm font-semibold text-[var(--slate-700)]">Learning Path</h3>
          </div>
          <p className="mt-1 text-xs text-[var(--slate-400)]">
            {activeCourse ? `Week ${activeCourse.weekNumber} · ${activeCourse.title}` : 'Curriculum path'}
          </p>
        </div>
        {activeCourse && (
          <Link
            href={`/curriculum/${activeCourse.id}`}
            className="liquid-control flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--primary-600)]"
          >
            Continue
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {visibleCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-6">
          {visibleCourses.map((course) => {
            const courseIndex = sortedCourses.findIndex((item) => item.id === course.id);
            const state = courseIndex < activeIndex ? 'previous' : courseIndex === activeIndex ? 'active' : 'upcoming';
            return (
              <Link
                key={course.id}
                href={`/curriculum/${course.id}`}
                className={`group min-h-[116px] rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 ${pathStateClass(state)}`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="rounded-full bg-white/40 px-2 py-0.5 text-[11px] font-medium text-[var(--slate-500)]">
                    Week {course.weekNumber}
                  </span>
                  {state === 'previous' && <CheckCircle2 className="h-4 w-4 text-[var(--sage-500)]" />}
                  {state === 'active' && <Target className="h-4 w-4 text-[var(--primary-600)]" />}
                  {state === 'upcoming' && <Circle className="h-4 w-4 text-[var(--slate-300)]" />}
                </div>
                <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--slate-700)]">
                  {course.title}
                </h4>
                <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-[var(--slate-400)]">
                  <span>{course.category || statusLabel(state)}</span>
                  <span>{course._count?.modules || 0} modules</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="liquid-control flex min-h-[116px] items-center justify-center px-4 text-center text-sm text-[var(--slate-400)]">
          No curriculum published yet
        </div>
      )}
    </div>
  );
}

function PriorityQueue({
  stats,
  assignments,
  events,
  notifications,
}: {
  stats: DashboardData['stats'];
  assignments: Assignment[];
  events: CalendarEvent[];
  notifications: Notif[];
}) {
  const items = buildPriorityItems(stats, assignments, events, notifications);

  return (
    <div className="liquid-card min-h-[320px] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-[var(--primary-500)]" />
          <h3 className="text-sm font-semibold text-[var(--slate-700)]">Priority Queue</h3>
        </div>
        <span className="rounded-full bg-white/35 px-2.5 py-1 text-xs font-medium text-[var(--slate-400)]">
          {items.some((item) => item.href) ? `${items.length} active` : 'Clear'}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const content = (
            <>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${priorityToneClass(item.tone).icon}`}>
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[var(--slate-700)]">{item.label}</span>
                <span className="mt-0.5 block truncate text-xs text-[var(--slate-400)]">{item.meta}</span>
              </span>
              {item.href && <ArrowRight className="h-4 w-4 shrink-0 text-[var(--slate-300)]" />}
            </>
          );

          if (!item.href) {
            return (
              <div key={item.key} className="liquid-control flex min-h-[64px] items-center gap-3 px-3">
                {content}
              </div>
            );
          }

          return (
            <Link key={item.key} href={item.href} className="liquid-control group flex min-h-[64px] items-center gap-3 px-3 transition hover:-translate-y-0.5">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function CalendarAgenda({ events }: { events: CalendarEvent[] }) {
  const upcomingEvents = getUpcomingEvents(events, 4);

  return (
    <div className="liquid-card min-h-[320px] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[var(--primary-500)]" />
          <h3 className="text-sm font-semibold text-[var(--slate-700)]">Calendar Agenda</h3>
        </div>
        <Link href="/calendar" className="text-xs font-medium text-[var(--primary-500)] hover:text-[var(--primary-600)]">
          View all
        </Link>
      </div>

      {upcomingEvents.length > 0 ? (
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <Link key={event.id} href="/calendar" className="liquid-control flex min-h-[64px] items-center gap-3 px-3 transition hover:-translate-y-0.5">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${eventToneClass(event.type).icon}`}>
                <CalendarDays className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-[var(--slate-700)]">{event.title}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${eventToneClass(event.type).pill}`}>
                    {titleCase(event.type)}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-[var(--slate-400)]">
                  {formatRelativeDate(event.date)}{event.startTime ? ` · ${formatTimeRange(event)}` : ''}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="liquid-control flex min-h-[226px] flex-col items-center justify-center px-4 text-center">
          <CalendarDays className="mb-3 h-6 w-6 text-[var(--slate-300)]" />
          <p className="text-sm font-medium text-[var(--slate-500)]">No upcoming events</p>
          <p className="mt-1 text-xs text-[var(--slate-400)]">This week is clear</p>
        </div>
      )}
    </div>
  );
}

function MentorNotes({ notifications }: { notifications: Notif[] }) {
  const notes = notifications
    .filter((note) => /mentor|feedback|review|graded|resubmit/i.test(`${note.title} ${note.message} ${note.type}`))
    .slice(0, 3);

  return (
    <div className="liquid-card min-h-[236px] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-[var(--primary-500)]" />
          <h3 className="text-sm font-semibold text-[var(--slate-700)]">Mentor Notes</h3>
        </div>
        <span className="rounded-full bg-white/35 px-2.5 py-1 text-xs font-medium text-[var(--slate-400)]">
          {notes.length}
        </span>
      </div>

      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => {
            const row = (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/35 text-[var(--primary-500)]">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[var(--slate-700)]">{note.title}</span>
                  <span className="mt-0.5 line-clamp-1 text-xs text-[var(--slate-400)]">{note.message}</span>
                </span>
              </>
            );

            return note.link ? (
              <Link key={note.id} href={note.link} className="liquid-list-row flex min-h-[58px] items-center gap-3 px-3 py-2 transition hover:-translate-y-0.5">
                {row}
              </Link>
            ) : (
              <div key={note.id} className="liquid-list-row flex min-h-[58px] items-center gap-3 px-3 py-2">
                {row}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="liquid-control flex min-h-[138px] flex-col items-center justify-center px-4 text-center">
          <MessageSquare className="mb-3 h-6 w-6 text-[var(--slate-300)]" />
          <p className="text-sm font-medium text-[var(--slate-500)]">No mentor notes right now</p>
          <p className="mt-1 text-xs text-[var(--slate-400)]">Feedback will appear here</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  colorClass,
  delayClass = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  colorClass: string;
  delayClass?: string;
}) {
  return (
    <div className={`liquid-card liquid-enter min-h-[112px] p-5 ${delayClass}`}>
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={iconStyles[colorClass]}>{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-3xl font-semibold leading-none text-[var(--slate-800)]">{value}</p>
          <p className="mt-2 text-sm leading-snug text-[var(--slate-400)]">{label}</p>
        </div>
      </div>
      <span className="stat-accent" />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="liquid-pill flex min-h-[74px] flex-col items-center justify-center px-4 py-3 text-center">
      <p className="text-xs text-[var(--slate-400)]">{label}</p>
      <p className="mt-1 text-base font-semibold leading-tight text-[var(--slate-700)]">{typeof value === 'number' ? value : value}</p>
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
    <div className="liquid-card min-h-[236px] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--slate-700)]">Quick Actions</h3>
        <span className="rounded-full bg-white/35 px-2.5 py-1 text-xs font-medium text-[var(--slate-400)]">
          {links.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="liquid-control group flex min-h-[58px] min-w-0 items-center gap-3 px-3 text-sm font-medium text-[var(--slate-500)] outline-none focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.22)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/35 text-[var(--primary-500)]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 leading-tight">{l.label}</span>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-[var(--slate-300)] transition group-hover:translate-x-0.5 group-hover:text-[var(--primary-500)]" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function RecentUsers({ users }: { users: NonNullable<DashboardData['recentUsers']> }) {
  return (
    <div className="liquid-card min-h-[236px] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--slate-700)]">Recent Users</h3>
        <span className="rounded-full bg-white/35 px-2.5 py-1 text-xs font-medium text-[var(--slate-400)]">
          {users.length}
        </span>
      </div>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="liquid-list-row flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="min-w-0 truncate font-medium text-[var(--slate-600)]">{u.name}</span>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${roleBadgeClass(u.role)}`}>
              {u.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function roleBadgeClass(role: string) {
  if (role === 'ADMIN') return 'bg-[var(--danger-50)] text-[var(--danger-500)]';
  if (role === 'MENTOR') return 'bg-[var(--primary-50)] text-[var(--primary-600)]';
  return 'bg-[var(--sage-50)] text-[var(--sage-500)]';
}
