'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { DailyStandup } from '@/types';
import { MessageSquare, Calendar, AlertTriangle } from 'lucide-react';

/* ── Types for week summary ── */
interface WeekDay {
  date: string;
  submitted: { id: string; name: string }[];
  missed: { id: string; name: string }[];
}

/* ── Helper: format YYYY-MM-DD from a Date ── */
function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

/* ════════════════════════════════════════════════════════
   Admin / Mentor View
   ════════════════════════════════════════════════════════ */
function AdminStandupView() {
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [standups, setStandups] = useState<DailyStandup[]>([]);
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekLoading, setWeekLoading] = useState(true);

  const todayStr = toDateStr(new Date());

  const loadStandups = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/standups/by-date?date=${date}`);
      setStandups(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWeekSummary = useCallback(async (date: string) => {
    setWeekLoading(true);
    try {
      const { data } = await api.get(`/standups/week-summary?date=${date}`);
      setWeekDays(data.data.days);
    } finally {
      setWeekLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStandups(selectedDate);
    loadWeekSummary(selectedDate);
  }, [selectedDate, loadStandups, loadWeekSummary]);

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedDate(e.target.value);
  }

  function handlePillClick(date: string) {
    setSelectedDate(date);
  }

  /* Determine pill color */
  function pillColor(day: WeekDay): string {
    if (day.date > todayStr) return 'bg-[var(--slate-100)] text-[var(--slate-400)]'; // future
    const total = day.submitted.length + day.missed.length;
    if (total === 0) return 'bg-[var(--slate-100)] text-[var(--slate-400)]';
    if (day.missed.length === 0) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (day.submitted.length === 0) return 'bg-red-100 text-red-700 border-red-300';
    return 'bg-amber-100 text-amber-700 border-amber-300';
  }

  /* Selected date's missed interns from weekDays */
  const currentDaySummary = weekDays.find((d) => d.date === selectedDate);
  const missedInterns = currentDaySummary?.missed ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[var(--slate-800)]">Standups</h1>

      {/* Date picker */}
      <div className="mb-4 flex items-center gap-3">
        <Calendar className="h-5 w-5 text-[var(--primary-400)]" />
        <input
          type="date"
          value={selectedDate}
          max={todayStr}
          onChange={handleDateChange}
          className="liquid-control rounded-lg border border-[var(--slate-200)] px-3 py-2 text-sm glass-input"
        />
        <span className="text-sm text-[var(--slate-400)]">
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Week bar */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {weekLoading ? (
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-16 w-16 animate-pulse rounded-xl bg-[var(--slate-100)]" />
            ))}
          </div>
        ) : (
          weekDays.map((day) => {
            const d = new Date(day.date + 'T00:00:00');
            const isSelected = day.date === selectedDate;
            return (
              <button
                key={day.date}
                onClick={() => handlePillClick(day.date)}
                className={`liquid-pill flex flex-col items-center rounded-xl border px-3 py-2 text-xs font-medium transition-all ${pillColor(day)} ${
                  isSelected ? 'ring-2 ring-[var(--primary-400)] ring-offset-1' : ''
                } ${day.date > todayStr ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}`}
                disabled={day.date > todayStr}
              >
                <span className="text-[10px] font-semibold uppercase">
                  {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                </span>
                <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
                <span className="text-[10px]">
                  {day.date > todayStr
                    ? '--'
                    : `${day.submitted.length}/${day.submitted.length + day.missed.length}`}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Standup cards */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {standups.map((standup) => (
              <div key={standup.id} className="glass-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[var(--primary-400)]" />
                    {standup.intern && (
                      <span className="text-sm font-semibold text-[var(--slate-800)]">{standup.intern.name}</span>
                    )}
                    <span className="text-xs text-[var(--slate-300)]">
                      {new Date(standup.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-[var(--slate-300)]">Yesterday</p>
                    <p className="mt-1 text-sm text-[var(--slate-600)]">{standup.yesterday}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-[var(--slate-300)]">Today</p>
                    <p className="mt-1 text-sm text-[var(--slate-600)]">{standup.today}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-[var(--slate-300)]">Blockers</p>
                    <p className="mt-1 text-sm text-[var(--slate-600)]">{standup.blockers || 'None'}</p>
                  </div>
                </div>
              </div>
            ))}
            {standups.length === 0 && (
              <p className="py-8 text-center text-sm text-[var(--slate-300)]">No standups for this date</p>
            )}
          </div>

          {/* Missing standups section */}
          {missedInterns.length > 0 && selectedDate <= todayStr && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--danger-500)]" />
                <span className="text-sm font-semibold text-[var(--danger-500)]">
                  Not submitted ({missedInterns.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {missedInterns.map((intern) => (
                  <span
                    key={intern.id}
                    className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-medium text-[var(--danger-500)]"
                  >
                    {intern.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   Intern View (unchanged)
   ════════════════════════════════════════════════════════ */
function InternStandupView() {
  const [standups, setStandups] = useState<DailyStandup[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ yesterday: '', today: '', blockers: '' });

  const todayStr = toDateStr(new Date());
  const hasSubmittedToday = standups.some((s) => s.date.startsWith(todayStr));

  useEffect(() => {
    loadStandups();
  }, []);

  async function loadStandups() {
    try {
      const { data } = await api.get('/standups/me');
      setStandups(data.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/standups', form);
      setForm({ yesterday: '', today: '', blockers: '' });
      await loadStandups();
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[var(--slate-800)]">Daily Standup</h1>

      {!hasSubmittedToday && (
        <form onSubmit={handleSubmit} className="mb-8 glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--slate-700)]">Submit Standup</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--slate-600)]">What did you do yesterday?</label>
              <textarea
                value={form.yesterday}
                onChange={(e) => setForm({ ...form, yesterday: e.target.value })}
                className="w-full rounded-lg border border-[var(--slate-200)] px-4 py-2.5 text-sm outline-none glass-input:focus/20"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--slate-600)]">What will you do today?</label>
              <textarea
                value={form.today}
                onChange={(e) => setForm({ ...form, today: e.target.value })}
                className="w-full rounded-lg border border-[var(--slate-200)] px-4 py-2.5 text-sm outline-none glass-input:focus/20"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--slate-600)]">Any blockers?</label>
              <textarea
                value={form.blockers}
                onChange={(e) => setForm({ ...form, blockers: e.target.value })}
                className="w-full rounded-lg border border-[var(--slate-200)] px-4 py-2.5 text-sm outline-none glass-input:focus/20"
                rows={2}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-lg bg-[var(--primary-400)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Standup'}
          </button>
        </form>
      )}

      {hasSubmittedToday && (
        <div className="mb-8 rounded-xl border border-green-200 bg-[var(--sage-50)] p-4">
          <p className="text-sm font-medium text-[var(--sage-500)]">Standup submitted for today</p>
        </div>
      )}

      <div className="space-y-4">
        {standups.map((standup) => (
          <div key={standup.id} className="glass-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[var(--primary-400)]" />
                {standup.intern && (
                  <span className="text-sm font-semibold text-[var(--slate-800)]">{standup.intern.name}</span>
                )}
                <span className="text-xs text-[var(--slate-300)]">
                  {new Date(standup.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-[var(--slate-300)]">Yesterday</p>
                <p className="mt-1 text-sm text-[var(--slate-600)]">{standup.yesterday}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[var(--slate-300)]">Today</p>
                <p className="mt-1 text-sm text-[var(--slate-600)]">{standup.today}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[var(--slate-300)]">Blockers</p>
                <p className="mt-1 text-sm text-[var(--slate-600)]">{standup.blockers || 'None'}</p>
              </div>
            </div>
          </div>
        ))}
        {standups.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--slate-300)]">No standups yet</p>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   Page – routes to correct view by role
   ════════════════════════════════════════════════════════ */
export default function StandupsPage() {
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';

  return isIntern ? <InternStandupView /> : <AdminStandupView />;
}
