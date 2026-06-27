'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Hackathon, HackathonSubmission } from '@/types';
import { ArrowLeft, Trophy, ExternalLink, Star } from 'lucide-react';
import Link from 'next/link';

export default function HackathonDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitForm, setSubmitForm] = useState({ repoUrl: '', demoUrl: '' });
  const [judging, setJudging] = useState<string | null>(null);
  const [judgeForm, setJudgeForm] = useState({ score: 0, feedback: '' });

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    const res = await api.get(`/hackathons/${id}`);
    setHackathon(res.data.data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post(`/hackathons/${id}/submit`, submitForm);
    await loadData();
  }

  async function handleJudge(subId: string) {
    await api.put(`/hackathons/submissions/${subId}/judge`, judgeForm);
    setJudging(null);
    setJudgeForm({ score: 0, feedback: '' });
    await loadData();
  }

  if (loading || !hackathon) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const now = new Date();
  const isOpen = now >= new Date(hackathon.startTime) && now <= new Date(hackathon.endTime);
  const mySub = hackathon.submissions?.find((s) => s.internId === user?.id);

  return (
    <div>
      <Link href="/hackathons" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Hackathons
      </Link>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{hackathon.title}</h1>
            {hackathon.description && <p className="mt-1 text-sm text-gray-500">{hackathon.description}</p>}
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
              <span>Day {hackathon.dayNumber}</span>
              <span>Max: {hackathon.maxScore} pts</span>
              <span>{hackathon.isTeam ? 'Team' : 'Individual'}</span>
              <span>Start: {new Date(hackathon.startTime).toLocaleString('en-IN')}</span>
              <span>End: {new Date(hackathon.endTime).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
            <Trophy className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Intern submit form */}
      {isIntern && isOpen && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-800">{mySub ? 'Update Submission' : 'Submit'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input type="url" placeholder="Repository URL" value={submitForm.repoUrl} onChange={(e) => setSubmitForm({ ...submitForm, repoUrl: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2 text-sm" />
            <input type="url" placeholder="Demo URL (optional)" value={submitForm.demoUrl} onChange={(e) => setSubmitForm({ ...submitForm, demoUrl: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2 text-sm" />
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
            {mySub ? 'Update' : 'Submit'}
          </button>
        </form>
      )}

      {/* Leaderboard / Submissions */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <h2 className="border-b border-gray-200 px-6 py-4 text-lg font-semibold text-gray-800">
          Submissions ({hackathon.submissions?.length || 0})
        </h2>
        <div className="divide-y divide-gray-100">
          {(hackathon.submissions || []).map((sub: HackathonSubmission, i: number) => (
            <div key={sub.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {sub.score !== null && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                      {i + 1}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sub.intern?.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{new Date(sub.submittedAt).toLocaleString('en-IN')}</span>
                      {sub.repoUrl && (
                        <a href={sub.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-blue-500 hover:text-blue-600">
                          <ExternalLink className="h-3 w-3" /> Repo
                        </a>
                      )}
                      {sub.demoUrl && (
                        <a href={sub.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-blue-500 hover:text-blue-600">
                          <ExternalLink className="h-3 w-3" /> Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sub.score !== null ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-lg font-bold text-gray-900">{sub.score}/{hackathon.maxScore}</span>
                    </div>
                  ) : !isIntern ? (
                    <button
                      onClick={() => { setJudging(judging === sub.id ? null : sub.id); setJudgeForm({ score: 0, feedback: '' }); }}
                      className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200"
                    >
                      Judge
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Pending review</span>
                  )}
                </div>
              </div>
              {sub.feedback && <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">{sub.feedback}</p>}
              {judging === sub.id && (
                <div className="mt-3 flex gap-2">
                  <input type="number" placeholder="Score" value={judgeForm.score} onChange={(e) => setJudgeForm({ ...judgeForm, score: Number(e.target.value) })} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm" min={0} max={hackathon.maxScore} />
                  <input type="text" placeholder="Feedback" value={judgeForm.feedback} onChange={(e) => setJudgeForm({ ...judgeForm, feedback: e.target.value })} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  <button onClick={() => handleJudge(sub.id)} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">Score</button>
                </div>
              )}
            </div>
          ))}
          {(!hackathon.submissions || hackathon.submissions.length === 0) && (
            <p className="px-6 py-8 text-center text-sm text-gray-400">No submissions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
