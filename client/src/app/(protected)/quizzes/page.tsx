'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Quiz } from '@/types';
import { Brain, Plus, Clock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const typeColors: Record<string, string> = {
  MCQ: 'bg-blue-100 text-blue-700',
  CODING: 'bg-green-100 text-green-700',
  SQL: 'bg-purple-100 text-purple-700',
  CASE_STUDY: 'bg-orange-100 text-orange-700',
};

export default function QuizzesPage() {
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'MCQ' as string,
    timeLimitMinutes: 30,
    maxRetakes: 1,
    maxScore: 50,
    weekNumber: '',
  });

  useEffect(() => {
    api.get('/quizzes').then((res) => {
      setQuizzes(res.data.data);
      setLoading(false);
    });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/quizzes', {
        ...form,
        weekNumber: form.weekNumber ? Number(form.weekNumber) : undefined,
      });
      setShowForm(false);
      const res = await api.get('/quizzes');
      setQuizzes(res.data.data);
    } catch {
      // handled
    } finally {
      setCreating(false);
    }
  }

  async function togglePublish(quizId: string, current: boolean) {
    await api.put(`/quizzes/${quizId}`, { isPublished: !current });
    const res = await api.get('/quizzes');
    setQuizzes(res.data.data);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quizzes & Tests</h1>
          <p className="mt-1 text-sm text-gray-500">{quizzes.length} quizzes</p>
        </div>
        {!isIntern && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Quiz
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Quiz Title</label>
              <input
                type="text"
                placeholder="e.g. Week 1 Python Basics"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Quiz Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                <option value="MCQ">MCQ (multiple choice)</option>
                <option value="CODING">Coding</option>
                <option value="SQL">SQL</option>
                <option value="CASE_STUDY">Case Study</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Max Score (total points)</label>
              <input
                type="number"
                placeholder="50"
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Time Limit (minutes)</label>
              <input
                type="number"
                placeholder="30"
                value={form.timeLimitMinutes}
                onChange={(e) => setForm({ ...form, timeLimitMinutes: Number(e.target.value) })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Max Retakes (allowed attempts)</label>
              <input
                type="number"
                placeholder="1"
                value={form.maxRetakes}
                onChange={(e) => setForm({ ...form, maxRetakes: Number(e.target.value) })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Week Number (1-14, optional)</label>
              <input
                type="number"
                placeholder="e.g. 1"
                value={form.weekNumber}
                onChange={(e) => setForm({ ...form, weekNumber: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                min={1}
                max={14}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5">
            <Link href={`/quizzes/${quiz.id}`} className="flex flex-1 items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[quiz.type]}`}>
                    {quiz.type}
                  </span>
                  {quiz.weekNumber && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      Week {quiz.weekNumber}
                    </span>
                  )}
                  {!quiz.isPublished && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">Draft</span>
                  )}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-gray-900">{quiz.title}</h3>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                  <span>{quiz._count?.questions || 0} questions</span>
                  <span>{quiz.maxScore} pts</span>
                  {quiz.timeLimitMinutes && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" /> {quiz.timeLimitMinutes}m
                    </span>
                  )}
                  <span>{quiz._count?.attempts || 0} attempts</span>
                </div>
              </div>
            </Link>
            {!isIntern && (
              <button
                onClick={() => togglePublish(quiz.id, quiz.isPublished)}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  quiz.isPublished
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {quiz.isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {quiz.isPublished ? 'Published' : 'Publish'}
              </button>
            )}
          </div>
        ))}
        {quizzes.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">No quizzes yet</p>
        )}
      </div>
    </div>
  );
}
