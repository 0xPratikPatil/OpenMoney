'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { api, type Portfolio, type ActionRecommendation } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Skeleton,
  SignalCard,
  SignalTimeline,
  EmptyState,
  DataFreshnessIndicator,
  Callout,
} from '@openmoney/ui';
import {
  Lightbulb,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */
type ActionGroup = 'hold' | 'add' | 'reduce' | 'exit' | 'rebalance' | 'hedge';

const ACTION_META: Record<ActionGroup, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  hold: {
    label: 'Hold',
    icon: <CheckCircle2 size={14} />,
    color: 'text-[var(--positive)]',
    bg: 'bg-green-500/10',
  },
  add: {
    label: 'Add',
    icon: <TrendingUp size={14} />,
    color: 'text-[var(--positive)]',
    bg: 'bg-green-500/10',
  },
  reduce: {
    label: 'Reduce',
    icon: <TrendingDown size={14} />,
    color: 'text-[var(--warning)]',
    bg: 'bg-amber-500/10',
  },
  exit: {
    label: 'Exit',
    icon: <AlertCircle size={14} />,
    color: 'text-[var(--negative)]',
    bg: 'bg-red-500/10',
  },
  rebalance: {
    label: 'Rebalance',
    icon: <Activity size={14} />,
    color: 'text-[var(--info)]',
    bg: 'bg-blue-500/10',
  },
  hedge: {
    label: 'Hedge',
    icon: <Shield size={14} />,
    color: 'text-[var(--info)]',
    bg: 'bg-blue-500/10',
  },
};

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

function formatTimeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

function confidenceLabel(score: number): string {
  if (score >= 80) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

function confidenceColor(score: number): string {
  if (score >= 80) return 'bg-green-500/15 text-green-400 border-green-500/30';
  if (score >= 50) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  return 'bg-red-500/15 text-red-400 border-red-500/30';
}

/* -------------------------------------------------------------------------- */
/*  Recommendations Page                                                       */
/* -------------------------------------------------------------------------- */
export default function RecommendationsPage() {
  const router = useRouter();

  const [portfolios, setPortfolios] = React.useState<Portfolio[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [recommendations, setRecommendations] = React.useState<ActionRecommendation[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = React.useState(true);
  const [loadingRecs, setLoadingRecs] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /* Fetch portfolios */
  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.portfolios.list();
        if (res.success && res.data.length > 0) {
          setPortfolios(res.data);
          setSelectedId(res.data[0].id);
        }
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to load portfolios');
      } finally {
        setLoadingPortfolios(false);
      }
    })();
  }, []);

  /* Fetch recommendations */
  const fetchRecs = React.useCallback(async (id: string) => {
    setLoadingRecs(true);
    setError(null);
    try {
      const res = await api.portfolios.recommendations(id);
      if (!res.success) throw new Error(res.error ?? 'Failed to load recommendations');
      setRecommendations(res.data);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      toast.error(err.message ?? 'Failed to load recommendations');
    } finally {
      setLoadingRecs(false);
    }
  }, []);

  React.useEffect(() => {
    if (selectedId) fetchRecs(selectedId);
  }, [selectedId, fetchRecs]);

  const selectedPortfolio = portfolios.find((p) => p.id === selectedId);
  const hasPortfolios = portfolios.length > 0;

  /* Group recommendations by action */
  const grouped = React.useMemo(() => {
    const groups: Record<string, ActionRecommendation[]> = {};
    for (const rec of recommendations) {
      const key = rec.action;
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    }
    return groups;
  }, [recommendations]);

  const actionOrder: ActionGroup[] = ['hold', 'add', 'reduce', 'exit', 'rebalance', 'hedge'];

  const healthScore = React.useMemo(() => {
    if (recommendations.length === 0) return 100;
    const weighted = recommendations.reduce((score, rec) => {
      if (rec.action === 'exit') return score - 20;
      if (rec.action === 'reduce') return score - 10;
      if (rec.action === 'hedge') return score - 5;
      if (rec.action === 'rebalance') return score - 3;
      if (rec.action === 'add') return score + 2;
      return score + 1;
    }, 100);
    return Math.max(0, Math.min(100, weighted));
  }, [recommendations]);

  /* ---- No Portfolios ---- */
  if (!loadingPortfolios && !hasPortfolios) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Recommendations</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Data-driven action signals for your portfolio
          </p>
        </div>
        <EmptyState
          title="No portfolios found"
          description="Create a portfolio to receive actionable recommendations."
          action={{
            label: 'Create Portfolio',
            onClick: () => router.push('/portfolio'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Recommendations</h1>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            Actionable signals generated from your portfolio data
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loadingPortfolios ? (
            <Skeleton className="h-9 w-48 rounded-lg" />
          ) : (
            <Select value={selectedId ?? undefined} onValueChange={(v: string) => setSelectedId(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select portfolio" />
              </SelectTrigger>
              <SelectContent>
                {portfolios.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <button
            onClick={() => selectedId && fetchRecs(selectedId)}
            disabled={loadingRecs || !selectedId}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={14} className={loadingRecs ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary card */}
      {selectedPortfolio && !loadingRecs && !error && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Health score */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center">
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke={healthScore >= 70 ? 'var(--positive)' : healthScore >= 40 ? 'var(--warning)' : 'var(--negative)'}
                    strokeWidth="3"
                    strokeDasharray={`${(healthScore / 100) * 97.4} 97.4`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-[var(--text-primary)]">{healthScore}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Portfolio Health</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {selectedPortfolio.name}
                </p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-[var(--border)]" />

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Active Recommendations</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{recommendations.length}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Actions Needed</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {recommendations.filter((r) => r.action !== 'hold').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Loading ---- */}
      {loadingRecs && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-1 h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* ---- Error ---- */}
      {error && !loadingRecs && (
        <Callout variant="error" title="Failed to load recommendations">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => selectedId && fetchRecs(selectedId)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-brand)] hover:underline"
          >
            <RefreshCw size={12} />
            Try again
          </button>
        </Callout>
      )}

      {/* ---- Empty State (no recommendations) ---- */}
      {!loadingRecs && !error && selectedId && recommendations.length === 0 && (
        <EmptyState
          title="No active recommendations"
          description="Your portfolio is looking good! Recommendations will appear here when our engine identifies opportunities or risks."
          action={{
            label: 'Refresh',
            onClick: () => selectedId && fetchRecs(selectedId),
          }}
        />
      )}

      {/* ---- Recommendations by Action Group ---- */}
      {!loadingRecs && !error && recommendations.length > 0 && (
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock size={14} />
                Signal Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SignalTimeline
                signals={recommendations.map((r) => ({
                  id: r.id,
                  title: r.title,
                  description: r.reasoning.join('. '),
                  action: (r.action === 'hedge' ? 'hold' : r.action) as 'hold' | 'add' | 'reduce' | 'exit' | 'rebalance',
                  confidence: r.confidence,
                  createdAt: r.createdAt,
                }))}
              />
            </CardContent>
          </Card>

          {/* Grouped action cards */}
          {actionOrder.map((action) => {
            const items = grouped[action];
            if (!items || items.length === 0) return null;
            const meta = ACTION_META[action];

            return (
              <div key={action}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full ${meta.bg}`}>
                    {meta.icon}
                  </div>
                  <h3 className={`text-sm font-semibold ${meta.color}`}>
                    {meta.label}
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {items.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((rec) => (
                    <SignalCard
                      key={rec.id}
                      title={rec.title}
                      description={rec.reasoning.join('. ')}
                      action={(rec.action === 'hedge' ? 'hold' : rec.action) as 'hold' | 'add' | 'reduce' | 'exit' | 'rebalance'}
                      confidence={rec.confidence}
                      reasoning={rec.reasoning}
                      createdAt={rec.createdAt}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Data freshness */}
      {selectedPortfolio && !loadingRecs && (
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Info size={12} />
          Recommendations refresh automatically as market data and portfolio positions change.
        </div>
      )}
    </div>
  );
}

