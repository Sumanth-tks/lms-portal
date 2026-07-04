'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { User, Lock, Save, Sun, Moon, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [tab, setTab] = useState<'profile' | 'password' | 'appearance'>('profile');
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

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun, description: 'Classic light appearance' },
    { value: 'dark' as const, label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { value: 'system' as const, label: 'System', icon: Monitor, description: 'Match your device settings' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[var(--slate-800)]">Settings</h1>

      <div className="mb-6 flex gap-1 rounded-xl bg-[var(--slate-50)] p-1" style={{ maxWidth: 440 }}>
        <button onClick={() => setTab('profile')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${tab === 'profile' ? 'bg-[var(--card-bg)] text-[var(--primary-600)] shadow-sm' : 'text-[var(--slate-400)]'}`}>
          <User className="h-4 w-4" /> Profile
        </button>
        <button onClick={() => setTab('password')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${tab === 'password' ? 'bg-[var(--card-bg)] text-[var(--primary-600)] shadow-sm' : 'text-[var(--slate-400)]'}`}>
          <Lock className="h-4 w-4" /> Password
        </button>
        <button onClick={() => setTab('appearance')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${tab === 'appearance' ? 'bg-[var(--card-bg)] text-[var(--primary-600)] shadow-sm' : 'text-[var(--slate-400)]'}`}>
          <Sun className="h-4 w-4" /> Appearance
        </button>
      </div>

      {tab === 'profile' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary-50)] text-2xl font-bold text-[var(--primary-400)]">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--slate-800)]">{user?.name}</h2>
              <p className="text-sm text-[var(--slate-400)]">{user?.email}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                user?.role === 'ADMIN' ? 'bg-[var(--rose-50)] text-[var(--rose-500)]' :
                user?.role === 'MENTOR' ? 'bg-[var(--primary-50)] text-[var(--primary-600)]' :
                'bg-[var(--sage-50)] text-[var(--sage-500)]'
              }`}>{user?.role}</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[var(--slate-50)] px-4 py-3">
              <p className="text-xs text-[var(--slate-300)]">Status</p>
              <p className="text-sm font-medium text-[var(--slate-600)]">{user?.status}</p>
            </div>
            <div className="rounded-lg bg-[var(--slate-50)] px-4 py-3">
              <p className="text-xs text-[var(--slate-300)]">Member since</p>
              <p className="text-sm font-medium text-[var(--slate-600)]">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePasswordChange} className="max-w-md glass-card p-6">
          {message && (
            <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${message.type === 'success' ? 'bg-[var(--sage-50)] text-[var(--sage-500)]' : 'bg-[var(--rose-50)] text-[var(--rose-500)]'}`}>
              {message.text}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-[var(--slate-400)]">Current Password</label>
              <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--slate-400)]">New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--slate-400)]">Confirm New Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm" required />
            </div>
          </div>
          <button type="submit" className="mt-6 flex items-center gap-2 rounded-lg bg-[var(--primary-400)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]">
            <Save className="h-4 w-4" /> Change Password
          </button>
        </form>
      )}

      {tab === 'appearance' && (
        <div className="max-w-lg glass-card p-6">
          <h2 className="mb-1 text-lg font-bold text-[var(--slate-800)]">Theme</h2>
          <p className="mb-5 text-sm text-[var(--slate-400)]">Choose how the application looks to you.</p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`liquid-control flex flex-col items-center gap-2 rounded-xl px-4 py-5 text-center transition-all ${
                    isActive
                      ? 'border-[var(--primary-400)] ring-2 ring-[var(--primary-400)]/20'
                      : ''
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'text-[var(--primary-500)]' : 'text-[var(--slate-400)]'}`} />
                  <span className={`text-sm font-medium ${isActive ? 'text-[var(--primary-600)]' : 'text-[var(--slate-600)]'}`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-[var(--slate-400)]">{opt.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
