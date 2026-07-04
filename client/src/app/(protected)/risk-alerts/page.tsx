'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  AlertTriangle, Shield, TrendingDown, Clock, GitBranch,
  ClipboardCheck, MessageSquare, Rocket, ListChecks, ChevronDown,
  ChevronUp, ShieldAlert, ShieldCheck,
} from 'lucide-react';

interface RiskAlert {
  type: string;
  severity: 'critical' | 'warning';
  message: string;
  value: number;
  threshold: number;
}

interface InternRisk {
  intern: { id: string; name: string; email: string };
  riskScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  alerts: RiskAlert[];
}

interface RiskData {
  totalAtRisk: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  alerts: InternRisk[];
}

const alertIcons: Record<string, React.ReactNode> = {
  LOW_ATTENDANCE: <ClipboardCheck className="h-4 w-4" />,
  MISSED_STANDUPS: <MessageSquare className="h-4 w-4" />,
  STALLED_CAPSTONE: <Rocket className="h-4 w-4" />,
  DECLINING_GRADES: <TrendingDown className="h-4 w-4" />,
  NO_COMMITS: <GitBranch className="h-4 w-4" />,
  LOW_TASK_COMPLETION: <ListChecks className="h-4 w-4" />,
};

export default function RiskAlertsPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIntern, setExpandedIntern] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MENTOR';

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.get('/risk-alerts');
      setData(res.data.data);
    } catch { /* handled */ } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="liquid-card flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
        <Shield className="mb-3 h-10 w-10 text-[var(--slate-300)]" />
        <p className="text-sm font-medium text-[var(--slate-500)]">Access Restricted</p>
        <p className="mt-1 text-xs text-[var(--slate-400)]">Risk alerts are only visible to admins and mentors</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
      </div>
    );
  }

  const filteredAlerts = data?.alerts.filter((a) => filter === 'all' || a.riskLevel === filter) || [];

  return (
    <div className="liquid-enter space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--slate-800)]">Intern Risk Alerts</h1>
        <p className="mt-1 text-sm text-[var(--slate-400)]">
          Automated monitoring of intern engagement and performance
        </p>
      </header>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button onClick={() => setFilter('all')} className={`liquid-card p-4 text-center transition ${filter === 'all' ? 'ring-2 ring-[var(--primary-400)]' : ''}`}>
            <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-[var(--slate-400)]" />
            <p className="text-2xl font-semibold text-[var(--slate-800)]">{data.totalAtRisk}</p>
            <p className="text-xs text-[var(--slate-400)]">Total At Risk</p>
          </button>
          <button onClick={() => setFilter('high')} className={`liquid-card p-4 text-center transition ${filter === 'high' ? 'ring-2 ring-[var(--danger-500)]' : ''}`}>
            <ShieldAlert className="mx-auto mb-2 h-5 w-5 text-[var(--danger-500)]" />
            <p className="text-2xl font-semibold text-[var(--danger-500)]">{data.highRisk}</p>
            <p className="text-xs text-[var(--slate-400)]">High Risk</p>
          </button>
          <button onClick={() => setFilter('medium')} className={`liquid-card p-4 text-center transition ${filter === 'medium' ? 'ring-2 ring-[var(--gold-500)]' : ''}`}>
            <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-[var(--gold-500)]" />
            <p className="text-2xl font-semibold text-[var(--gold-500)]">{data.mediumRisk}</p>
            <p className="text-xs text-[var(--slate-400)]">Medium Risk</p>
          </button>
          <button onClick={() => setFilter('low')} className={`liquid-card p-4 text-center transition ${filter === 'low' ? 'ring-2 ring-[var(--sage-500)]' : ''}`}>
            <ShieldCheck className="mx-auto mb-2 h-5 w-5 text-[var(--sage-500)]" />
            <p className="text-2xl font-semibold text-[var(--sage-500)]">{data.lowRisk}</p>
            <p className="text-xs text-[var(--slate-400)]">Low Risk</p>
          </button>
        </div>
      )}

      {/* Intern list */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="liquid-card flex min-h-[200px] flex-col items-center justify-center p-8 text-center">
            <ShieldCheck className="mb-3 h-8 w-8 text-[var(--sage-500)]" />
            <p className="text-sm font-medium text-[var(--slate-500)]">
              {filter === 'all' ? 'All interns are on track' : `No ${filter} risk interns`}
            </p>
            <p className="mt-1 text-xs text-[var(--slate-400)]">No risk alerts detected</p>
          </div>
        ) : (
          filteredAlerts.map((item) => (
            <div key={item.intern.id} className="liquid-card overflow-hidden">
              <button
                onClick={() => setExpandedIntern(expandedIntern === item.intern.id ? null : item.intern.id)}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                {/* Risk level indicator */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  item.riskLevel === 'high'
                    ? 'bg-[rgba(181,59,59,0.15)] text-[var(--danger-500)]'
                    : item.riskLevel === 'medium'
                    ? 'bg-[rgba(154,107,30,0.15)] text-[var(--gold-500)]'
                    : 'bg-[rgba(45,122,79,0.15)] text-[var(--sage-500)]'
                }`}>
                  {item.riskLevel === 'high' ? <ShieldAlert className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--slate-700)]">{item.intern.name}</p>
                  <p className="text-xs text-[var(--slate-400)]">
                    {item.alerts.length} alert{item.alerts.length !== 1 ? 's' : ''} &middot; Risk score: {item.riskScore}
                  </p>
                </div>

                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  item.riskLevel === 'high'
                    ? 'bg-[var(--danger-50)] text-[var(--danger-500)]'
                    : item.riskLevel === 'medium'
                    ? 'bg-[var(--gold-50)] text-[var(--gold-500)]'
                    : 'bg-[var(--sage-50)] text-[var(--sage-500)]'
                }`}>
                  {item.riskLevel.toUpperCase()}
                </span>

                {expandedIntern === item.intern.id
                  ? <ChevronUp className="h-4 w-4 shrink-0 text-[var(--slate-400)]" />
                  : <ChevronDown className="h-4 w-4 shrink-0 text-[var(--slate-400)]" />
                }
              </button>

              {/* Expanded alerts */}
              {expandedIntern === item.intern.id && (
                <div className="border-t border-white/20 px-5 pb-5 pt-3">
                  <p className="mb-2 text-xs text-[var(--slate-400)]">{item.intern.email}</p>
                  <div className="space-y-2">
                    {item.alerts.map((alert, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                          alert.severity === 'critical'
                            ? 'bg-[rgba(181,59,59,0.08)] text-[var(--danger-500)]'
                            : 'bg-[rgba(154,107,30,0.08)] text-[var(--gold-500)]'
                        }`}
                      >
                        <span className="shrink-0">{alertIcons[alert.type] || <AlertTriangle className="h-4 w-4" />}</span>
                        <span className="flex-1">{alert.message}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          alert.severity === 'critical'
                            ? 'bg-[var(--danger-50)] text-[var(--danger-500)]'
                            : 'bg-[var(--gold-50)] text-[var(--gold-500)]'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
