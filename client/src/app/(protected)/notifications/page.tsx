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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5">
            <button onClick={() => setFilter('all')} className={`rounded-md px-3 py-1.5 text-xs font-medium ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`rounded-md px-3 py-1.5 text-xs font-medium ${filter === 'unread' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Unread</button>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="divide-y divide-gray-100">
          {filtered.map((n) => (
            <div key={n.id} className={`flex items-start gap-4 px-6 py-4 ${!n.read ? 'bg-blue-50/50' : ''}`}>
              <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${!n.read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Bell className={`h-4 w-4 ${!n.read ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-500'}`}>{n.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{n.message}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-gray-400">{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  {n.link && (
                    <Link href={n.link} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                      <ExternalLink className="h-3 w-3" /> View
                    </Link>
                  )}
                  {!n.read && (
                    <button onClick={() => markRead([n.id])} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                      <Check className="h-3 w-3" /> Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No notifications</p>}
        </div>
      </div>
    </div>
  );
}
