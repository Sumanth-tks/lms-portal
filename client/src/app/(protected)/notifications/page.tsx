'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Notification } from '@/types';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => { loadNotifications(); }, []);

  async function loadNotifications() {
    const res = await api.get('/dashboard/notifications');
    setNotifications(res.data.data.notifications);
    setUnreadCount(res.data.data.unreadCount);
    setLoading(false);
  }

  async function markAllRead() {
    await api.put('/dashboard/notifications/read');
    await loadNotifications();
  }

  async function markRead(ids: string[]) {
    await api.put('/dashboard/notifications/read', { ids });
    await loadNotifications();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
      </div>
    );
  }

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--slate-800)]">Notifications</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg bg-[var(--slate-50)] p-0.5">
            <button onClick={() => setFilter('all')} className={`rounded-md px-3 py-1.5 text-xs font-medium ${filter === 'all' ? 'bg-[var(--card-bg)] text-[var(--slate-800)] shadow-sm' : 'text-[var(--slate-400)]'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`rounded-md px-3 py-1.5 text-xs font-medium ${filter === 'unread' ? 'bg-[var(--card-bg)] text-[var(--slate-800)] shadow-sm' : 'text-[var(--slate-400)]'}`}>Unread</button>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 rounded-lg bg-[var(--primary-400)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--primary-600)]">
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="glass-card">
        <div className="divide-y divide-gray-100">
          {filtered.map((n) => (
            <div key={n.id} className={`flex items-start gap-4 px-6 py-4 ${!n.read ? 'bg-[var(--primary-50)]/50' : ''}`}>
              <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${!n.read ? 'bg-[var(--primary-50)]' : 'bg-[var(--slate-50)]'}`}>
                <Bell className={`h-4 w-4 ${!n.read ? 'text-[var(--primary-400)]' : 'text-[var(--slate-300)]'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium ${!n.read ? 'text-[var(--slate-800)]' : 'text-[var(--slate-400)]'}`}>{n.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--slate-300)]">{n.message}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-[var(--slate-300)]">{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  {n.link && (
                    <Link href={n.link} className="flex items-center gap-1 text-xs text-[var(--primary-400)] hover:text-[var(--primary-600)]">
                      <ExternalLink className="h-3 w-3" /> View
                    </Link>
                  )}
                  {!n.read && (
                    <button onClick={() => markRead([n.id])} className="flex items-center gap-1 text-xs text-[var(--slate-300)] hover:text-[var(--slate-500)]">
                      <Check className="h-3 w-3" /> Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="px-6 py-8 text-center text-sm text-[var(--slate-300)]">No notifications</p>}
        </div>
      </div>
    </div>
  );
}
