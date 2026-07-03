'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Login failed';
      setError(message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Gradient background with color orbs */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 25% 30%, rgba(59,108,181,0.35) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 60%, rgba(107,63,160,0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 10%, rgba(255,255,255,0.5) 0%, transparent 40%),
            radial-gradient(circle at 60% 40%, rgba(45,122,79,0.15) 0%, transparent 35%),
            linear-gradient(160deg, #E8EEF5, #DEE6F0, #D5DFEB, #E2EAF3)
          `,
        }}
      />

      {/* Glass login card */}
      <div
        className="relative z-10 w-full max-w-md rounded-[20px] p-8"
        style={{
          background: 'rgba(255, 255, 255, 0.42)',
          backdropFilter: 'blur(50px) saturate(1.9)',
          WebkitBackdropFilter: 'blur(50px) saturate(1.9)',
          border: '0.5px solid rgba(255, 255, 255, 0.55)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -0.5px 0 rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div className="mb-8 flex flex-col items-center">
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(59, 108, 181, 0.2)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              border: '0.5px solid rgba(59, 108, 181, 0.15)',
              boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(59,108,181,0.1)',
            }}
          >
            <GraduationCap className="h-8 w-8 text-[var(--primary-600)]" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--slate-800)]">
            Kantaka Sodhana
          </h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">
            Learning Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="rounded-lg p-3 text-sm"
              style={{
                background: 'rgba(181, 59, 59, 0.1)',
                color: 'var(--danger-500)',
                border: '0.5px solid rgba(181, 59, 59, 0.08)',
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--slate-600)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full px-4 py-2.5 text-sm text-[var(--slate-700)] outline-none transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--slate-600)]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full px-4 py-2.5 text-sm text-[var(--slate-700)] outline-none transition"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50"
            style={{
              background: 'rgba(59, 108, 181, 0.8)',
              backdropFilter: 'blur(15px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(15px) saturate(1.4)',
              border: '0.5px solid rgba(59, 108, 181, 0.25)',
              boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.18), 0 2px 8px rgba(59,108,181,0.15)',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
