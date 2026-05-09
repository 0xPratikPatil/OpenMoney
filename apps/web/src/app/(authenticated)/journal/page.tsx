'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { api, type JournalEntry, type JournalStats } from '@/lib/api';
import {
  Button,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  JournalCard,
  EmptyState,
  Callout,
  MetricsGrid,
} from '@openmoney/ui';
import {
  Plus,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type JournalFilter = 'all' | 'open' | 'resolved' | 'bullish' | 'bearish';

const FILTER_TABS: { value: JournalFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'bullish', label: 'Bullish' },
  { value: 'bearish', label: 'Bearish' },
];

/* -------------------------------------------------------------------------- */
/*  Mappers                                                                    */
/* -------------------------------------------------------------------------- */

function mapEntryToCardProps(entry: JournalEntry, onAddOutcome?: (id: string) => void) {
  return {
    id: entry.id,
    title: entry.title,
    ticker: entry.ticker ?? undefined,
    direction: entry.direction as 'bullish' | 'bearish' | 'neutral',
    thesis: entry.thesis,
    catalysts: entry.catalysts
      ? entry.catalysts.split(',').map((s: string) => s.trim()).filter(Boolean)
      : undefined,
    timeframe: entry.timeframe.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    confidence: entry.confidence,
    actualOutcome: (entry.actualOutcome ?? 'unresolved') as
      | 'correct'
      | 'incorrect'
      | 'too_early'
      | 'too_late'
      | 'unresolved',
    createdAt: entry.createdAt,
    onAddOutcome,
  };
}

function formatAccuracy(accuracy: number | null): string {
  if (accuracy === null) return '—';
  return `${(accuracy * 100).toFixed(1)}%`;
}

function formatBrier(brier: number | null): string {
  if (brier === null) return '—';
  return brier.toFixed(3);
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function JournalListPage() {
  const router = useRouter();

  const [entries, setEntries] = React.useState<JournalEntry[]>([]);
  const [stats, setStats] = React.useState<JournalStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeFilter, setActiveFilter] = React.useState<JournalFilter>('all');

  /* ---- Data fetching ---- */

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [entriesRes, statsRes] = await Promise.all([
        api.journal.list(),
        api.journal.stats(),
      ]);
      if (!entriesRes.success) throw new Error(entriesRes.error ?? 'Failed to load entries');
      if (!statsRes.success) throw new Error(statsRes.error ?? 'Failed to load stats');
      setEntries(entriesRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      toast.error(err.message ?? 'Failed to load journal');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- Filter logic ---- */

  const filteredEntries = React.useMemo(() => {
    switch (activeFilter) {
      case 'open':
        return entries.filter((e) => !e.actualOutcome);
      case 'resolved':
        return entries.filter((e) => e.actualOutcome);
      case 'bullish':
        return entries.filter((e) => e.direction === 'bullish');
      case 'bearish':
        return entries.filter((e) => e.direction === 'bearish');
      default:
        return entries;
    }
  }, [entries, activeFilter]);

  /* ---- Handlers ---- */

  const handleAddOutcome = React.useCallback(
    (id: string) => {
      router.push(`/journal/${id}`);
    },
    [router],
  );

  const statsItems = React.useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: 'Total Entries',
        value: stats.total.toString(),
        trend: undefined as 'up' | 'down' | 'neutral' | undefined,
      },
      {
        label: 'Resolved',
        value: stats.resolved.toString(),
        trend: undefined as 'up' | 'down' | 'neutral' | undefined,
      },
      {
        label: 'Accuracy',
        value: formatAccuracy(stats.accuracy),
        trend: (stats.accuracy !== null && stats.accuracy >= 0.5 ? 'up' : 'down') as 'up' | 'down' | 'neutral' | undefined,
      },
      {
        label: 'Brier Score',
        value: formatBrier(stats.brierScore),
        trend: (stats.brierScore !== null && stats.brierScore <= 0.25 ? 'up' : stats.brierScore !== null ? 'down' : undefined) as 'up' | 'down' | 'neutral' | undefined,
      },
    ];
  }, [stats]);

  /* ======== Loading State ======== */

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Metrics skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-3"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <Skeleton className="h-9 w-full max-w-md" />

        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-4"
            >
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ======== Error State ======== */

  if (error && !entries.length) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Callout variant="error" title="Failed to load journal">
          <p className="mb-3">{error}</p>
          <Button
            onClick={fetchData}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Retry
          </Button>
        </Callout>
      </div>
    );
  }

  /* ======== Main Content ======== */

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Investment Journal</h1>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            Log your investment theses and track your prediction accuracy
          </p>
        </div>
        <Button onClick={() => router.push('/journal/new')}>
          <Plus size={14} className="mr-1.5" />
          New Entry
        </Button>
      </div>

      {/* Stats */}
      {statsItems.length > 0 && (
        <MetricsGrid items={statsItems} columns={4} />
      )}

      {/* Filter Tabs */}
      <Tabs
        value={activeFilter}
        onValueChange={(v) => setActiveFilter(v as JournalFilter)}
      >
        <TabsList>
          {FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Content */}
      {filteredEntries.length === 0 ? (
        <div className="mt-6">
          {activeFilter === 'all' ? (
            <EmptyState.Journal
              action={{
                label: 'Write first entry',
                onClick: () => router.push('/journal/new'),
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] py-16">
              <Filter size={32} className="text-[var(--text-secondary)] mb-3" />
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                No entries match this filter
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Try a different filter or create a new entry.
              </p>
              <Button
                onClick={() => setActiveFilter('all')}
                className="mt-4"
                variant="outline"
              >
                View all entries
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => router.push(`/journal/${entry.id}`)}
              className="cursor-pointer transition-colors hover:opacity-90"
            >
              <JournalCard {...mapEntryToCardProps(entry, handleAddOutcome)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

