'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Badge, EarnedBadge, LeaderboardEntry, XpLog, User } from '@/types';
import { Award, Zap, Trophy, Flame, Crown } from 'lucide-react';

type Tab = 'badges' | 'leaderboard' | 'xp';

const BADGE_ICONS: Record<string, string> = {
  code: '💻', attendance: '📅', quiz: '🧠', tasks: '✅',
  standup: '🌅', social: '🤝', hackathon: '🏆', capstone: '🚀',
};

export default function GamificationPage() {
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';
  const [tab, setTab] = useState<Tab>('badges');

  const [badges, setBadges] = useState<Badge[]>([]);
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [xpLogs, setXpLogs] = useState<XpLog[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [interns, setInterns] = useState<User[]>([]);

  const [awardIntern, setAwardIntern] = useState('');
  const [awardBadge, setAwardBadge] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
    loadLeaderboard();
    loadXp();
    if (!isIntern) {
      api.get('/users?role=INTERN').then((r) => setInterns(r.data.data || []));
    }
  }, []);

  async function loadBadges() {
    const res = await api.get('/gamification/badges');
    setBadges(res.data.data.badges);
    setEarned(res.data.data.earned);
    setLoading(false);
  }

  async function loadLeaderboard() {
    const res = await api.get('/gamification/leaderboard');
    setLeaderboard(res.data.data);
  }

  async function loadXp() {
    const res = await api.get('/gamification/xp');
    setXpLogs(res.data.data.logs);
    setTotalXp(res.data.data.totalXp);
  }

  async function handleAward() {
    if (!awardIntern || !awardBadge) return;
    await api.post('/gamification/badges/award', { internId: awardIntern, badgeId: awardBadge });
    setAwardIntern('');
    setAwardBadge('');
    loadBadges();
    loadLeaderboard();
    loadXp();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
      </div>
    );
  }

  const earnedIds = new Set(earned.map((e) => e.badgeId));
  const tabs: { key: Tab; label: string; icon: typeof Award }[] = [
    { key: 'badges', label: 'Badges', icon: Award },
    { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { key: 'xp', label: 'XP History', icon: Zap },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--slate-800)]">Gamification</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">Badges, XP, and leaderboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--gold-50)] px-4 py-2">
            <Zap className="h-5 w-5 text-[var(--gold-500)]" />
            <span className="text-lg font-bold text-[var(--gold-500)]">{totalXp} XP</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-[var(--slate-50)] p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-[var(--card-bg)] text-[var(--primary-600)] shadow-sm' : 'text-[var(--slate-400)] hover:text-[var(--slate-600)]'}`}>
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Badges Tab */}
      {tab === 'badges' && (
        <div>
          {!isIntern && (
            <div className="mb-6 flex items-end gap-3 glass-card p-4">
              <select value={awardIntern} onChange={(e) => setAwardIntern(e.target.value)} className="rounded-lg border border-[var(--slate-200)] px-3 py-2 text-sm">
                <option value="">Select intern...</option>
                {interns.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <select value={awardBadge} onChange={(e) => setAwardBadge(e.target.value)} className="rounded-lg border border-[var(--slate-200)] px-3 py-2 text-sm">
                <option value="">Select badge...</option>
                {badges.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <button onClick={handleAward} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">Award Badge</button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => {
              const isEarned = earnedIds.has(badge.id);
              return (
                <div key={badge.id} className={`rounded-xl border p-5 transition-colors ${isEarned ? 'border-amber-200 bg-[var(--gold-50)]' : 'border-[var(--card-border)] bg-[var(--card-bg)] opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{BADGE_ICONS[badge.category] || '🏅'}</span>
                    <div>
                      <h3 className={`text-sm font-bold ${isEarned ? 'text-amber-800' : 'text-[var(--slate-400)]'}`}>{badge.name}</h3>
                      <p className="text-xs text-[var(--slate-300)]">{badge.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full bg-[var(--slate-50)] px-2 py-0.5 text-xs text-[var(--slate-400)]">{badge.category}</span>
                    <span className="flex items-center gap-1 text-xs font-medium text-[var(--gold-500)]">
                      <Zap className="h-3 w-3" /> +{badge.xpReward} XP
                    </span>
                  </div>
                  {isEarned && (
                    <p className="mt-2 text-xs font-medium text-[var(--sage-500)]">✓ Earned {new Date(earned.find((e) => e.badgeId === badge.id)?.earnedAt || '').toLocaleDateString('en-IN')}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {tab === 'leaderboard' && (
        <div className="glass-card">
          <div className="divide-y divide-gray-100">
            {leaderboard.map((entry) => (
              <div key={entry.intern.id} className={`flex items-center justify-between px-6 py-4 ${entry.rank <= 3 ? 'bg-[var(--gold-50)]/50' : ''}`}>
                <div className="flex items-center gap-4">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    entry.rank === 1 ? 'bg-amber-200 text-amber-800' :
                    entry.rank === 2 ? 'bg-[var(--slate-200)] text-[var(--slate-600)]' :
                    entry.rank === 3 ? 'bg-orange-200 text-orange-800' :
                    'bg-[var(--slate-50)] text-[var(--slate-400)]'
                  }`}>
                    {entry.rank <= 3 ? <Crown className="h-5 w-5" /> : entry.rank}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--slate-800)]">{entry.intern.name}</p>
                    <div className="flex items-center gap-3 text-xs text-[var(--slate-300)]">
                      <span className="flex items-center gap-0.5"><Award className="h-3 w-3" /> {entry.badgeCount} badges</span>
                      <span className="flex items-center gap-0.5"><Flame className="h-3 w-3" /> {entry.streak} streak</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[var(--gold-500)]" />
                  <span className="text-xl font-bold text-[var(--gold-500)]">{entry.totalXp}</span>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="px-6 py-8 text-center text-sm text-[var(--slate-300)]">No XP earned yet</p>}
          </div>
        </div>
      )}

      {/* XP History Tab */}
      {tab === 'xp' && (
        <div className="glass-card">
          <div className="divide-y divide-gray-100">
            {xpLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-[var(--slate-800)]">{log.reason}</p>
                  <p className="text-xs text-[var(--slate-300)]">{log.intern?.name} — {new Date(log.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <span className="flex items-center gap-1 text-sm font-bold text-[var(--sage-500)]">
                  +{log.amount} <Zap className="h-4 w-4 text-[var(--gold-500)]" />
                </span>
              </div>
            ))}
            {xpLogs.length === 0 && <p className="px-6 py-8 text-center text-sm text-[var(--slate-300)]">No XP activity yet</p>}
          </div>
        </div>
      )}
    </div>
  );
}
