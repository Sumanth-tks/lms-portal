'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Hackathon } from '@/types';
import { Trophy, Plus, Clock, Users, User } from 'lucide-react';
import Link from 'next/link';

export default function HackathonsPage() {
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', dayNumber: 30, startTime: '', endTime: '', maxScore: 100, isTeam: false,
  });

  useEffect(() => {
    api.get('/hackathons').then((res) => { setHackathons(res.data.data); setLoading(false); });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/hackathons', form);
    setShowForm(false);
    const res = await api.get('/hackathons');
    setHackathons(res.data.data);
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--slate-800)]">Hackathons</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">{hackathons.length} events</p>
        </div>
        {!isIntern && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-[var(--primary-400)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]">
            <Plus className="h-4 w-4" /> Create Hackathon
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 glass-card p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--slate-600)]">Title</label>
              <input type="text" placeholder="e.g. Data Viz Challenge" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--slate-600)]">Day Number (program day)</label>
              <input type="number" placeholder="30" value={form.dayNumber} onChange={(e) => setForm({ ...form, dayNumber: Number(e.target.value) })} className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--slate-600)]">Max Score (total points)</label>
              <input type="number" placeholder="100" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })} className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--slate-600)]">Start (date &amp; time)</label>
              <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--slate-600)]">End (date &amp; time)</label>
              <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--slate-600)]">Event Format</label>
              <label className="flex items-center gap-2 py-2 text-sm text-[var(--slate-500)]">
                <input type="checkbox" checked={form.isTeam} onChange={(e) => setForm({ ...form, isTeam: e.target.checked })} />
                Team event (interns work in groups)
              </label>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--slate-600)]">Description (instructions)</label>
            <textarea placeholder="Describe the hackathon..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" rows={2} />
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-[var(--primary-400)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]">Create</button>
        </form>
      )}

      <div className="space-y-3">
        {hackathons.map((h) => {
          const now = new Date();
          const start = new Date(h.startTime);
          const end = new Date(h.endTime);
          const status = now < start ? 'upcoming' : now > end ? 'ended' : 'live';
          const statusColor = status === 'live' ? 'bg-[var(--sage-50)] text-[var(--sage-500)]' : status === 'upcoming' ? 'bg-[var(--primary-50)] text-[var(--primary-600)]' : 'bg-[var(--slate-50)] text-[var(--slate-500)]';

          return (
            <Link key={h.id} href={`/hackathons/${h.id}`} className="flex items-center justify-between glass-card p-5 hover:border-[var(--primary-100)]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gold-50)]">
                  <Trophy className="h-6 w-6 text-[var(--gold-500)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>{status}</span>
                    <span className="rounded-full bg-[var(--slate-50)] px-2 py-0.5 text-xs text-[var(--slate-400)]">Day {h.dayNumber}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-[var(--slate-800)]">{h.title}</h3>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-[var(--slate-300)]">
                    <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {start.toLocaleDateString('en-IN')}</span>
                    <span>{h.maxScore} pts</span>
                    <span className="flex items-center gap-0.5">{h.isTeam ? <Users className="h-3 w-3" /> : <User className="h-3 w-3" />} {h.isTeam ? 'Team' : 'Individual'}</span>
                    <span>{h._count?.submissions || 0} submissions</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        {hackathons.length === 0 && <p className="py-8 text-center text-sm text-[var(--slate-300)]">No hackathons yet</p>}
      </div>
    </div>
  );
}
