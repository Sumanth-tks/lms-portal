'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { GitHubLink, CommitLog, CodeReview } from '@/types';
import { GitBranch, Plus, Trash2, MessageSquare, ExternalLink } from 'lucide-react';

export default function GitHubPage() {
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';

  const [links, setLinks] = useState<GitHubLink[]>([]);
  const [commits, setCommits] = useState<CommitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ repoUrl: '', repoName: '' });

  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [linksRes, commitsRes] = await Promise.all([
      api.get('/github/links'),
      api.get('/github/commits'),
    ]);
    setLinks(linksRes.data.data);
    setCommits(commitsRes.data.data);
    setLoading(false);
  }

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/github/links', form);
      setShowForm(false);
      setForm({ repoUrl: '', repoName: '' });
      await loadData();
    } catch { /* handled */ }
  }

  async function handleUnlink(id: string) {
    await api.delete(`/github/links/${id}`);
    await loadData();
  }

  async function handleReview(commitId: string) {
    await api.post('/github/reviews', {
      commitLogId: commitId,
      commentsJson: [{ comment: reviewComment }],
    });
    setShowReviewForm(null);
    setReviewComment('');
    await loadData();
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
          <h1 className="text-2xl font-bold text-[var(--slate-800)]">GitHub</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">{links.length} linked repos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary-400)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
        >
          <Plus className="h-4 w-4" /> Link Repo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleLink} className="mb-6 glass-card p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="url"
              placeholder="https://github.com/user/repo"
              value={form.repoUrl}
              onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
              className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Repo name"
              value={form.repoName}
              onChange={(e) => setForm({ ...form, repoName: e.target.value })}
              className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
              required
            />
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-[var(--primary-400)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]">
            Link
          </button>
        </form>
      )}

      {/* Linked Repos */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <div key={link.id} className="flex items-center justify-between glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--slate-800)]">
                <GitBranch className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--slate-800)]">{link.repoName}</h3>
                <p className="text-xs text-[var(--slate-300)]">{link._count?.commits || 0} commits</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={link.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-[var(--slate-300)] hover:bg-[var(--slate-50)] hover:text-[var(--slate-500)]"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              {(isIntern || user?.role === 'ADMIN') && (
                <button
                  onClick={() => handleUnlink(link.id)}
                  className="rounded-lg p-2 text-[var(--slate-300)] hover:bg-[var(--rose-50)] hover:text-[var(--rose-500)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Commits */}
      <div className="glass-card">
        <h2 className="border-b border-[var(--card-border)] px-6 py-4 text-lg font-semibold text-[var(--slate-700)]">
          Recent Commits ({commits.length})
        </h2>
        <div className="divide-y divide-gray-100">
          {commits.map((commit) => (
            <div key={commit.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--slate-800)]">{commit.message}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-[var(--slate-300)]">
                    <span className="font-mono">{commit.commitHash.substring(0, 7)}</span>
                    {commit.githubLink && <span>{commit.githubLink.repoName}</span>}
                    {commit.intern && <span>{commit.intern.name}</span>}
                    <span>{new Date(commit.date).toLocaleDateString('en-IN')}</span>
                    <span className="text-[var(--sage-500)]">+{commit.additions}</span>
                    <span className="text-[var(--rose-500)]">-{commit.deletions}</span>
                    <span>{commit.filesChanged} files</span>
                  </div>
                </div>
                {!isIntern && (
                  <button
                    onClick={() => setShowReviewForm(showReviewForm === commit.id ? null : commit.id)}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--primary-400)] hover:bg-[var(--primary-50)]"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Review {commit._count?.reviews ? `(${commit._count.reviews})` : ''}
                  </button>
                )}
              </div>
              {showReviewForm === commit.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add review comment..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="flex-1 rounded-lg border border-[var(--slate-200)] px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => handleReview(commit.id)}
                    disabled={!reviewComment.trim()}
                    className="rounded-lg bg-[var(--primary-400)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-50"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          ))}
          {commits.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-[var(--slate-300)]">No commits tracked yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
