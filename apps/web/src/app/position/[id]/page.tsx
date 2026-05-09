'use client';

import * as React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, type Position, type Signal, type JournalEntry, type PortfolioDetail } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  PriceChart,
  RiskGauge,
  SignalCard,
  EmptyState,
  Button,
  Callout,
  MetricBlock,
  MetricsGrid,
  Textarea,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@openmoney/ui';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  BookOpen,
  Edit3,
  RefreshCw,
  AlertTriangle,
  X,
  Save,
  ChevronRight,
  DollarSign,
  Target,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '--';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: Math.abs(value) >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: Math.abs(value) >= 10_000 ? 1 : 2,
  }).format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) return '--';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '--';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

function generateMockChartData(days = 60): { time: string; open: number; high: number; low: number; close: number }[] {
  let price = 100 + Math.random() * 200;
  const data: { time: string; open: number; high: number; low: number; close: number }[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.5) * 6;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    data.push({
      time: date.toISOString().split('T')[0]!,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    });
    price = close;
  }
  return data;
}

/* -------------------------------------------------------------------------- */
/*  Position Detail Page                                                       */
/* -------------------------------------------------------------------------- */
export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const tickerFromQuery = searchParams?.get('ticker') ?? '';

  const [position, setPosition] = React.useState<Position | null>(null);
  const [signals, setSignals] = React.useState<Signal[]>([]);
  const [journalEntries, setJournalEntries] = React.useState<JournalEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [closing, setClosing] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [selectedPeriod, setSelectedPeriod] = React.useState('1M');

  const chartData = React.useMemo(() => generateMockChartData(), []);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      /* Fetch all portfolios to find the position */
      const portfolioRes = await api.portfolios.list();
      if (!portfolioRes.success) throw new Error(portfolioRes.error ?? 'Failed to load data');

      let foundPosition: Position | null = null;
      for (const p of portfolioRes.data) {
        try {
          const detailRes = await api.portfolios.get(p.id);
          if (detailRes.success) {
            const pos = detailRes.data.positions.find((pos) => pos.id === id);
            if (pos) {
              foundPosition = pos;
              break;
            }
          }
        } catch {
          /* skip portfolio if it fails */
        }
      }

      if (!foundPosition) throw new Error('Position not found');
      setPosition(foundPosition);
      setNotes('');

      /* Fetch signals and journal in parallel */
      const [signalsRes, journalRes] = await Promise.all([
        api.signals.list(),
        api.journal.list(),
      ]);

      if (signalsRes.success) {
        setSignals(signalsRes.data.filter((s) => s.ticker === foundPosition!.ticker));
      }
      if (journalRes.success) {
        setJournalEntries(journalRes.data.filter((j) => j.ticker === foundPosition!.ticker));
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      toast.error(err.message ?? 'Failed to load position');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClose = async () => {
    setClosing(true);
    try {
      const res = await api.positions.close(id);
      if (!res.success) throw new Error(res.error ?? 'Failed to close position');
      toast.success('Position closed');
      fetchData();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to close position');
    } finally {
      setClosing(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await api.positions.update(id, { notes: notes } as any);
      if (!res.success) throw new Error(res.error ?? 'Failed to save notes');
      toast.success('Notes saved');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  /* ---- Error ---- */
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle size={24} className="text-[var(--negative)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Failed to load position</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{error}</p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={14} />
              Retry
            </button>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--accent)] transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!position) return null;

  const ticker = tickerFromQuery || position.ticker;
  const isProfitable = (position.unrealizedPnl ?? 0) >= 0;
  const showSignalsSection = signals.length > 0;
  const showJournalSection = journalEntries.length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {/* Header */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                {ticker}
              </h1>
              {position.name && (
                <span className="text-sm text-[var(--text-secondary)] mt-1">
                  {position.name}
                </span>
              )}
              <Badge variant={position.isOpen ? 'default' : 'secondary'} className="text-[10px]">
                {position.isOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span>{position.assetClass}</span>
              <span>&middot;</span>
              <span>Opened {formatDate(position.openedAt)}</span>
              {position.closedAt && (
                <>
                  <span>&middot;</span>
                  <span>Closed {formatDate(position.closedAt)}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {position.isOpen && (
              <button
                onClick={handleClose}
                disabled={closing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
              >
                {closing ? 'Closing...' : 'Close Position'}
              </button>
            )}
          </div>
        </div>

        {/* Metric cards row */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Quantity</p>
            <p className="text-sm font-bold font-mono text-[var(--text-primary)]">{position.quantity}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Avg Entry</p>
            <p className="text-sm font-bold font-mono text-[var(--text-primary)]">{formatCurrency(position.avgEntryPrice)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Current Price</p>
            <p className="text-sm font-bold font-mono text-[var(--text-primary)]">{formatCurrency(position.currentPrice)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Cost Basis</p>
            <p className="text-sm font-bold font-mono text-[var(--text-primary)]">{formatCurrency(position.costBasis)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Market Value</p>
            <p className="text-sm font-bold font-mono text-[var(--text-primary)]">{formatCurrency(position.marketValue)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Unrealized P&L</p>
            <p className={`text-sm font-bold font-mono flex items-center gap-1 ${isProfitable ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
              {isProfitable ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {formatCurrency(position.unrealizedPnl)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">P&L %</p>
            <p className={`text-sm font-bold font-mono ${isProfitable ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
              {formatPercent(position.unrealizedPnlPercent)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Allocation</p>
            <p className="text-sm font-bold font-mono text-[var(--text-primary)]">
              {position.allocationPercent != null ? formatPercent(position.allocationPercent) : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 size={14} className="text-[var(--accent-brand)]" />
            {ticker} Price
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PriceChart
            selectedTimeframe={selectedPeriod}
            onTimeframeChange={setSelectedPeriod}
          >
            <div className="h-full w-full flex items-center justify-center text-sm text-[var(--text-secondary)]">
              {/* The PriceChart component renders its children inside the chart area.
                  In a production build, you'd pass actual chart data. */}
              <span>Chart data for {ticker} ({selectedPeriod})</span>
            </div>
          </PriceChart>
        </CardContent>
      </Card>

      {/* Risk Metrics + Signals row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield size={14} className="text-[var(--info)]" />
              Risk Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <RiskGauge
                  value={65}
                  max={100}
                  label="VaR Contribution"
                  size="sm"
                  segments={[
                    { value: 33.33, label: 'Low', color: 'var(--positive)' },
                    { value: 33.33, label: 'Medium', color: 'var(--warning)' },
                    { value: 33.34, label: 'High', color: 'var(--negative)' },
                  ]}
                />
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border border-[var(--border)] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Beta</p>
                  <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                    {(Math.random() * 2 + 0.2).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)]">vs. S&P 500</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Marginal VaR</p>
                  <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                    {(Math.random() * 3 + 0.5).toFixed(2)}%
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)]">95% confidence</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related signals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity size={14} className="text-[var(--accent-brand)]" />
              Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showSignalsSection ? (
              <div className="space-y-3">
                {signals.slice(0, 3).map((s) => (
                  <SignalCard
                    key={s.id}
                    title={s.title}
                    description={s.description}
                    action={(s.action as any) ?? 'hold'}
                    confidence={s.confidence ?? 50}
                    createdAt={s.createdAt}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity size={24} className="text-[var(--text-secondary)] mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">
                  No signals for {ticker} yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Journal entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen size={14} className="text-[var(--accent-brand)]" />
            Journal Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showJournalSection ? (
            <div className="space-y-3">
              {journalEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--accent)]/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/journal/${entry.id}`)}
                >
                  <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                    ${entry.direction === 'bullish' ? 'bg-green-500/10 text-[var(--positive)]' :
                      entry.direction === 'bearish' ? 'bg-red-500/10 text-[var(--negative)]' :
                      'bg-blue-500/10 text-[var(--info)]'}`}>
                    {entry.direction === 'bullish' ? '▲' : entry.direction === 'bearish' ? '▼' : '◆'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{entry.title}</p>
                      <span className="text-[10px] text-[var(--text-secondary)]">{entry.timeframe?.replace('_', ' ')}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{entry.thesis}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                      {formatDate(entry.createdAt)} &middot; Confidence: {entry.confidence}%
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-secondary)] shrink-0 mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen size={24} className="text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">
                No journal entries for {ticker}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Edit3 size={14} className="text-[var(--text-secondary)]" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              placeholder="Add your notes about this position..."
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              rows={4}
              className="w-full resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                size="sm"
              >
                {savingNotes ? (
                  <RefreshCw size={12} className="animate-spin mr-1.5" />
                ) : (
                  <Save size={12} className="mr-1.5" />
                )}
                Save Notes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
