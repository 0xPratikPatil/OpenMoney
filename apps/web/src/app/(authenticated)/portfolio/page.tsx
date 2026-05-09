'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { api, type Portfolio, type PortfolioSummary } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  EmptyState,
  Button,
  Input,
} from '@openmoney/ui';
import {
  Briefcase,
  Plus,
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';
import { PortfolioFormDialog } from './_components/portfolio-form-dialog';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: value >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 10_000 ? 1 : 2,
  }).format(value);
}

function formatPercent(value: number): string {
  if (value == null) return '--';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/* -------------------------------------------------------------------------- */
/*  Portfolio List Page                                                        */
/* -------------------------------------------------------------------------- */
export default function PortfolioListPage() {
  const router = useRouter();

  const [portfolios, setPortfolios] = React.useState<(Portfolio & { summary?: PortfolioSummary })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);

  const fetchPortfolios = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.portfolios.list();
      if (!res.success) throw new Error(res.error ?? 'Failed to load portfolios');
      setPortfolios(res.data);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      toast.error(err.message ?? 'Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const filtered = React.useMemo(
    () =>
      portfolios.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [portfolios, search],
  );

  const handleCreated = (portfolio: Portfolio) => {
    setCreateOpen(false);
    toast.success(`Portfolio "${portfolio.name}" created`);
    fetchPortfolios();
    router.push(`/portfolio/${portfolio.id}`);
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="mt-1 h-4 w-60" />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
              <div className="pt-2 space-y-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
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
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Failed to load portfolios</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{error}</p>
          <button
            onClick={fetchPortfolios}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent-brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---- Empty ---- */
  if (!portfolios.length) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Portfolios</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create and manage your investment portfolios
          </p>
        </div>
        <EmptyState
          title="No portfolios yet"
          description="Track your investments by creating a portfolio. You can add positions, monitor risk, and get actionable recommendations."
          action={{
            label: 'Create Portfolio',
            onClick: () => setCreateOpen(true),
          }}
        />
        <PortfolioFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={handleCreated}
        />
      </div>
    );
  }

  /* ---- Main ---- */
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Portfolios</h1>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search portfolios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--accent-brand)] transition-colors"
            />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            Create Portfolio
          </button>
        </div>
      </div>

      {/* Portfolio grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const count = p._count?.positions ?? 0;
            const summary = (p as any).summary as PortfolioSummary | undefined;
            const totalValue = summary?.totalValue ?? 0;
            const returnPct = summary?.totalReturnPercent;

            return (
              <button
                key={p.id}
                onClick={() => router.push(`/portfolio/${p.id}`)}
                className="group text-left rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 hover:border-[var(--accent-brand)]/50 hover:shadow-sm hover:shadow-[var(--accent-brand)]/5 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-brand)] transition-colors">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-1">
                        {p.description}
                      </p>
                    )}
                  </div>
                  {p.isDefault && (
                    <Badge variant="secondary" className="text-[10px]">Default</Badge>
                  )}
                </div>

                {/* Meta */}
                <div className="mt-3 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <Layers size={12} />
                    {count} position{count !== 1 ? 's' : ''}
                  </span>
                  <span>{p.currency}</span>
                </div>

                {/* Value & Return */}
                <div className="mt-4 pt-3 border-t border-[var(--border)]">
                  <p className="text-xl font-bold text-[var(--text-primary)]">
                    {totalValue > 0 ? formatCurrency(totalValue, p.currency) : '--'}
                  </p>
                  {returnPct != null && (
                    <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${returnPct >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                      {returnPct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {formatPercent(returnPct)} total return
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center">
          <Search size={24} className="mx-auto text-[var(--text-secondary)]" />
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            No portfolios matching &ldquo;{search}&rdquo;
          </p>
        </div>
      )}

      <PortfolioFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}

