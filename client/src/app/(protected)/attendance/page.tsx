'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Attendance, User, AttendanceStatus } from '@/types';
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Users } from 'lucide-react';

const statusConfig: Record<string, { color: string; dot: string; icon: typeof CheckCircle; label: string }> = {
  PRESENT: { color: 'bg-[var(--sage-50)] text-[var(--sage-500)]', dot: 'bg-[var(--sage-500)]', icon: CheckCircle, label: 'Present' },
  LATE: { color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', icon: Clock, label: 'Late' },
  INCOMPLETE: { color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', icon: AlertCircle, label: 'Incomplete' },
  ABSENT: { color: 'bg-[var(--rose-50)] text-[var(--rose-500)]', dot: 'bg-[var(--rose-500)]', icon: XCircle, label: 'Absent' },
  EXCUSED: { color: 'bg-[var(--primary-50)] text-[var(--primary-600)]', dot: 'bg-[var(--primary-400)]', icon: AlertCircle, label: 'Excused' },
};

const STATUS_OPTIONS: AttendanceStatus[] = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED', 'INCOMPLETE'];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dateFromYmd(value: string) {
  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatYmdDate(value: string, options: Intl.DateTimeFormatOptions) {
  return dateFromYmd(value).toLocaleDateString('en-IN', options);
}

interface BulkEntry {
  internId: string;
  status: AttendanceStatus;
}

export default function AttendancePage() {
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';

  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin/mentor calendar state
  const [interns, setInterns] = useState<User[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [viewMonth, setViewMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  // Bulk modal state
  const [editDay, setEditDay] = useState<string | null>(null);
  const [bulkEntries, setBulkEntries] = useState<BulkEntry[]>([]);
  const [bulkReason, setBulkReason] = useState('');
  const [saving, setSaving] = useState(false);

  const loadMonthRecords = useCallback(async () => {
    // Fetch all attendance records (backend returns all for admin/mentor)
    const { data } = await api.get('/attendance');
    setRecords(data.data);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        if (isIntern) {
          const { data } = await api.get('/attendance/me');
          setHistory(data.data);
          const t = ymd(new Date());
          setTodayRecord(data.data.find((a: Attendance) => a.date.startsWith(t)) || null);
        } else {
          const { data } = await api.get('/users');
          const list = data.data.filter((u: User) => u.role === 'INTERN');
          setInterns(list);
          await loadMonthRecords();
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [isIntern, loadMonthRecords]);

  useEffect(() => {
    if (!isIntern) {
      loadMonthRecords();
    }
  }, [viewMonth, isIntern, loadMonthRecords]);

  function recordsForDate(dateStr: string) {
    return records.filter((r) => r.date.startsWith(dateStr));
  }

  function markedCountForDate(dateStr: string) {
    return recordsForDate(dateStr).length;
  }

  function openDay(dateStr: string) {
    const existing = recordsForDate(dateStr);
    const entries: BulkEntry[] = interns.map((intern) => {
      const rec = existing.find((r) => r.internId === intern.id);
      return { internId: intern.id, status: (rec?.status || 'PRESENT') as AttendanceStatus };
    });
    setBulkEntries(entries);
    setBulkReason(existing[0]?.overrideReason || 'Marked by ' + (user?.role === 'ADMIN' ? 'admin' : 'mentor'));
    setEditDay(dateStr);
  }

  function setEntryStatus(internId: string, status: AttendanceStatus) {
    setBulkEntries((prev) =>
      prev.map((e) => (e.internId === internId ? { ...e, status } : e))
    );
  }

  function setAllStatus(status: AttendanceStatus) {
    setBulkEntries((prev) => prev.map((e) => ({ ...e, status })));
  }

  async function saveBulk() {
    if (!editDay || bulkEntries.length === 0) return;
    setSaving(true);
    try {
      await api.post('/attendance/bulk-override', {
        date: editDay,
        entries: bulkEntries.map((e) => ({ internId: e.internId, status: e.status })),
        reason: bulkReason || 'Marked',
      });
      setEditDay(null);
      await loadMonthRecords();
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
      </div>
    );
  }

  // ---------- INTERN VIEW (read-only) ----------
  if (isIntern) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-[var(--slate-800)]">Attendance</h1>

        <div className="mb-8 glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--slate-700)]">Today</h2>
          {todayRecord ? (
            <div className="flex items-center gap-3">
              {(() => {
                const cfg = statusConfig[todayRecord.status];
                const Icon = cfg.icon;
                return (
                  <>
                    <Icon className="h-6 w-6" />
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-sm text-[var(--slate-400)]">
                      Tasks: {todayRecord.tasksCompletedCount}/{todayRecord.tasksTotalCount}
                    </span>
                  </>
                );
              })()}
            </div>
          ) : (
            <p className="text-sm text-[var(--slate-400)]">
              Attendance is marked by your mentor or admin. Your status for today will appear here once marked.
            </p>
          )}
        </div>

        <div className="glass-card">
          <h2 className="border-b border-[var(--card-border)] px-6 py-4 text-lg font-semibold text-[var(--slate-700)]">History</h2>
          <div className="divide-y divide-gray-100">
            {history.map((record) => {
              const cfg = statusConfig[record.status];
              return (
                <div key={record.id} className="flex items-center justify-between px-6 py-3">
                  <span className="text-sm text-[var(--slate-600)]">
                    {formatYmdDate(record.date, { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              );
            })}
            {history.length === 0 && <p className="px-6 py-8 text-center text-sm text-[var(--slate-300)]">No records yet</p>}
          </div>
        </div>
      </div>
    );
  }

  // ---------- ADMIN / MENTOR BULK CALENDAR VIEW ----------
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = ymd(new Date());
  const monthLabel = viewMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const totalInterns = interns.length;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--slate-800)]">Attendance</h1>
        <p className="mt-1 text-sm text-[var(--slate-400)]">Click any day to mark attendance for all interns at once</p>
      </div>

      {interns.length === 0 ? (
        <p className="glass-card p-6 text-sm text-[var(--slate-400)]">No interns found. Create interns first.</p>
      ) : (
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="rounded-lg p-2 hover:bg-[var(--slate-50)]">
              <ChevronLeft className="h-5 w-5 text-[var(--slate-500)]" />
            </button>
            <h2 className="text-lg font-semibold text-[var(--slate-700)]">{monthLabel}</h2>
            <button onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="rounded-lg p-2 hover:bg-[var(--slate-50)]">
              <ChevronRight className="h-5 w-5 text-[var(--slate-500)]" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-medium text-[var(--slate-300)]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`e${idx}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const marked = markedCountForDate(dateStr);
              const isToday = dateStr === todayStr;
              const isComplete = marked > 0 && marked >= totalInterns;
              const isPartial = marked > 0 && marked < totalInterns;
              return (
                <button
                  key={dateStr}
                  onClick={() => openDay(dateStr)}
                  className={`flex h-16 flex-col items-center justify-center rounded-lg border text-sm transition hover:border-blue-400 hover:bg-[var(--primary-50)] ${isToday ? 'border-[var(--primary-400)]' : 'border-[var(--card-border)]'}`}
                >
                  <span className="font-medium text-[var(--slate-600)]">{day}</span>
                  {marked > 0 && (
                    <span className={`mt-1 text-[10px] font-medium ${isComplete ? 'text-[var(--sage-500)]' : 'text-orange-500'}`}>
                      {marked}/{totalInterns}
                    </span>
                  )}
                  {marked === 0 && (
                    <span className="mt-1 h-2 w-2 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--slate-400)]">
            {Object.entries(statusConfig).map(([k, c]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} /> {c.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- BULK ATTENDANCE MODAL ---------- */}
      {editDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(30,42,58,0.38)] p-4 backdrop-blur-md">
          <div className="liquid-card flex w-full max-w-2xl flex-col shadow-2xl" style={{ maxHeight: '90vh' }}>
            <div className="border-b border-[var(--card-border)] p-6 pb-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[var(--primary-500)]" />
                <h2 className="text-lg font-bold text-[var(--slate-800)]">Bulk Attendance</h2>
              </div>
              <p className="mt-1 text-sm text-[var(--slate-400)]">
                {formatYmdDate(editDay, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setAllStatus(s)}
                    className="liquid-control px-3 py-1.5 text-xs font-medium text-[var(--slate-600)] outline-none hover:bg-[var(--slate-50)] focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.16)]"
                  >
                    All {statusConfig[s].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-3">
              <div className="space-y-2">
                {interns.map((intern) => {
                  const entry = bulkEntries.find((e) => e.internId === intern.id);
                  const existingRec = recordsForDate(editDay).find((r) => r.internId === intern.id);
                  const cfg = entry ? statusConfig[entry.status] : null;
                  return (
                    <div
                      key={intern.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[var(--card-border)] px-4 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--slate-700)]">{intern.name}</p>
                        <p className="truncate text-xs text-[var(--slate-400)]">{intern.email}</p>
                        {existingRec && (
                          <p className="text-[10px] text-[var(--slate-300)]">
                            Current: {statusConfig[existingRec.status].label}
                          </p>
                        )}
                      </div>
                      <select
                        value={entry?.status || 'PRESENT'}
                        onChange={(e) => setEntryStatus(intern.id, e.target.value as AttendanceStatus)}
                        className="glass-input w-36 px-3 py-1.5 text-sm text-[var(--slate-700)] outline-none transition focus:border-[rgba(59,108,181,0.32)] focus:ring-2 focus:ring-[rgba(59,108,181,0.14)]"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{statusConfig[s].label}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-[var(--card-border)] p-6 pt-4">
              <label className="mb-1 block text-sm font-medium text-[var(--slate-600)]">Reason / Note</label>
              <input
                type="text"
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                className="glass-input mb-4 w-full px-4 py-2.5 text-sm text-[var(--slate-700)] outline-none transition placeholder:text-[var(--slate-300)] focus:border-[rgba(59,108,181,0.32)] focus:ring-2 focus:ring-[rgba(59,108,181,0.14)]"
                placeholder="Reason for attendance update"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditDay(null)}
                  className="liquid-control px-4 py-2 text-sm font-medium text-[var(--slate-600)] outline-none focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.16)]"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBulk}
                  disabled={saving || !bulkReason.trim()}
                  className="rounded-[14px] bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[rgba(59,108,181,0.18)] outline-none transition hover:bg-[var(--primary-600)] focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.28)] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : `Save All (${bulkEntries.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
