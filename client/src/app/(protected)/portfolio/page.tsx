'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { GitBranch, FileText, Brain, ExternalLink, User as UserIcon } from 'lucide-react';

interface PortfolioData {
  user: { id: string; name: string; email: string; avatarUrl: string | null; status: string; createdAt: string };
  repos: { id: string; repoName: string; repoUrl: string; _count: { commits: number } }[];
  submissions: { id: string; grade: number | null; submittedAt: string; assignment: { title: string; isMiniProject: boolean; maxScore: number } }[];
  quizAttempts: { id: string; score: number | null; maxScore: number | null; submittedAt: string | null; quiz: { title: string; type: string; maxScore: number } }[];
}

export default function PortfolioPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState('');
  const [interns, setInterns] = useState<{ id: string; name: string }[]>([]);

  const isIntern = user?.role === 'INTERN';

  useEffect(() => {
    if (!isIntern) {
      api.get('/users?role=INTERN').then((res) => {
        setInterns(res.data.data || []);
      });
    }
    loadPortfolio();
  }, []);

  async function loadPortfolio(internId?: string) {
    setLoading(true);
    const url = internId ? `/github/portfolio/${internId}` : '/github/portfolio';
    const res = await api.get(url);
    setData(res.data.data);
    setLoading(false);
  }

  if (loading || !data) {
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
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="mt-1 text-sm text-gray-500">Showcase of work and achievements</p>
        </div>
        {!isIntern && interns.length > 0 && (
          <select
            value={selectedIntern}
            onChange={(e) => {
              setSelectedIntern(e.target.value);
              loadPortfolio(e.target.value || undefined);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            <option value="">My Portfolio</option>
            {interns.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Profile Card */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <UserIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{data.user.name}</h2>
            <p className="text-sm text-gray-500">{data.user.email}</p>
            <div className="mt-1 flex gap-4 text-xs text-gray-400">
              <span>Status: {data.user.status}</span>
              <span>Joined: {new Date(data.user.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{data.repos.length}</p>
            <p className="text-xs text-gray-500">Repositories</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {data.repos.reduce((s, r) => s + (r._count?.commits || 0), 0)}
            </p>
            <p className="text-xs text-gray-500">Commits</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{data.submissions.length}</p>
            <p className="text-xs text-gray-500">Graded Submissions</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{data.quizAttempts.length}</p>
            <p className="text-xs text-gray-500">Quiz Attempts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Repos */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <h3 className="flex items-center gap-2 border-b border-gray-200 px-6 py-4 text-base font-semibold text-gray-800">
            <GitBranch className="h-5 w-5 text-gray-400" /> Repositories
          </h3>
          <div className="divide-y divide-gray-100">
            {data.repos.map((repo) => (
              <div key={repo.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{repo.repoName}</p>
                  <p className="text-xs text-gray-400">{repo._count?.commits || 0} commits</p>
                </div>
                <a href={repo.repoUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
            {data.repos.length === 0 && (
              <p className="px-6 py-6 text-center text-sm text-gray-400">No repos linked</p>
            )}
          </div>
        </div>

        {/* Graded Assignments */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <h3 className="flex items-center gap-2 border-b border-gray-200 px-6 py-4 text-base font-semibold text-gray-800">
            <FileText className="h-5 w-5 text-gray-400" /> Graded Work
          </h3>
          <div className="divide-y divide-gray-100">
            {data.submissions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {sub.assignment.title}
                    {sub.assignment.isMiniProject && (
                      <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600">Mini Project</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {sub.grade}/{sub.assignment.maxScore}
                </span>
              </div>
            ))}
            {data.submissions.length === 0 && (
              <p className="px-6 py-6 text-center text-sm text-gray-400">No graded work yet</p>
            )}
          </div>
        </div>

        {/* Quiz Results */}
        <div className="rounded-xl border border-gray-200 bg-white lg:col-span-2">
          <h3 className="flex items-center gap-2 border-b border-gray-200 px-6 py-4 text-base font-semibold text-gray-800">
            <Brain className="h-5 w-5 text-gray-400" /> Quiz Results
          </h3>
          <div className="divide-y divide-gray-100">
            {data.quizAttempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{attempt.quiz.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5">{attempt.quiz.type}</span>
                    <span>{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString('en-IN') : 'In progress'}</span>
                  </div>
                </div>
                {attempt.score !== null && (
                  <span className="text-sm font-bold text-gray-900">
                    {attempt.score}/{attempt.maxScore}
                  </span>
                )}
              </div>
            ))}
            {data.quizAttempts.length === 0 && (
              <p className="px-6 py-6 text-center text-sm text-gray-400">No quiz attempts yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
