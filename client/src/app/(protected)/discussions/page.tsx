'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { DiscussionThread, DiscussionReply, Module } from '@/types';
import {
  MessageSquareText, Plus, Pin, CheckCircle2, ThumbsUp,
  Send, Trash2, ArrowLeft, Filter,
} from 'lucide-react';

export default function DiscussionsPage() {
  const { user } = useAuthStore();
  const isModerator = user?.role === 'ADMIN' || user?.role === 'MENTOR';

  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('');
  const [activeThread, setActiveThread] = useState<DiscussionThread | null>(null);

  // New thread form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ moduleId: '', title: '', body: '' });

  // Reply
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchThreads = useCallback(async (moduleId?: string) => {
    const params = moduleId ? `?moduleId=${moduleId}` : '';
    const res = await api.get(`/discussions${params}`);
    setThreads(res.data.data);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/modules'),
      fetchThreads(),
    ]).then(([modRes]) => {
      setModules(modRes.data.data);
      setLoading(false);
    });
  }, [fetchThreads]);

  async function handleModuleFilter(moduleId: string) {
    setSelectedModule(moduleId);
    await fetchThreads(moduleId || undefined);
  }

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await api.post('/discussions', form);
    setShowForm(false);
    setForm({ moduleId: '', title: '', body: '' });
    await fetchThreads(selectedModule || undefined);
    setSubmitting(false);
  }

  async function openThread(id: string) {
    const res = await api.get(`/discussions/${id}`);
    setActiveThread(res.data.data);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeThread || !replyBody.trim()) return;
    setSubmitting(true);
    await api.post(`/discussions/${activeThread.id}/replies`, { body: replyBody });
    setReplyBody('');
    await openThread(activeThread.id);
    setSubmitting(false);
  }

  async function handleThreadUpvote(threadId: string) {
    await api.post(`/discussions/${threadId}/upvote`);
    if (activeThread?.id === threadId) {
      await openThread(threadId);
    }
    await fetchThreads(selectedModule || undefined);
  }

  async function handleReplyUpvote(threadId: string, replyId: string) {
    await api.post(`/discussions/${threadId}/replies/${replyId}/upvote`);
    if (activeThread) await openThread(activeThread.id);
  }

  async function handlePin(threadId: string) {
    await api.patch(`/discussions/${threadId}/pin`);
    if (activeThread?.id === threadId) await openThread(threadId);
    await fetchThreads(selectedModule || undefined);
  }

  async function handleResolve(threadId: string) {
    await api.patch(`/discussions/${threadId}/resolve`);
    if (activeThread?.id === threadId) await openThread(threadId);
    await fetchThreads(selectedModule || undefined);
  }

  async function handleDeleteThread(threadId: string) {
    await api.delete(`/discussions/${threadId}`);
    setActiveThread(null);
    await fetchThreads(selectedModule || undefined);
  }

  async function handleDeleteReply(threadId: string, replyId: string) {
    await api.delete(`/discussions/${threadId}/replies/${replyId}`);
    await openThread(threadId);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
      </div>
    );
  }

  // ─── Thread detail view ─────────────────────────────

  if (activeThread) {
    return (
      <div>
        <button
          onClick={() => setActiveThread(null)}
          className="mb-4 flex items-center gap-1.5 text-sm text-[var(--primary-600)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to threads
        </button>

        <div className="glass-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {activeThread.isPinned && (
                  <span className="flex items-center gap-1 rounded-full bg-[var(--gold-50)] px-2 py-0.5 text-xs font-medium text-[var(--gold-500)]">
                    <Pin className="h-3 w-3" /> Pinned
                  </span>
                )}
                {activeThread.isResolved && (
                  <span className="flex items-center gap-1 rounded-full bg-[var(--sage-50)] px-2 py-0.5 text-xs font-medium text-[var(--sage-500)]">
                    <CheckCircle2 className="h-3 w-3" /> Resolved
                  </span>
                )}
                <span className="rounded-full bg-[var(--primary-50)] px-2 py-0.5 text-xs text-[var(--primary-600)]">
                  {activeThread.module?.title}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[var(--slate-800)]">{activeThread.title}</h2>
              <p className="mt-1 text-xs text-[var(--slate-400)]">
                by {activeThread.author?.name} ({activeThread.author?.role}) &middot;{' '}
                {new Date(activeThread.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleThreadUpvote(activeThread.id)}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeThread.upvoted
                    ? 'bg-[var(--primary-50)] text-[var(--primary-600)]'
                    : 'text-[var(--slate-400)] hover:bg-[var(--slate-50)]'
                }`}
              >
                <ThumbsUp className="h-3.5 w-3.5" /> {activeThread._count?.upvotes || 0}
              </button>
              {isModerator && (
                <>
                  <button onClick={() => handlePin(activeThread.id)} title="Toggle pin" className="rounded-lg p-1.5 text-[var(--slate-400)] hover:bg-[var(--slate-50)] hover:text-[var(--gold-500)]">
                    <Pin className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleResolve(activeThread.id)} title="Toggle resolved" className="rounded-lg p-1.5 text-[var(--slate-400)] hover:bg-[var(--slate-50)] hover:text-[var(--sage-500)]">
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteThread(activeThread.id)} title="Delete thread" className="rounded-lg p-1.5 text-[var(--slate-400)] hover:bg-[var(--danger-50)] hover:text-[var(--danger-500)]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 whitespace-pre-wrap text-sm text-[var(--slate-600)] leading-relaxed">
            {activeThread.body}
          </div>
        </div>

        {/* Replies */}
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--slate-600)]">
            {activeThread.replies?.length || 0} {(activeThread.replies?.length || 0) === 1 ? 'reply' : 'replies'}
          </h3>

          {activeThread.replies?.map((reply: DiscussionReply) => (
            <div key={reply.id} className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-50)] text-xs font-semibold text-[var(--primary-600)]">
                    {reply.author?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--slate-700)]">{reply.author?.name}</span>
                    {reply.author?.role !== 'INTERN' && (
                      <span className="ml-1.5 rounded-full bg-[var(--primary-50)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--primary-600)]">
                        {reply.author?.role}
                      </span>
                    )}
                    <p className="text-[11px] text-[var(--slate-300)]">
                      {new Date(reply.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{' '}
                      {new Date(reply.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleReplyUpvote(activeThread.id, reply.id)}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition ${
                      reply.upvoted
                        ? 'bg-[var(--primary-50)] text-[var(--primary-600)]'
                        : 'text-[var(--slate-300)] hover:text-[var(--slate-500)]'
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" /> {reply._count?.upvotes || 0}
                  </button>
                  {(isModerator || reply.authorId === user?.id) && (
                    <button onClick={() => handleDeleteReply(activeThread.id, reply.id)} className="rounded-lg p-1 text-[var(--slate-300)] hover:text-[var(--danger-500)]">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--slate-600)] leading-relaxed">{reply.body}</p>
            </div>
          ))}
        </div>

        {/* Reply form */}
        <form onSubmit={handleReply} className="mt-4 glass-card p-4">
          <textarea
            placeholder="Write a reply..."
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            className="w-full rounded-lg border border-[var(--slate-200)] px-4 py-2.5 text-sm focus:border-[var(--primary-400)] focus:outline-none"
            rows={3}
            required
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary-400)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Reply
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─── Thread list view ───────────────────────────────

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--slate-800)]">Discussions</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">
            {threads.length} {threads.length === 1 ? 'thread' : 'threads'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary-400)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
        >
          <Plus className="h-4 w-4" /> New Question
        </button>
      </div>

      {/* Module filter */}
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-4 w-4 text-[var(--slate-400)]" />
        <select
          value={selectedModule}
          onChange={(e) => handleModuleFilter(e.target.value)}
          className="rounded-lg border border-[var(--slate-200)] px-3 py-1.5 text-sm text-[var(--slate-600)]"
        >
          <option value="">All modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
      </div>

      {/* New thread form */}
      {showForm && (
        <form onSubmit={handleCreateThread} className="mb-6 glass-card p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--slate-600)]">Module</label>
              <select
                value={form.moduleId}
                onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
                className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
                required
              >
                <option value="">Select module...</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--slate-600)]">Title</label>
              <input
                type="text"
                placeholder="e.g. How to handle missing values in pandas?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--slate-600)]">Question details</label>
            <textarea
              placeholder="Describe your question in detail..."
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
              rows={4}
              required
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[var(--primary-400)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-50"
            >
              Post Question
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm text-[var(--slate-500)] hover:bg-[var(--slate-50)]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Threads list */}
      <div className="space-y-3">
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => openThread(thread.id)}
            className="glass-card flex cursor-pointer items-center justify-between p-5 hover:border-[var(--primary-100)]"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-50)]">
                <MessageSquareText className="h-5 w-5 text-[var(--primary-400)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  {thread.isPinned && (
                    <span className="flex items-center gap-0.5 rounded-full bg-[var(--gold-50)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--gold-500)]">
                      <Pin className="h-2.5 w-2.5" /> Pinned
                    </span>
                  )}
                  {thread.isResolved && (
                    <span className="flex items-center gap-0.5 rounded-full bg-[var(--sage-50)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--sage-500)]">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Resolved
                    </span>
                  )}
                  <span className="rounded-full bg-[var(--slate-50)] px-1.5 py-0.5 text-[10px] text-[var(--slate-400)]">
                    {thread.module?.title}
                  </span>
                </div>
                <h3 className="truncate text-sm font-semibold text-[var(--slate-800)]">{thread.title}</h3>
                <p className="mt-0.5 text-xs text-[var(--slate-300)]">
                  {thread.author?.name} &middot;{' '}
                  {new Date(thread.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-4 text-xs text-[var(--slate-400)]">
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" /> {thread._count?.upvotes || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquareText className="h-3 w-3" /> {thread._count?.replies || 0}
              </span>
            </div>
          </div>
        ))}
        {threads.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--slate-300)]">No discussions yet. Be the first to ask a question!</p>
        )}
      </div>
    </div>
  );
}
