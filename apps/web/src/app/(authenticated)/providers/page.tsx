'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { api, type ProviderHealthSnapshot } from '@/lib/api';
import { Button, Badge, Skeleton, Card, CardHeader, CardTitle, CardContent, EmptyState, Tab, TabsList, TabsTrigger, TabsContent, Tabs } from '@openmoney/ui';
import { Database, Activity, Shield, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Wifi, WifiOff, Globe, Lock, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function ProvidersPage() {
  const [health, setHealth] = React.useState<ProviderHealthSnapshot | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchHealth = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.market.providers.health();
      if (res.success) setHealth(res.data);
      else throw new Error(res.error);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetchHealth(); }, [fetchHealth]);

  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );

  const providers = health?.providers ?? [];
  const summary = health?.summary;
  const statusIcon = (status: string) => status === 'active' ? <CheckCircle2 size={12} className="text-[var(--positive)]" /> : status === 'error' ? <XCircle size={12} className="text-[var(--negative)]" /> : status === 'needs_key' ? <Key size={12} className="text-[var(--warning)]" /> : <AlertTriangle size={12} className="text-[var(--text-tertiary)]" />;
  const statusColor = (status: string) => status === 'active' ? 'text-[var(--positive)] bg-[var(--positive-bg)]' : status === 'error' ? 'text-[var(--negative)] bg-[var(--negative-bg)]' : status === 'needs_key' ? 'text-[var(--warning)] bg-[var(--warning-bg)]' : 'text-[var(--text-secondary)] bg-[var(--surface-2)]';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><Database size={18} /> Data Providers</h1>
          <p className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5">Manage and monitor your market data sources</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHealth}><RefreshCw size={13} /> Refresh</Button>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: summary.total, icon: Database },
            { label: 'Active', value: `${summary.active} (${summary.freeActive} free)`, icon: Activity, color: 'positive' },
            { label: 'Error', value: summary.error, icon: XCircle, color: 'negative' },
            { label: 'Models Covered', value: `${summary.modelsWithFreeCoverage} free / ${summary.modelsWithOnlyPaid} paid`, icon: Shield },
          ].map(s => (
            <div key={s.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-3">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={12} className={s.color ? s.color === 'positive' ? 'text-[var(--positive)]' : s.color === 'negative' ? 'text-[var(--negative)]' : 'text-[var(--text-tertiary)]' : 'text-[var(--text-tertiary)]'} />
                <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-tertiary)]">{s.label}</span>
              </div>
              <p className="text-lg font-bold font-mono text-[var(--text-primary)]">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Provider Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {providers.map(p => (
          <div key={p.name} className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 hover:border-[var(--border-strong)] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[var(--surface-2)]">
                  {p.free ? <Globe size={13} className="text-[var(--positive)]" /> : <Lock size={13} className="text-[var(--warning)]" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] capitalize">{p.name.replace(/_/g, ' ')}</p>
                  <p className="font-mono text-[9px] text-[var(--text-tertiary)]">{p.free ? 'Free' : 'API Key Required'}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px] ${statusColor(p.status)}`}>
                {statusIcon(p.status)} {p.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {p.models.slice(0, 6).map(m => (
                <span key={m} className="px-1.5 py-0.5 rounded font-mono text-[8px] text-[var(--text-tertiary)] bg-[var(--surface-2)]">{m.replace('equity/', '').replace('forex/', '').replace('crypto/', '').replace('economic/', '')}</span>
              ))}
              {p.models.length > 6 && <span className="px-1.5 py-0.5 rounded font-mono text-[8px] text-[var(--text-tertiary)]">+{p.models.length - 6}</span>}
            </div>
            {p.lastError && <p className="mt-2 font-mono text-[9px] text-[var(--negative)] truncate">{p.lastError}</p>}
          </div>
        ))}
      </div>

      {(!providers.length && !loading) && (
        <EmptyState icon={Database} title="No providers configured" description="Configure API keys in Settings to activate data providers." />
      )}
    </div>
  );
}
