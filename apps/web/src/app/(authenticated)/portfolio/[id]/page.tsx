'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type PortfolioDetail, type RiskMetrics, type ActionRecommendation } from '@/lib/api';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent,
  Skeleton, PositionTable, PriceChart, AllocationPie, MetricBlock,
  DataFreshnessIndicator,
} from '@openmoney/ui';
import {
  ArrowLeft, TrendingUp, ShieldAlert, Lightbulb, Plus,
  AlertTriangle,
} from 'lucide-react';

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [portfolio, setPortfolio] = React.useState<PortfolioDetail | null>(null);
  const [history, setHistory] = React.useState<{ date: string; value: number }[]>([]);
  const [risk, setRisk] = React.useState<RiskMetrics | null>(null);
  const [recs, setRecs] = React.useState<ActionRecommendation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [period, setPeriod] = React.useState('1M');

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pfRes, histRes, riskRes, recsRes] = await Promise.all([
        api.portfolios.get(id),
        api.portfolios.history(id).catch(() => ({ success: true, data: [] })),
        api.portfolios.risk(id).catch(() => null),
        api.portfolios.recommendations(id).catch(() => ({ success: true, data: [] })),
      ]);
      setPortfolio(pfRes.data);
      setHistory(histRes.success ? histRes.data : []);
      if (riskRes && 'data' in riskRes) setRisk(riskRes.data as RiskMetrics);
      if (recsRes && 'data' in recsRes) setRecs(recsRes.data as ActionRecommendation[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <PortfolioDetailSkeleton />;
  if (error) return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="border-[var(--negative)]/30 bg-[var(--negative)]/5">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertTriangle size={20} className="text-[var(--negative)]" />
          <div className="flex-1">
            <p className="font-medium text-[var(--text-primary)]">Failed to load</p>
            <p className="text-sm text-[var(--text-secondary)]">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>Retry</Button>
        </CardContent>
      </Card>
    </div>
  );
  if (!portfolio) return null;

  const activeRecs = recs.filter((r) => !r.expiresAt || new Date(r.expiresAt) > new Date());
  const pnl = portfolio.summary.totalReturn;
  const pnlPct = portfolio.summary.totalReturnPercent;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/portfolio')} className="rounded-lg p-1.5 hover:bg-[var(--accent)] transition-colors">
            <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{portfolio.name}</h1>
            {portfolio.description && (
              <p className="text-sm text-[var(--text-secondary)]">{portfolio.description}</p>
            )}
          </div>
          <Badge variant="outline" className="ml-2 font-mono text-xs">{portfolio.currency}</Badge>
          {portfolio.isDefault && <Badge className="bg-[var(--accent-brand)] text-white text-xs">Default</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/portfolio/risk`}>
            <Button variant="outline" size="sm"><ShieldAlert size={14} /> Risk</Button>
          </Link>
          <Link href={`/portfolio/recommendations`}>
            <Button variant="outline" size="sm"><Lightbulb size={14} /> Actions {activeRecs.length > 0 && `(${activeRecs.length})`}</Button>
          </Link>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-mono text-[var(--text-secondary)]">Total Value</p>
            <p className="text-lg font-bold text-[var(--text-primary)] font-mono">
              ${portfolio.summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-mono text-[var(--text-secondary)]">Total Return</p>
            <p className={`text-lg font-bold font-mono ${pnl >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
              {pnl >= 0 ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-mono text-[var(--text-secondary)]">Return %</p>
            <p className={`text-lg font-bold font-mono ${pnlPct >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
              {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-mono text-[var(--text-secondary)]">Open Positions</p>
            <p className="text-lg font-bold text-[var(--text-primary)] font-mono">{portfolio.positions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="positions">
        <TabsList>
          <TabsTrigger value="positions"><TrendingUp size={14} /> Positions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Positions</CardTitle>
              <Button size="sm" variant="outline"><Plus size={14} /> Add Position</Button>
            </CardHeader>
            <CardContent className="p-0">
              <PositionTable
                positions={portfolio.positions.map((p) => ({
                  id: p.id,
                  ticker: p.ticker,
                  name: p.name ?? undefined,
                  quantity: Number(p.quantity),
                  avgPrice: Number(p.avgEntryPrice),
                  currentPrice: p.currentPrice ?? undefined,
                  marketValue: p.marketValue ?? undefined,
                  unrealizedPnl: p.unrealizedPnl ?? undefined,
                  unrealizedPnlPercent: p.unrealizedPnlPercent ?? undefined,
                  allocation: portfolio.summary.totalValue > 0
                    ? ((p.marketValue ?? 0) / portfolio.summary.totalValue) * 100
                    : undefined,
                  openedAt: p.openedAt,
                }))}
                onRowClick={(id) => router.push(`/position/${id}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Portfolio Value</CardTitle>
              <div className="flex gap-1">
                {['1W','1M','3M','6M','1Y','ALL'].map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      period === p ? 'bg-[var(--accent-brand)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >{p}</button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="h-48 flex items-end gap-0.5">
                  {history.map((h, i) => {
                    const maxVal = Math.max(...history.map(x => x.value));
                    const heightPct = (h.value / maxVal) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-[var(--accent-brand)]/60 hover:bg-[var(--accent-brand)] transition-colors min-h-[2px]"
                        style={{ height: `${heightPct}%` }}
                        title={`${h.date}: $${h.value.toLocaleString()}`}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-sm text-[var(--text-secondary)]">
                  No performance history yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Asset Allocation</CardTitle></CardHeader>
              <CardContent>
                {portfolio.positions.length > 0 ? (
                  <AllocationPie
                    segments={portfolio.positions.map((p) => ({
                      label: p.ticker,
                      value: p.marketValue ?? 0,
                      color: p.assetClass === 'equity' ? '#6366f1' : p.assetClass === 'etf' ? '#22c55e' : '#f59e0b',
                    }))}
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-[var(--text-secondary)]">No positions</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Asset Class Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(
                  portfolio.positions.reduce((acc, p) => {
                    acc[p.assetClass] = (acc[p.assetClass] ?? 0) + (p.marketValue ?? 0);
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([cls, val]) => (
                  <div key={cls} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-[var(--text-primary)]">{cls}</span>
                    <span className="text-sm font-mono text-[var(--text-secondary)]">
                      {portfolio.summary.totalValue > 0
                        ? ((val / portfolio.summary.totalValue) * 100).toFixed(1) + '%'
                        : '$0'}
                    </span>
                  </div>
                ))}
                {portfolio.positions.length === 0 && (
                  <p className="text-sm text-[var(--text-secondary)]">No positions to show</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PortfolioDetailSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-10 w-64 rounded-lg" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
