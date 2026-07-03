'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { CapstoneProject, CapstonePhase } from '@/types';
import { Rocket, Plus, CheckCircle, ExternalLink } from 'lucide-react';

const PHASES: { key: CapstonePhase; label: string; color: string }[] = [
  { key: 'STATEMENT', label: 'Problem Statement', color: 'bg-blue-500' },
  { key: 'SOLUTION', label: 'Solution', color: 'bg-indigo-500' },
  { key: 'DEPLOYMENT', label: 'Deployment', color: 'bg-purple-500' },
  { key: 'DOCUMENTATION', label: 'Documentation', color: 'bg-pink-500' },
  { key: 'PRESENTATION', label: 'Presentation', color: 'bg-orange-500' },
  { key: 'EVALUATION', label: 'Evaluation', color: 'bg-green-500' },
];

export default function CapstonePage() {
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';
  const [projects, setProjects] = useState<CapstoneProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ problemStatement: '', repoUrl: '' });
  const [interns, setInterns] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedIntern, setSelectedIntern] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ phase: '' as CapstonePhase, repoUrl: '', deployedUrl: '', problemStatement: '' });

  // Evaluate form
  const [evaluating, setEvaluating] = useState<string | null>(null);
  const [evalForm, setEvalForm] = useState({ finalScore: 0, feedback: '' });

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!isIntern) {
      api.get('/users?role=INTERN').then((res) => setInterns(res.data.data)).catch(() => {});
    }
  }, [isIntern]);

  async function loadData() {
    const res = await api.get('/capstones');
    setProjects(res.data.data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/capstones', { internId: selectedIntern, problemStatement: form.problemStatement, repoUrl: form.repoUrl || undefined });
    setShowForm(false);
    setForm({ problemStatement: '', repoUrl: '' });
    setSelectedIntern('');
    await loadData();
  }

  async function handleUpdate(id: string) {
    await api.put(`/capstones/${id}`, editForm);
    setEditing(null);
    await loadData();
  }

  async function handleEvaluate(id: string) {
    await api.put(`/capstones/${id}/evaluate`, { finalScore: evalForm.finalScore, feedbackJson: { comment: evalForm.feedback } });
    setEvaluating(null);
    await loadData();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const myProject = isIntern ? projects.find((p) => p.internId === user?.id) : null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capstone Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Days 91–100 final project</p>
        </div>
        {!isIntern && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Start Capstone
          </button>
        )}
      </div>

      {showForm && !isIntern && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Assign to Intern</label>
            <select value={selectedIntern} onChange={(e) => setSelectedIntern(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" required>
              <option value="">— Select an intern —</option>
              {interns.map((i) => (
                <option key={i.id} value={i.id}>{i.name} ({i.email})</option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Problem Statement</label>
            <textarea placeholder="What problem will this capstone solve?" value={form.problemStatement} onChange={(e) => setForm({ ...form, problemStatement: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" rows={3} required />
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Repository URL (optional)</label>
            <input type="url" placeholder="https://github.com/..." value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" />
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Submit</button>
        </form>
      )}

      <div className="space-y-4">
        {projects.map((project) => {
          const phaseIdx = PHASES.findIndex((p) => p.key === project.phase);

          return (
            <div key={project.id} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                    <Rocket className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{project.intern?.name}</p>
                    {project.mentor && <p className="text-xs text-gray-400">Mentor: {project.mentor.name}</p>}
                  </div>
                </div>
                {project.finalScore !== null && (
                  <span className="text-xl font-bold text-green-600">{project.finalScore} pts</span>
                )}
              </div>

              {project.problemStatement && (
                <p className="mt-3 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">{project.problemStatement}</p>
              )}

              {/* Phase tracker */}
              <div className="mt-4 flex items-center gap-1">
                {PHASES.map((phase, i) => (
                  <div key={phase.key} className="flex flex-1 flex-col items-center">
                    <div className={`h-2 w-full rounded-full ${i <= phaseIdx ? phase.color : 'bg-gray-200'}`} />
                    <span className={`mt-1 text-[10px] ${i <= phaseIdx ? 'font-medium text-gray-700' : 'text-gray-400'}`}>
                      {phase.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-blue-500 hover:text-blue-600">
                    <ExternalLink className="h-3 w-3" /> Repo
                  </a>
                )}
                {project.deployedUrl && (
                  <a href={project.deployedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-green-500 hover:text-green-600">
                    <ExternalLink className="h-3 w-3" /> Live
                  </a>
                )}
                <span>Started: {new Date(project.createdAt).toLocaleDateString('en-IN')}</span>
              </div>

              {/* Edit phase / URLs */}
              {(project.internId === user?.id || !isIntern) && project.phase !== 'EVALUATION' && (
                <div className="mt-4">
                  {editing === project.id ? (
                    <div className="space-y-2">
                      <select value={editForm.phase} onChange={(e) => setEditForm({ ...editForm, phase: e.target.value as CapstonePhase })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        {PHASES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                      </select>
                      <input type="url" placeholder="Repo URL" value={editForm.repoUrl} onChange={(e) => setEditForm({ ...editForm, repoUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                      <input type="url" placeholder="Deployed URL" value={editForm.deployedUrl} onChange={(e) => setEditForm({ ...editForm, deployedUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(project.id)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Save</button>
                        <button onClick={() => setEditing(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditing(project.id); setEditForm({ phase: project.phase, repoUrl: project.repoUrl || '', deployedUrl: project.deployedUrl || '', problemStatement: project.problemStatement || '' }); }}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Update Progress
                    </button>
                  )}
                </div>
              )}

              {/* Evaluate */}
              {!isIntern && project.phase !== 'EVALUATION' && (
                <div className="mt-3">
                  {evaluating === project.id ? (
                    <div className="flex gap-2">
                      <input type="number" placeholder="Score" value={evalForm.finalScore} onChange={(e) => setEvalForm({ ...evalForm, finalScore: Number(e.target.value) })} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm" min={0} />
                      <input type="text" placeholder="Feedback" value={evalForm.feedback} onChange={(e) => setEvalForm({ ...evalForm, feedback: e.target.value })} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                      <button onClick={() => handleEvaluate(project.id)} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setEvaluating(project.id)} className="text-xs text-green-600 hover:text-green-700">Evaluate</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {projects.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No capstone projects yet</p>}
      </div>
    </div>
  );
}
