'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Assignment, Submission } from '@/types';
import { FileText, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [githubUrl, setGithubUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [gradeForm, setGradeForm] = useState({ grade: 0, feedback: '', requestResubmit: false });
  const [gradingId, setGradingId] = useState<string | null>(null);

  useEffect(() => {
    loadAssignment();
  }, [id]);

  async function loadAssignment() {
    const { data } = await api.get(`/assignments/${id}`);
    setAssignment(data.data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!githubUrl.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/assignments/${id}/submit`, { githubUrl: githubUrl.trim() });
      setGithubUrl('');
      await loadAssignment();
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!gradingId) return;
    try {
      await api.post(`/assignments/submissions/${gradingId}/grade`, gradeForm);
      setGradingId(null);
      setGradeForm({ grade: 0, feedback: '', requestResubmit: false });
      await loadAssignment();
    } catch {
      // handled
    }
  }

  if (loading || !assignment) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
      </div>
    );
  }

  const mySubmissions = assignment.submissions || [];
  const latestSub = mySubmissions[0];
  const canSubmit = isIntern && (!latestSub || latestSub.status === 'RESUBMIT_REQUESTED');
  const isPastDeadline = new Date(assignment.deadline) < new Date();

  const statusColors: Record<string, string> = {
    SUBMITTED: 'bg-yellow-100 text-yellow-700',
    GRADED: 'bg-[var(--sage-50)] text-[var(--sage-500)]',
    RESUBMIT_REQUESTED: 'bg-orange-100 text-orange-700',
  };

  return (
    <div>
      <Link href="/assignments" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--slate-400)] hover:text-[var(--slate-600)]">
        <ArrowLeft className="h-4 w-4" /> Back to Assignments
      </Link>

      <div className="mb-6 glass-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              {assignment.isMiniProject && (
                <span className="rounded-full bg-[var(--rose-50)] px-2 py-0.5 text-xs font-medium text-[var(--rose-500)]">Mini Project</span>
              )}
              {assignment.module?.course && (
                <span className="rounded-full bg-[var(--slate-50)] px-2 py-0.5 text-xs font-medium text-[var(--slate-500)]">
                  Week {assignment.module.course.weekNumber} &middot; {assignment.module.title}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-xl font-bold text-[var(--slate-800)]">{assignment.title}</h1>
            <p className="mt-2 text-sm text-[var(--slate-500)]">{assignment.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--primary-400)]">{assignment.maxScore}</p>
            <p className="text-xs text-[var(--slate-300)]">max points</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--slate-400)]">
          <span>Deadline: {new Date(assignment.deadline).toLocaleString('en-IN')}</span>
          {assignment.fileTypes && <span>Files: {assignment.fileTypes}</span>}
          {assignment.allowResubmit && <span>Resubmits: {assignment.maxResubmits}</span>}
          <span className={isPastDeadline ? 'font-medium text-[var(--rose-500)]' : 'font-medium text-[var(--sage-500)]'}>
            {isPastDeadline ? 'Closed' : 'Open'}
          </span>
        </div>

        {assignment.rubricJson && assignment.rubricJson.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-[var(--slate-600)]">Rubric</h3>
            <div className="space-y-1">
              {assignment.rubricJson.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-[var(--slate-50)] px-4 py-2">
                  <span className="text-sm text-[var(--slate-600)]">{r.criteria}</span>
                  <span className="text-sm font-medium text-[var(--slate-800)]">{r.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Intern submit */}
      {canSubmit && !isPastDeadline && (
        <form onSubmit={handleSubmit} className="mb-6 glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--slate-700)]">
            {latestSub ? 'Resubmit' : 'Submit'} Your Work
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--slate-600)]">GitHub Repository / File Link</label>
              <input
                type="url"
                placeholder="https://github.com/username/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={!githubUrl.trim() || submitting}
              className="self-start rounded-lg bg-[var(--primary-400)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      {/* Submissions list */}
      <div className="glass-card">
        <h2 className="border-b border-[var(--card-border)] px-6 py-4 text-lg font-semibold text-[var(--slate-700)]">
          Submissions ({mySubmissions.length})
        </h2>
        <div className="divide-y divide-gray-100">
          {mySubmissions.map((sub: Submission) => (
            <div key={sub.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[var(--slate-300)]" />
                  <div>
                    {sub.intern && <p className="text-sm font-medium text-[var(--slate-800)]">{sub.intern.name}</p>}
                    <p className="text-xs text-[var(--slate-400)]">
                      {new Date(sub.submittedAt).toLocaleString('en-IN')}
                      {sub.resubmitCount > 0 && ` (resubmit #${sub.resubmitCount})`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sub.grade !== null && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-bold text-[var(--slate-800)]">{sub.grade}/{assignment.maxScore}</span>
                    </div>
                  )}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[sub.status]}`}>
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {sub.fileUrl && (
                <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[var(--primary-400)] underline">
                  View submission ↗
                </a>
              )}

              {sub.feedback && (
                <div className="mt-2 rounded-lg bg-[var(--slate-50)] p-3">
                  <p className="text-xs font-medium text-[var(--slate-400)]">Feedback</p>
                  <p className="mt-1 text-sm text-[var(--slate-600)]">{sub.feedback}</p>
                </div>
              )}

              {/* Grade button for mentor/admin */}
              {!isIntern && sub.status === 'SUBMITTED' && gradingId !== sub.id && (
                <button
                  onClick={() => { setGradingId(sub.id); setGradeForm({ grade: 0, feedback: '', requestResubmit: false }); }}
                  className="mt-3 rounded-lg bg-[var(--primary-400)] px-4 py-1.5 text-xs font-medium text-white hover:bg-[var(--primary-600)]"
                >
                  Grade
                </button>
              )}

              {/* Grade form */}
              {gradingId === sub.id && (
                <form onSubmit={handleGrade} className="mt-3 rounded-lg border border-[var(--primary-100)] bg-[var(--primary-50)] p-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-[var(--slate-600)]">
                      Score:
                      <input
                        type="number"
                        value={gradeForm.grade}
                        onChange={(e) => setGradeForm({ ...gradeForm, grade: Number(e.target.value) })}
                        className="ml-2 w-20 rounded border border-[var(--slate-200)] px-2 py-1 text-sm"
                        min={0}
                        max={assignment.maxScore}
                      />
                      / {assignment.maxScore}
                    </label>
                    <label className="flex items-center gap-1 text-sm text-[var(--slate-600)]">
                      <input
                        type="checkbox"
                        checked={gradeForm.requestResubmit}
                        onChange={(e) => setGradeForm({ ...gradeForm, requestResubmit: e.target.checked })}
                      />
                      Request resubmit
                    </label>
                  </div>
                  <textarea
                    placeholder="Feedback"
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    className="mt-3 w-full rounded border border-[var(--slate-200)] px-3 py-2 text-sm"
                    rows={2}
                    required
                  />
                  <div className="mt-2 flex gap-2">
                    <button type="submit" className="rounded bg-[var(--primary-400)] px-4 py-1.5 text-xs font-medium text-white hover:bg-[var(--primary-600)]">
                      Submit Grade
                    </button>
                    <button type="button" onClick={() => setGradingId(null)} className="rounded bg-[var(--slate-200)] px-4 py-1.5 text-xs font-medium text-[var(--slate-600)]">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
          {mySubmissions.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-[var(--slate-300)]">No submissions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}