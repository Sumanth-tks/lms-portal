'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Attendance, User } from '@/types';
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const statusConfig: Record<string, { color: string; dot: string; icon: typeof CheckCircle; label: string }> = {
  PRESENT: { color: 'bg-[var(--sage-50)] text-[var(--sage-500)]', dot: 'bg-[var(--sage-500)]', icon: CheckCircle, label: 'Present' },
  LATE: { color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', icon: Clock, label: 'Late' },
  INCOMPLETE: { color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', icon: AlertCircle, label: 'Incomplete' },
  ABSENT: { color: 'bg-[var(--rose-50)] text-[var(--rose-500)]', dot: 'bg-[var(--rose-500)]', icon: XCircle, label: 'Absent' },
  EXCUSED: { color: 'bg-[var(--primary-50)] text-[var(--primary-600)]', dot: 'bg-[var(--primary-400)]', icon: AlertCircle, label: 'Excused' },
};

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

export default function AttendancePage() {
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';

  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin/mentor calendar state
  const [interns, setInterns] = useState<User[]>([]);
  const [selectedIntern, setSelectedIntern] = useState('');
  const [records, setRecords] = useState<Attendance[]>([]);
  const [viewMonth, setViewMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [editDay, setEditDay] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: 'PRESENT', reason: '' });
  const [saving, setSaving] = useState(false);

  const loadInternMonth = useCallback(async (internId: string) => {
    if (!internId) { setRecords([]); return; }
    const { data } = await api.get(`/attendance?internId=${internId}`);
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
          if (list.length > 0) {
            setSelectedIntern(list[0].id);
            await loadInternMonth(list[0].id);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [isIntern, loadInternMonth]);

  async function selectIntern(id: string) {
    setSelectedIntern(id);
    setEditDay(null);
    await loadInternMonth(id);
  }

  function recordFor(dateStr: string) {
    return records.find((r) => r.date.startsWith(dateStr));
  }

  function openDay(dateStr: string) {
    const existing = recordFor(dateStr);
    setEditDay(dateStr);
    setEditForm({ status: existing?.status || 'PRESENT', reason: existing?.overrideReason || 'Marked by ' + (user?.role === 'ADMIN' ? 'admin' : 'mentor') });
  }

  async function saveDay() {
    if (!editDay || !selectedIntern) return;
    setSaving(true);
    try {
      await api.post('/attendance/override', {
        internId: selectedIntern,
        date: editDay,
        status: editForm.status,
        reason: editForm.reason || 'Marked',
      });
      setEditDay(null);
      await loadInternMonth(selectedIntern);
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

  // ---------- ADMIN / MENTOR CALENDAR VIEW ----------
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = ymd(new Date());
  const monthLabel = viewMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--slate-800)]">Attendance</h1>
        <p className="mt-1 text-sm text-[var(--slate-400)]">Click any day to mark or update attendance</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-[var(--slate-600)]">Intern:</label>
        <select
          value={selectedIntern}
          onChange={(e) => selectIntern(e.target.value)}
          className="glass-input min-w-[min(100%,30rem)] px-4 py-2 text-sm text-[var(--slate-700)] outline-none transition focus:border-[rgba(59,108,181,0.32)] focus:ring-2 focus:ring-[rgba(59,108,181,0.14)]"
        >
          {interns.map((i) => (
            <option key={i.id} value={i.id}>{i.name} ({i.email})</option>
          ))}
        </select>
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
              const rec = recordFor(dateStr);
              const cfg = rec ? statusConfig[rec.status] : null;
              const isToday = dateStr === todayStr;
              return (
                <button
                  key={dateStr}
                  onClick={() => openDay(dateStr)}
                  className={`flex h-16 flex-col items-center justify-center rounded-lg border text-sm transition hover:border-blue-400 hover:bg-[var(--primary-50)] ${isToday ? 'border-[var(--primary-400)]' : 'border-[var(--card-border)]'}`}
                >
                  <span className="font-medium text-[var(--slate-600)]">{day}</span>
                  {cfg && <span className={`mt-1 h-2 w-2 rounded-full ${cfg.dot}`} title={cfg.label} />}
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

      {editDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(30,42,58,0.38)] p-4 backdrop-blur-md">
          <div className="liquid-card w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--slate-800)]">Mark Attendance</h2>
            <p className="mb-4 text-sm text-[var(--slate-400)]">
              {formatYmdDate(editDay, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <label className="mb-1 block text-sm font-medium text-[var(--slate-600)]">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="glass-input mb-4 w-full px-4 py-2.5 text-sm text-[var(--slate-700)] outline-none transition focus:border-[rgba(59,108,181,0.32)] focus:ring-2 focus:ring-[rgba(59,108,181,0.14)]"
            >
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="EXCUSED">Excused</option>
              <option value="ABSENT">Absent</option>
              <option value="INCOMPLETE">Incomplete</option>
            </select>
            <label className="mb-1 block text-sm font-medium text-[var(--slate-600)]">Reason / Note</label>
            <input
              type="text"
              value={editForm.reason}
              onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
              className="glass-input mb-5 w-full px-4 py-2.5 text-sm text-[var(--slate-700)] outline-none transition placeholder:text-[var(--slate-300)] focus:border-[rgba(59,108,181,0.32)] focus:ring-2 focus:ring-[rgba(59,108,181,0.14)]"
              placeholder="Reason"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditDay(null)} className="liquid-control px-4 py-2 text-sm font-medium text-[var(--slate-600)] outline-none focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.16)]">Cancel</button>
              <button onClick={saveDay} disabled={saving} className="rounded-[14px] bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[rgba(59,108,181,0.18)] outline-none transition hover:bg-[var(--primary-600)] focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.28)] disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
