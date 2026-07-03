'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { User, Lock, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'profile' | 'password'>('profile');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1" style={{ maxWidth: 300 }}>
        <button onClick={() => setTab('profile')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${tab === 'profile' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}>
          <User className="h-4 w-4" /> Profile
        </button>
        <button onClick={() => setTab('password')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${tab === 'password' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}>
          <Lock className="h-4 w-4" /> Password
        </button>
      </div>

      {tab === 'profile' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                user?.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                user?.role === 'MENTOR' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }`}>{user?.role}</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-400">Status</p>
              <p className="text-sm font-medium text-gray-700">{user?.status}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-400">Member since</p>
              <p className="text-sm font-medium text-gray-700">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePasswordChange} className="max-w-md rounded-xl border border-gray-200 bg-white p-6">
          {message && (
            <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Current Password</label>
              <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Confirm New Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" required />
            </div>
          </div>
          <button type="submit" className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Save className="h-4 w-4" /> Change Password
          </button>
        </form>
      )}
    </div>
  );
}
