'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  GitBranch, Users, Check, Clock, MessageSquare, Send,
  ChevronDown, ChevronUp, ExternalLink, Shuffle, AlertCircle,
} from 'lucide-react';

interface PeerReview {
  id: string;
  status: 'PENDING' | 'REVIEWED';
  commentsJson: { line?: number; file?: string; comment: string }[];
  reviewedAt: string | null;
  createdAt: string;
  reviewer?: { id: string; name: string };
  commitLog: {
    id: string;
    commitHash: string;
    message: string;
    filesChanged?: number;
    additions?: number;
    deletions?: number;
    date: string;
    intern?: { id: string; name: string };
    githubLink?: { repoName: string; repoUrl?: string };
  };
}

interface PeerReviewStats {
  total: number;
  pending: number;
  completed: number;
  completionRate: number;
}

export default function PeerReviewsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MENTOR';

  const [myReviews, setMyReviews] = useState<PeerReview[]>([]);
  const [onMyCode, setOnMyCode] = useState<PeerReview[]>([]);
  const [stats, setStats] = useState<PeerReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'assigned' | 'received' | 'manage'>('assigned');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const requests: Promise<unknown>[] = [
        api.get('/peer-reviews/my'),
        api.get('/peer-reviews/on-my-code'),
      ];
      if (isAdmin) requests.push(api.get('/peer-reviews/stats'));

      const results = await Promise.allSettled(requests);
      if (results[0].status === 'fulfilled') setMyReviews((results[0].value as { data: { data: PeerReview[] } }).data.data);
      if (results[1].status === 'fulfilled') setOnMyCode((results[1].value as { data: { data: PeerReview[] } }).data.data);
      if (isAdmin && results[2]?.status === 'fulfilled') setStats((results[2].value as { data: { data: PeerReviewStats } }).data.data);
    } catch { /* handled */ } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview(reviewId: string) {
    if (!reviewComment.trim()) return;
    setSubmitting(true);
    try {
      await api.put(`/peer-reviews/${reviewId}/submit`, {
        commentsJson: [{ comment: reviewComment.trim() }],
      });
      setMessage({ type: 'success', text: 'Review submitted successfully' });
      setReviewComment('');
      setExpandedReview(null);
      loadData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to submit review' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAutoAssign() {
    setAutoAssigning(true);
    try {
      const res = await api.post('/peer-reviews/auto-assign', {});
      const count = res.data.data.assigned;
      setMessage({ type: 'success', text: `Auto-assigned ${count} peer review${count !== 1 ? 's' : ''}` });
      loadData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to auto-assign reviews' });
    } finally {
      setAutoAssigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
      </div>
    );
  }

  const pendingCount = myReviews.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="liquid-enter space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--slate-800)]">Peer Code Reviews</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">
            Review your peers&apos; code and receive feedback on yours
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleAutoAssign}
            disabled={autoAssigning}
            className="liquid-control flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--primary-600)] disabled:opacity-50"
          >
            <Shuffle className="h-4 w-4" />
            {autoAssigning ? 'Assigning...' : 'Auto-Assign Reviews'}
          </button>
        )}
      </header>

      {message && (
        <div className={`liquid-control flex items-center gap-2 px-4 py-3 text-sm ${
          message.type === 'success' ? 'text-[var(--sage-500)]' : 'text-[var(--danger-500)]'
        }`}>
          {message.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* Stats for admin/mentor */}
      {isAdmin && stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="liquid-pill px-4 py-3 text-center">
            <p className="text-xs text-[var(--slate-400)]">Total Reviews</p>
            <p className="mt-1 text-lg font-semibold text-[var(--slate-700)]">{stats.total}</p>
          </div>
          <div className="liquid-pill px-4 py-3 text-center">
            <p className="text-xs text-[var(--slate-400)]">Pending</p>
            <p className="mt-1 text-lg font-semibold text-[var(--gold-500)]">{stats.pending}</p>
          </div>
          <div className="liquid-pill px-4 py-3 text-center">
            <p className="text-xs text-[var(--slate-400)]">Completed</p>
            <p className="mt-1 text-lg font-semibold text-[var(--sage-500)]">{stats.completed}</p>
          </div>
          <div className="liquid-pill px-4 py-3 text-center">
            <p className="text-xs text-[var(--slate-400)]">Completion Rate</p>
            <p className="mt-1 text-lg font-semibold text-[var(--primary-600)]">{stats.completionRate}%</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-white/20 p-1" style={{ maxWidth: 440 }}>
        <button
          onClick={() => setTab('assigned')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
            tab === 'assigned' ? 'liquid-control text-[var(--primary-600)]' : 'text-[var(--slate-400)]'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          To Review {pendingCount > 0 && <span className="rounded-full bg-[var(--primary-50)] px-1.5 text-xs text-[var(--primary-600)]">{pendingCount}</span>}
        </button>
        <button
          onClick={() => setTab('received')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
            tab === 'received' ? 'liquid-control text-[var(--primary-600)]' : 'text-[var(--slate-400)]'
          }`}
        >
          <GitBranch className="h-4 w-4" />
          My Code
        </button>
      </div>

      {/* Assigned reviews */}
      {tab === 'assigned' && (
        <div className="space-y-3">
          {myReviews.length === 0 ? (
            <div className="liquid-card flex min-h-[200px] flex-col items-center justify-center p-8 text-center">
              <Users className="mb-3 h-8 w-8 text-[var(--slate-300)]" />
              <p className="text-sm font-medium text-[var(--slate-500)]">No peer reviews assigned</p>
              <p className="mt-1 text-xs text-[var(--slate-400)]">Reviews will appear here when assigned</p>
            </div>
          ) : (
            myReviews.map((review) => (
              <div key={review.id} className="liquid-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        review.status === 'REVIEWED'
                          ? 'bg-[rgba(45,122,79,0.13)] text-[var(--sage-500)]'
                          : 'bg-[rgba(154,107,30,0.13)] text-[var(--gold-500)]'
                      }`}>
                        {review.status === 'REVIEWED' ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--slate-700)]">
                          {review.commitLog.message}
                        </p>
                        <p className="text-xs text-[var(--slate-400)]">
                          by {review.commitLog.intern?.name} &middot; {review.commitLog.githubLink?.repoName} &middot; {review.commitLog.commitHash.substring(0, 7)}
                        </p>
                      </div>
                    </div>
                    {review.commitLog.filesChanged != null && (
                      <div className="mt-2 flex gap-3 text-xs text-[var(--slate-400)]">
                        <span>{review.commitLog.filesChanged} files</span>
                        <span className="text-[var(--sage-500)]">+{review.commitLog.additions}</span>
                        <span className="text-[var(--danger-500)]">-{review.commitLog.deletions}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      review.status === 'REVIEWED'
                        ? 'bg-[var(--sage-50)] text-[var(--sage-500)]'
                        : 'bg-[var(--gold-50)] text-[var(--gold-500)]'
                    }`}>
                      {review.status}
                    </span>
                    {review.status === 'PENDING' && (
                      <button
                        onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                        className="liquid-control flex h-8 w-8 items-center justify-center text-[var(--slate-400)]"
                      >
                        {expandedReview === review.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Review form */}
                {expandedReview === review.id && review.status === 'PENDING' && (
                  <div className="mt-4 space-y-3 border-t border-white/30 pt-4">
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write your code review feedback... (code quality, suggestions, what you learned)"
                      className="glass-input w-full px-4 py-3 text-sm text-[var(--slate-700)] outline-none"
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      {review.commitLog.githubLink?.repoUrl && (
                        <a
                          href={`${review.commitLog.githubLink.repoUrl}/commit/${review.commitLog.commitHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="liquid-control flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--slate-500)]"
                        >
                          <ExternalLink className="h-3 w-3" /> View on GitHub
                        </a>
                      )}
                      <button
                        onClick={() => handleSubmitReview(review.id)}
                        disabled={submitting || !reviewComment.trim()}
                        className="liquid-control flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--primary-600)] disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Show review comments if already reviewed */}
                {review.status === 'REVIEWED' && review.commentsJson && (review.commentsJson as { comment: string }[]).length > 0 && (
                  <div className="mt-3 rounded-xl bg-white/20 px-4 py-3 text-sm text-[var(--slate-600)]">
                    {(review.commentsJson as { comment: string }[])[0]?.comment}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Reviews on my code */}
      {tab === 'received' && (
        <div className="space-y-3">
          {onMyCode.length === 0 ? (
            <div className="liquid-card flex min-h-[200px] flex-col items-center justify-center p-8 text-center">
              <GitBranch className="mb-3 h-8 w-8 text-[var(--slate-300)]" />
              <p className="text-sm font-medium text-[var(--slate-500)]">No peer reviews on your code yet</p>
              <p className="mt-1 text-xs text-[var(--slate-400)]">Feedback from peers will appear here</p>
            </div>
          ) : (
            onMyCode.map((review) => (
              <div key={review.id} className="liquid-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--slate-700)]">
                      {review.commitLog.message}
                    </p>
                    <p className="mt-1 text-xs text-[var(--slate-400)]">
                      Reviewed by {review.reviewer?.name} &middot; {review.commitLog.githubLink?.repoName} &middot; {review.commitLog.commitHash.substring(0, 7)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    review.status === 'REVIEWED'
                      ? 'bg-[var(--sage-50)] text-[var(--sage-500)]'
                      : 'bg-[var(--gold-50)] text-[var(--gold-500)]'
                  }`}>
                    {review.status}
                  </span>
                </div>
                {review.status === 'REVIEWED' && review.commentsJson && (review.commentsJson as { comment: string }[]).length > 0 && (
                  <div className="mt-3 rounded-xl bg-white/20 px-4 py-3 text-sm text-[var(--slate-600)]">
                    <p className="mb-1 text-xs font-medium text-[var(--slate-400)]">Feedback:</p>
                    {(review.commentsJson as { comment: string }[])[0]?.comment}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
