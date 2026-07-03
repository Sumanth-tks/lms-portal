'use client';

import { MessageCircle, ExternalLink, Users, Mic, Hash } from 'lucide-react';

export default function DiscordPage() {
  const DISCORD_INVITE = 'https://discord.gg/d4xyX2njKw';

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--slate-800)]">Live Sessions</h1>

      <div className="glass-card p-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100">
          <MessageCircle className="h-10 w-10 text-indigo-600" />
        </div>

        <h2 className="text-xl font-bold text-[var(--slate-800)]">Join Our Discord Server</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--slate-400)]">
          All live sessions, doubt clearing, and team discussions happen on Discord.
          Join the server to stay connected with mentors and fellow interns.
        </p>

        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <ExternalLink className="h-4 w-4" />
          Join Discord Server
        </a>

        <div className="mt-10 grid grid-cols-3 gap-6">
          <div className="rounded-xl bg-[var(--slate-50)] p-4">
            <Hash className="mx-auto mb-2 h-6 w-6 text-[var(--slate-300)]" />
            <p className="text-sm font-medium text-[var(--slate-600)]">Channels</p>
            <p className="mt-1 text-xs text-[var(--slate-400)]">Topic-wise discussion channels for each week</p>
          </div>
          <div className="rounded-xl bg-[var(--slate-50)] p-4">
            <Mic className="mx-auto mb-2 h-6 w-6 text-[var(--slate-300)]" />
            <p className="text-sm font-medium text-[var(--slate-600)]">Live Sessions</p>
            <p className="mt-1 text-xs text-[var(--slate-400)]">Saturday learning sessions and demos</p>
          </div>
          <div className="rounded-xl bg-[var(--slate-50)] p-4">
            <Users className="mx-auto mb-2 h-6 w-6 text-[var(--slate-300)]" />
            <p className="text-sm font-medium text-[var(--slate-600)]">Community</p>
            <p className="mt-1 text-xs text-[var(--slate-400)]">Connect with mentors and peers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
