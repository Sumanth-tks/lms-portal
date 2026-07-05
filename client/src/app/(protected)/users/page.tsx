'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';
import { UserPlus, Link2, X, Trash2 } from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', role: 'INTERN' as 'MENTOR' | 'INTERN' });
  const [creating, setCreating] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  // Assign-interns modal state
  const [assignMentor, setAssignMentor] = useState<User | null>(null);
  const [assignSelected, setAssignSelected] = useState<string[]>([]);
  const [assignSaving, setAssignSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await api.get('/users?includeRemoved=true');
    setUsers(data.data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post('/users', form);
      setTempPassword(data.data.tempPassword);
      setShowForm(false);
      setForm({ email: '', name: '', role: 'INTERN' });
      loadUsers();
    } catch {
      // handled by interceptor
    } finally {
      setCreating(false);
    }
  }

  async function openAssign(mentor: User) {
    setAssignMentor(mentor);
    setAssignSelected([]);
    try {
      const { data } = await api.get(`/users/${mentor.id}/interns`);
      setAssignSelected(data.data.internIds || []);
    } catch {
      // start with empty selection
    }
  }

  function toggleIntern(internId: string) {
    setAssignSelected((prev) =>
      prev.includes(internId) ? prev.filter((id) => id !== internId) : [...prev, internId]
    );
  }

  async function saveAssignments() {
    if (!assignMentor) return;
    setAssignSaving(true);
    try {
      await api.put(`/users/${assignMentor.id}/interns`, { internIds: assignSelected });
      setAssignMentor(null);
    } catch {
      // handled by interceptor
    } finally {
      setAssignSaving(false);
    }
  }

  async function handleRemove(u: User) {
    if (!confirm(`Remove ${u.name}? They will lose access. This can be undone later by an admin.`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      loadUsers();
    } catch {
      // handled by interceptor
    }
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-[var(--sage-50)] text-[var(--sage-500)]',
    INVITED: 'bg-yellow-100 text-yellow-700',
    ONBOARDING: 'bg-[var(--primary-50)] text-[var(--primary-600)]',
    PAUSED: 'bg-[var(--slate-50)] text-[var(--slate-600)]',
    COMPLETED: 'bg-[var(--rose-50)] text-[var(--rose-500)]',
    REMOVED: 'bg-[var(--rose-50)] text-[var(--rose-500)]',
  };

  const allInterns = users.filter((u) => u.role === 'INTERN');

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--slate-800)]">
            {currentUser?.role === 'MENTOR' ? 'My Interns' : 'Users'}
          </h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">{users.length} users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary-400)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
        >
          <UserPlus className="h-4 w-4" />
          Create {currentUser?.role === 'ADMIN' ? 'User' : 'Intern'}
        </button>
      </div>

      {tempPassword && (
        <div className="mb-6 rounded-lg border border-green-200 bg-[var(--sage-50)] p-4">
          <p className="text-sm font-medium text-green-800">
            User created! Temporary password:{' '}
            <code className="rounded bg-[var(--sage-50)] px-2 py-0.5 font-mono">
              {tempPassword}
            </code>
          </p>
          <button
            onClick={() => setTempPassword('')}
            className="mt-2 text-xs text-[var(--sage-500)] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 glass-card p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--slate-600)]">Name</label>
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--slate-600)]">Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
                required
              />
            </div>
            {currentUser?.role === 'ADMIN' && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[var(--slate-600)]">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as 'MENTOR' | 'INTERN' })}
                  className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
                >
                  <option value="INTERN">Intern</option>
                  <option value="MENTOR">Mentor</option>
                </select>
              </div>
            )}
          </div>
          {currentUser?.role === 'ADMIN' && form.role === 'MENTOR' && (
            <p className="mt-3 text-xs text-[var(--slate-400)]">
              After creating the mentor, use the &quot;Assign Interns&quot; button on their row to link interns to them.
            </p>
          )}
          <button
            type="submit"
            disabled={creating}
            className="mt-4 rounded-lg bg-[var(--primary-400)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      <div className="glass-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--card-border)]">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-[var(--slate-400)]">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-[var(--slate-400)]">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-[var(--slate-400)]">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-[var(--slate-400)]">Status</th>
              {currentUser?.role === 'ADMIN' && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-[var(--slate-400)]">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--slate-100)]">
                <td className="px-6 py-4 text-sm font-medium text-[var(--slate-800)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--slate-50)] text-xs font-bold text-[var(--slate-500)]">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--slate-400)]">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-[var(--slate-50)] px-2.5 py-0.5 text-xs font-medium text-[var(--slate-500)]">
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[u.status] || ''}`}>
                    {u.status}
                  </span>
                </td>
                {currentUser?.role === 'ADMIN' && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {u.role === 'MENTOR' && (
                        <button
                          onClick={() => openAssign(u)}
                          className="flex items-center gap-1.5 rounded-lg border border-[var(--primary-100)] bg-[var(--primary-50)] px-3 py-1.5 text-xs font-medium text-[var(--primary-600)] hover:bg-[var(--primary-50)]"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Assign Interns
                        </button>
                      )}
                      {u.role !== 'ADMIN' && u.status !== 'REMOVED' && (
                        <button
                          onClick={() => handleRemove(u)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-[var(--rose-50)] px-3 py-1.5 text-xs font-medium text-[var(--rose-500)] hover:bg-[var(--rose-50)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--card-bg)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--slate-800)]">Assign Interns</h2>
                <p className="text-sm text-[var(--slate-400)]">Mentor: {assignMentor.name}</p>
              </div>
              <button onClick={() => setAssignMentor(null)} className="text-[var(--slate-300)] hover:text-[var(--slate-500)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto px-6 py-4">
              {allInterns.length === 0 ? (
                <p className="text-sm text-[var(--slate-400)]">No interns exist yet. Create some interns first.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {allInterns.map((intern) => (
                    <label
                      key={intern.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--card-border)] px-3 py-2 hover:bg-[var(--slate-50)]"
                    >
                      <input
                        type="checkbox"
                        checked={assignSelected.includes(intern.id)}
                        onChange={() => toggleIntern(intern.id)}
                        className="h-4 w-4 rounded border-[var(--slate-200)]"
                      />
                      <div>
                        <p className="text-sm font-medium text-[var(--slate-800)]">{intern.name}</p>
                        <p className="text-xs text-[var(--slate-400)]">{intern.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[var(--card-border)] px-6 py-4">
              <button
                onClick={() => setAssignMentor(null)}
                className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm font-medium text-[var(--slate-600)] hover:bg-[var(--slate-50)]"
              >
                Cancel
              </button>
              <button
                onClick={saveAssignments}
                disabled={assignSaving}
                className="rounded-lg bg-[var(--primary-400)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-50"
              >
                {assignSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
     </div>
  );
}
 
