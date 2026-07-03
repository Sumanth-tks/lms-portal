'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Attendance, CalendarEvent } from '@/types';
import { CalendarPlus, ChevronLeft, ChevronRight, X } from 'lucide-react';

const statusColors: Record<string, string> = {
  PRESENT: 'bg-green-400',
  LATE: 'bg-yellow-400',
  INCOMPLETE: 'bg-orange-400',
  ABSENT: 'bg-red-400',
  EXCUSED: 'bg-blue-400',
};

const eventStyles: Record<string, string> = {
  EXAM: 'border-[rgba(59,108,181,0.18)] bg-[rgba(59,108,181,0.12)] text-[var(--primary-600)]',
  DEADLINE: 'border-[rgba(154,107,30,0.18)] bg-[rgba(154,107,30,0.12)] text-[var(--gold-600)]',
  SESSION: 'border-[rgba(45,122,79,0.18)] bg-[rgba(45,122,79,0.12)] text-[var(--sage-600)]',
  GENERAL: 'border-white/45 bg-white/35 text-[var(--slate-500)]',
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dateKey(value: string) {
  return value.split('T')[0];
}

export default function CalendarPage() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: ymd(new Date()),
    startTime: '',
    endTime: '',
    type: 'EXAM',
    description: '',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const canManageEvents = user?.role === 'ADMIN' || user?.role === 'MENTOR';

  useEffect(() => {
    loadCalendarData();
  }, [year, month, user?.role]);

  async function loadCalendarData() {
    setLoading(true);
    try {
      const attendanceEndpoint =
        user?.role === 'INTERN'
          ? `/attendance/me?month=${month + 1}&year=${year}`
          : '/attendance?date=';
      const [attendanceRes, eventRes] = await Promise.all([
        api.get(attendanceEndpoint),
        api.get(`/calendar-events?month=${month + 1}&year=${year}`),
      ]);
      setAttendance(attendanceRes.data.data);
      setEvents(eventRes.data.data);
    } finally {
      setLoading(false);
    }
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function openEventForm(date: string) {
    if (!canManageEvents) return;
    setEventForm({
      title: '',
      date,
      startTime: '',
      endTime: '',
      type: 'EXAM',
      description: '',
    });
    setShowEventForm(true);
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setSavingEvent(true);
    try {
      await api.post('/calendar-events', {
        ...eventForm,
        startTime: eventForm.startTime || undefined,
        endTime: eventForm.endTime || undefined,
        description: eventForm.description || undefined,
      });
      setShowEventForm(false);
      await loadCalendarData();
    } finally {
      setSavingEvent(false);
    }
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const attendanceMap = new Map<string, Attendance>();
  attendance.forEach((a) => {
    attendanceMap.set(dateKey(a.date), a);
  });

  const eventsMap = new Map<string, CalendarEvent[]>();
  events.forEach((event) => {
    const key = dateKey(event.date);
    eventsMap.set(key, [...(eventsMap.get(key) || []), event]);
  });

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--slate-800)]">Calendar</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">Attendance and shared learning events</p>
        </div>
        {canManageEvents && (
          <button
            type="button"
            onClick={() => openEventForm(ymd(new Date()))}
            className="liquid-control flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--primary-600)] outline-none focus-visible:ring-2 focus-visible:ring-[rgba(59,108,181,0.18)]"
          >
            <CalendarPlus className="h-4 w-4" />
            Add Event
          </button>
        )}
      </div>

      <div className="glass-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <button type="button" onClick={prevMonth} className="rounded-lg p-2 hover:bg-[var(--slate-50)]">
            <ChevronLeft className="h-5 w-5 text-[var(--slate-500)]" />
          </button>
          <h2 className="text-lg font-semibold text-[var(--slate-800)]">{monthName}</h2>
          <button type="button" onClick={nextMonth} className="rounded-lg p-2 hover:bg-[var(--slate-50)]">
            <ChevronRight className="h-5 w-5 text-[var(--slate-500)]" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2 text-center text-xs font-medium uppercase text-[var(--slate-300)]">
              {day}
            </div>
          ))}

          {days.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="h-28" />;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = attendanceMap.get(dateStr);
            const dayEvents = eventsMap.get(dateStr) || [];
            const isToday = dateStr === ymd(new Date());
            const dayOfWeek = new Date(year, month, day).getDay();
            const isSunday = dayOfWeek === 0;

            return (
              <button
                type="button"
                key={dateStr}
                disabled={!canManageEvents}
                onClick={() => openEventForm(dateStr)}
                className={`relative flex h-28 flex-col rounded-lg border p-2 text-left transition ${
                  isToday ? 'border-blue-400 bg-[var(--primary-50)]' : 'border-[var(--slate-100)]'
                } ${isSunday ? 'bg-[var(--slate-50)]' : ''} ${canManageEvents ? 'hover:border-[var(--primary-300)] hover:bg-white/35' : 'cursor-default'}`}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <span className={`text-xs font-medium ${isToday ? 'text-[var(--primary-400)]' : 'text-[var(--slate-600)]'}`}>
                    {day}
                  </span>
                  {record && <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${statusColors[record.status]}`} title={record.status} />}
                </div>
                <div className="min-h-0 flex-1 space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`truncate rounded-md border px-1.5 py-1 text-[10px] font-medium ${eventStyles[event.type] || eventStyles.GENERAL}`}
                      title={`${event.title}${event.startTime ? ` at ${event.startTime}` : ''}`}
                    >
                      {event.startTime && <span className="mr-1 opacity-70">{event.startTime}</span>}
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="rounded-md bg-white/30 px-1.5 py-0.5 text-[10px] text-[var(--slate-400)]">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                  {record && (
                    <p className="pt-0.5 text-[10px] text-[var(--slate-400)]">
                      Tasks {record.tasksCompletedCount}/{record.tasksTotalCount}
                    </p>
                  )}
                </div>
                {isSunday && <span className="absolute bottom-1 right-1 text-[9px] text-[var(--slate-300)]">Off</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
              <span className="text-xs text-[var(--slate-400)]">{status.charAt(0) + status.slice(1).toLowerCase()}</span>
            </div>
          ))}
          <span className="h-4 w-px bg-[var(--slate-100)]" />
          {['EXAM', 'DEADLINE', 'SESSION'].map((type) => (
            <span key={type} className={`rounded-full border px-2 py-0.5 text-xs ${eventStyles[type]}`}>
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </span>
          ))}
        </div>
      </div>

      {showEventForm && canManageEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(30,42,58,0.38)] p-4 backdrop-blur-md">
          <form onSubmit={createEvent} className="liquid-card w-full max-w-lg p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--slate-800)]">Add Calendar Event</h2>
                <p className="text-sm text-[var(--slate-400)]">Visible to everyone</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEventForm(false)}
                className="liquid-control flex h-9 w-9 items-center justify-center text-[var(--slate-500)]"
                aria-label="Close event form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-[var(--slate-600)]">Title</span>
                <input
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="glass-input w-full px-4 py-2.5 text-sm text-[var(--slate-700)] outline-none focus:ring-2 focus:ring-[rgba(59,108,181,0.14)]"
                  placeholder="Exam, demo, review, or session"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium text-[var(--slate-600)]">Date</span>
                <input
                  required
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="glass-input w-full px-4 py-2.5 text-sm text-[var(--slate-700)] outline-none focus:ring-2 focus:ring-[rgba(59,108,181,0.14)]"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium text-[var(--slate-600)]">Type</span>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                  className="glass-input w-full px-4 py-2.5 text-sm text-[var(--slate-700)] outline-none focus:ring-2 focus:ring-[rgba(59,108,181,0.14)]"
                >
                  <option value="EXAM">Exam</option>
                  <option value="DEADLINE">Deadline</option>
                  <option value="SESSION">Session</option>
                  <option value="GENERAL">General</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium text-[var(--slate-600)]">Start Time</span>
                <input
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                  className="glass-input w-full px-4 py-2.5 text-sm text-[var(--slate-700)] outline-none focus:ring-2 focus:ring-[rgba(59,108,181,0.14)]"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium text-[var(--slate-600)]">End Time</span>
                <input
                  type="time"
                  value={eventForm.endTime}
                  onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                  className="glass-input w-full px-4 py-2.5 text-sm text-[var(--slate-700)] outline-none focus:ring-2 focus:ring-[rgba(59,108,181,0.14)]"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-[var(--slate-600)]">Description</span>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="glass-input w-full px-4 py-2.5 text-sm text-[var(--slate-700)] outline-none focus:ring-2 focus:ring-[rgba(59,108,181,0.14)]"
                  rows={3}
                  placeholder="Optional details"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowEventForm(false)} className="liquid-control px-4 py-2 text-sm font-medium text-[var(--slate-600)]">Cancel</button>
              <button
                type="submit"
                disabled={savingEvent}
                className="rounded-[14px] bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[rgba(59,108,181,0.18)] outline-none transition hover:bg-[var(--primary-600)] disabled:opacity-50"
              >
                {savingEvent ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
        </div>
      )}
    </div>
  );
}
