'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Attendance, User } from '@/types';
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const statusConfig: Record<string, { color: string; dot: string; icon: typeof CheckCircle; label: string }> = {
  PRESENT: { color: 'bg-green-100 text-green-700', dot: 'bg-green-500', icon: CheckCircle, label: 'Present' },
  LATE: { color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', icon: Clock, label: 'Late' },
  INCOMPLETE: { color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', icon: AlertCircle, label: 'Incomplete' },
  ABSENT: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500', icon: XCircle, label: 'Absent' },
  EXCUSED: { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', icon: AlertCircle, label: 'Excused' },
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // ---------- INTERN VIEW (read-only) ----------
  if (isIntern) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Attendance</h1>

        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Today</h2>
          {todayRecord ? (
            <div className="flex items-center gap-3">
              {(() => {
                const cfg = statusConfig[todayRecord.status];
                const Icon = cfg.icon;
                return (
                  <>
                    <Icon className="h-6 w-6" />
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-sm text-gray-500">
                      Tasks: {todayRecord.tasksCompletedCount}/{todayRecord.tasksTotalCount}
                    </span>
                  </>
                );
              })()}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Attendance is marked by your mentor or admin. Your status for today will appear here once marked.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <h2 className="border-b border-gray-200 px-6 py-4 text-lg font-semibold text-gray-800">History</h2>
          <div className="divide-y divide-gray-100">
            {history.map((record) => {
              const cfg = statusConfig[record.status];
              return (
                <div key={record.id} className="flex items-center justify-between px-6 py-3">
                  <span className="text-sm text-gray-700">
                    {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              );
            })}
            {history.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No records yet</p>}
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
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">Click any day to mark or update attendance</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Intern:</label>
        <select
          value={selectedIntern}
          onChange={(e) => selectIntern(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          {interns.map((i) => (
            <option key={i.id} value={i.id}>{i.name} ({i.email})</option>
          ))}
        </select>
      </div>

      {interns.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">No interns found. Create interns first.</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="rounded-lg p-2 hover:bg-gray-100">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">{monthLabel}</h2>
            <button onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="rounded-lg p-2 hover:bg-gray-100">
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-400">
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
                  className={`flex h-16 flex-col items-center justify-center rounded-lg border text-sm transition hover:border-blue-400 hover:bg-blue-50 ${isToday ? 'border-blue-500' : 'border-gray-200'}`}
                >
                  <span className="font-medium text-gray-700">{day}</span>
                  {cfg && <span className={`mt-1 h-2 w-2 rounded-full ${cfg.dot}`} title={cfg.label} />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
            {Object.entries(statusConfig).map(([k, c]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} /> {c.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {editDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Mark Attendance</h2>
            <p className="mb-4 text-sm text-gray-500">
              {new Date(editDay).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            >
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="EXCUSED">Excused</option>
              <option value="ABSENT">Absent</option>
              <option value="INCOMPLETE">Incomplete</option>
            </select>
            <label className="mb-1 block text-sm font-medium text-gray-700">Reason / Note</label>
            <input
              type="text"
              value={editForm.reason}
              onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              placeholder="Reason"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditDay(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={saveDay} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}