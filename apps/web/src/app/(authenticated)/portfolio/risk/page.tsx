'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { api, type Portfolio, type RiskMetrics, type PortfolioSummary } from '@/lib/api';
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
  MetricBlock,
  MetricsGrid,
  RiskGauge,
  CorrelationMatrix,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  DataFreshnessIndicator,
  Callout,
  EmptyState,
} from '@openmoney/ui';
import {
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  TrendingDown,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Info,
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
  return `${value.toFixed(2)}%`;
}

function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value == null) return '--';
  return value.toFixed(decimals);
}

const RISK_SEGMENTS = [
  { value: 5, label: 'Low', color: '#22c55e' },
  { value: 10, label: 'Moderate', color: '#f59e0b' },
  { value: 20, label: 'High', color: '#ef4444' },
  { value: 100, label: 'Critical', color: '#7f1d1d' },
];

/* -------------------------------------------------------------------------- */
/*  Risk Page                                                                  */
/* -------------------------------------------------------------------------- */
export default function RiskPage() {
  const router = useRouter();

  const [portfolios, setPortfolios] = React.useState<Portfolio[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [risk, setRisk] = React.useState<RiskMetrics | null>(null);
  const [loadingPortfolios, setLoadingPortfolios] = React.useState(true);
  const [loadingRisk, setLoadingRisk] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /* Fetch portfolios list on mount */
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

  /* Fetch risk metrics when portfolio changes */
  const fetchRisk = React.useCallback(async (id: string) => {
    setLoadingRisk(true);
    setError(null);
    try {
      const res = await api.portfolios.risk(id);
      if (!res.success) throw new Error(res.error ?? 'Failed to load risk metrics');
      setRisk(res.data);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      toast.error(err.message ?? 'Failed to load risk metrics');
    } finally {
      setLoadingRisk(false);
    }
  }, []);

  React.useEffect(() => {
    if (selectedId) fetchRisk(selectedId);
  }, [selectedId, fetchRisk]);

  const selectedPortfolio = portfolios.find((p) => p.id === selectedId);
  const hasPortfolios = portfolios.length > 0;

  /* ---- Empty State ---- */
  if (!loadingPortfolios && !hasPortfolios) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Risk Analytics</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Institutional-grade risk metrics for your portfolio
          </p>
        </div>
        <EmptyState
          title="No portfolios found"
          description="Create a portfolio first to view risk analytics."
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Risk Analytics</h1>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            Portfolio risk decomposition and metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Portfolio selector */}
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
            onClick={() => selectedId && fetchRisk(selectedId)}
            disabled={loadingRisk || !selectedId}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={14} className={loadingRisk ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {selectedPortfolio && risk && (
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <ShieldAlert size={12} />
          Portfolio: {selectedPortfolio.name} &middot;
          As of {format(new Date(risk.asOfDate), 'MMM d, yyyy HH:mm')}
        </div>
      )}

      {/* ---- Loading ---- */}
      {loadingRisk && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4">
              <Skeleton className="h-5 w-24" />
              <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-32 rounded-full" />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      )}

      {/* ---- Error ---- */}
      {error && !loadingRisk && (
        <Callout variant="error" title="Failed to load risk metrics">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => selectedId && fetchRisk(selectedId)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-brand)] hover:underline"
          >
            <RefreshCw size={12} />
            Try again
          </button>
        </Callout>
      )}

      {/* ---- Risk Gauges ---- */}
      {risk && !loadingRisk && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <RiskGauge
              value={Math.abs(risk.portfolioVaR95)}
              max={20}
              segments={RISK_SEGMENTS}
              label="VaR 95%"
            />
            <RiskGauge
              value={Math.abs(risk.portfolioVaR99)}
              max={30}
              segments={RISK_SEGMENTS}
              label="VaR 99%"
            />
            <RiskGauge
              value={Math.abs(risk.portfolioCVaR95)}
              max={25}
              segments={RISK_SEGMENTS}
              label="CVaR 95%"
            />
            <RiskGauge
              value={Math.abs(risk.maxDrawdown)}
              max={50}
              segments={RISK_SEGMENTS}
              label="Max Drawdown"
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Sharpe Ratio', value: formatNumber(risk.sharpeRatio), color: risk.sharpeRatio >= 1 ? 'text-[var(--positive)]' : risk.sharpeRatio >= 0 ? 'text-[var(--warning)]' : 'text-[var(--negative)]' },
              { label: 'Sortino Ratio', value: formatNumber(risk.sortinoRatio), color: risk.sortinoRatio >= 1 ? 'text-[var(--positive)]' : risk.sortinoRatio >= 0 ? 'text-[var(--warning)]' : 'text-[var(--negative)]' },
              { label: 'Beta', value: formatNumber(risk.beta), color: 'text-[var(--text-primary)]' },
              { label: 'Annual Volatility', value: `${(Math.abs(risk.portfolioVaR95) / 1.645 * Math.sqrt(252)).toFixed(1)}%`, color: 'text-[var(--text-primary)]' },
            ].map((m) => (
              <Card key={m.label}>
                <CardContent className="p-4">
                  <p className="text-xs font-mono text-[var(--text-secondary)]">{m.label}</p>
                  <p className={`text-lg font-bold font-mono mt-1 ${m.color}`}>{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Correlation Matrix + Risk Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Correlation Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Correlation Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                {risk.correlationMatrix && risk.correlationMatrix.length > 0 ? (
                  <CorrelationMatrix data={risk.correlationMatrix} />
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-[var(--text-secondary)]">
                    Not enough positions for correlation analysis
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Position Risk Contributions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Position Risk Contribution</CardTitle>
              </CardHeader>
              <CardContent>
                {risk.positionRiskContributions && risk.positionRiskContributions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticker</TableHead>
                          <TableHead className="text-right">Marginal VaR</TableHead>
                          <TableHead className="text-right">Component VaR</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {risk.positionRiskContributions.map((pc) => (
                          <TableRow key={pc.ticker}>
                            <TableCell className="font-medium text-[var(--text-primary)]">
                              {pc.ticker}
                            </TableCell>
                            <TableCell className="text-right text-[var(--text-secondary)]">
                              {formatPercent(pc.marginalVaR)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={pc.componentVaR > 0 ? 'text-[var(--negative)]' : 'text-[var(--positive)]'}>
                                {formatCurrency(pc.componentVaR)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-[var(--text-secondary)]">
                    No position risk data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Historical VaR Backtest placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Historical VaR Backtest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-primary)]">
                <div className="text-center">
                  <BarChart3 size={24} className="mx-auto text-[var(--text-secondary)]" />
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    VaR backtest chart will appear here with daily returns plotted against VaR bands
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Requires 30+ days of historical data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

