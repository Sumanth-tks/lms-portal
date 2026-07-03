'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ChevronLeft } from 'lucide-react';

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', category: '', weekNumber: 1 });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/courses', {
        title: form.title,
        description: form.description || undefined,
        category: form.category || undefined,
        weekNumber: Number(form.weekNumber),
      });
      router.push('/curriculum');
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/curriculum" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--slate-400)] hover:text-[var(--slate-600)]">
        <ChevronLeft className="h-4 w-4" /> Back to Curriculum
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-[var(--slate-800)]">Add Course</h1>
      <form onSubmit={handleSubmit} className="glass-card p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--slate-600)]">Course Title</label>
            <input type="text" placeholder="e.g. Python for Data Science" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--slate-600)]">Week Number (1-14)</label>
            <input type="number" min={1} max={14} value={form.weekNumber} onChange={(e) => setForm({ ...form, weekNumber: Number(e.target.value) })} className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--slate-600)]">Category (optional)</label>
            <input type="text" placeholder="e.g. Foundations" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--slate-600)]">Description (optional)</label>
            <textarea placeholder="What this course covers..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" rows={3} />
          </div>
        </div>
        <button type="submit" disabled={saving} className="mt-4 rounded-lg bg-[var(--primary-400)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-50">
          {saving ? 'Creating...' : 'Create Course'}
        </button>
      </form>
    </div>
  );
}
