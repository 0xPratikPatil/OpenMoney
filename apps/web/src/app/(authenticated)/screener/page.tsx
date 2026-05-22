'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { api } from '@/lib/api';
import {
  Card, CardContent, CardHeader, CardTitle, Button, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Skeleton, Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@openmoney/ui';
import {
  TrendingUp, TrendingDown, RefreshCw, Loader2, AlertTriangle,
  Search, Activity, Zap, Rocket, DollarSign, Target,
} from 'lucide-react';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Screener Presets                                                            */
/* -------------------------------------------------------------------------- */

const SCREENER_PRESETS = [
  { id: 'active',      label: 'Most Active',       model: 'equity/active',              icon: Activity,  description: 'Highest volume equities' },
  { id: 'gainers',     label: 'Top Gainers',        model: 'equity/gainers',             icon: TrendingUp, description: 'Biggest percentage gainers' },
  { id: 'losers',      label: 'Top Losers',         model: 'equity/losers',              icon: TrendingDown, description: 'Biggest percentage losers' },
  { id: 'growth-tech', label: 'Growth Tech',         model: 'equity/growth-tech',         icon: Rocket,    description: 'High-growth technology stocks' },
  { id: 'small-caps',  label: 'Aggressive Small Caps', model: 'equity/aggressive-small-caps', icon: Zap, description: 'Aggressive small-cap opportunities' },
  { id: 'undervalued', label: 'Undervalued Growth',   model: 'equity/undervalued-growth',   icon: Target,   description: 'Undervalued growth equities' },
  { id: 'large-caps',  label: 'Undervalued Large Caps', model: 'equity/undervalued-large-caps', icon: DollarSign, description: 'Undervalued large-cap value plays' },
] as const;

const PROVIDER = 'yfinance';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ScreenerResult {
  symbol: string;
  name?: string;
  price?: number;
  changePercent?: number;
  marketCap?: number;
  volume?: number;
  peRatio?: number;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number | undefined): string {
  if (value == null || isNaN(value)) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3)  return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatVolume(volume: number | undefined): string {
  if (volume == null || isNaN(volume)) return '—';
  if (volume >= 1e9)  return `${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6)  return `${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3)  return `${(volume / 1e3).toFixed(1)}K`;
  return String(volume);
}

function formatPercent(value: number | undefined): string {
  if (value == null || isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/* -------------------------------------------------------------------------- */
/*  ScreenerPage                                                               */
/* -------------------------------------------------------------------------- */

export default function ScreenerPage() {
  const [preset, setPreset] = React.useState<string>('active');
  const [results, setResults] = React.useState<ScreenerResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const currentPreset = SCREENER_PRESETS.find((p) => p.id === preset) ?? SCREENER_PRESETS[0]!;

  const fetchResults = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.market.providers.query(PROVIDER, currentPreset.model, { limit: 50 });
      if (!res.success) throw new Error(res.error?.message ?? 'Failed to fetch screener data');
      const data = (res.data as unknown as Array<Record<string, unknown>>) ?? [];
      setResults(data.map((r: Record<string, unknown>) => ({
        symbol: (r.symbol as string) ?? '',
        name: (r.name as string) ?? (r.shortName as string) ?? '',
        price: r.price as number | undefined,
        changePercent: r.changePercent as number | undefined,
        marketCap: r.marketCap as number | undefined,
        volume: r.volume as number | undefined,
        peRatio: r.peRatio as number | undefined,
      })));
    } catch (err: any) {
      setError(err.message ?? 'Failed to load screener data');
      toast.error('Screener query failed');
    } finally {
      setLoading(false);
    }
  }, [currentPreset.model]);

  React.useEffect(() => { fetchResults(); }, [fetchResults]);

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="space-y-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="ml-auto h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
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
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Screener fetch failed</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{error}</p>
          <button
            onClick={fetchResults}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent-brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const PresetIcon = currentPreset.icon;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <PresetIcon size={22} className="text-[var(--accent-brand)]" />
            Stock Screener
          </h1>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            Provider-backed preset screeners — {currentPreset.description}
          </p>
        </div>
        <button
          onClick={fetchResults}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-[var(--text-secondary)]">Preset:</span>
        <Select value={preset} onValueChange={(v) => setPreset(v)}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Choose a screener..." />
          </SelectTrigger>
          <SelectContent>
            {SCREENER_PRESETS.map((p) => {
              const PIcon = p.icon;
              return (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center gap-2">
                    <PIcon size={14} /> {p.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs font-mono">
          {PROVIDER} / {currentPreset.model}
        </Badge>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {results.length} results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change %</TableHead>
                <TableHead className="text-right hidden md:table-cell">Market Cap</TableHead>
                <TableHead className="text-right hidden md:table-cell">Volume</TableHead>
                <TableHead className="text-right hidden lg:table-cell">P/E</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-[var(--text-secondary)]">
                    <Search size={24} className="mx-auto mb-2 opacity-30" />
                    No results for this screener preset. Try another.
                  </TableCell>
                </TableRow>
              ) : (
                results.map((r) => (
                  <TableRow key={r.symbol} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <TableCell className="font-mono font-bold text-[var(--text-primary)]">{r.symbol}</TableCell>
                    <TableCell className="text-sm text-[var(--text-secondary)] max-w-[200px] truncate">
                      {r.name || r.symbol}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text-primary)]">
                      {formatCurrency(r.price)}
                    </TableCell>
                    <TableCell className={`text-right font-mono tabular-nums font-medium ${
                      (r.changePercent ?? 0) >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
                    }`}>
                      <span className="inline-flex items-center gap-1">
                        {(r.changePercent ?? 0) >= 0
                          ? <TrendingUp size={12} />
                          : <TrendingDown size={12} />}
                        {formatPercent(r.changePercent)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text-secondary)] text-sm hidden md:table-cell">
                      {formatCurrency(r.marketCap)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text-secondary)] text-sm hidden md:table-cell">
                      {formatVolume(r.volume)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text-secondary)] text-sm hidden lg:table-cell">
                      {r.peRatio != null ? r.peRatio.toFixed(1) : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-center justify-center gap-1.5 pt-2 pb-4 text-[10px] text-[var(--text-secondary)]">
        Data delayed 15–20 minutes. Powered by {PROVIDER} provider.
      </div>
    </div>
  );
}
