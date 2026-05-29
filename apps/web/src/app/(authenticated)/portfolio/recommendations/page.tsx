'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { api, type ActionRecommendation, type Portfolio } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Skeleton, EmptyState } from '@openmoney/ui';
import { Lightbulb, Shield, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Check, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';

const actionIcon = (a: string) => a === 'add' || a === 'hold' ? <ArrowUpRight size={14} /> : a === 'reduce' || a === 'exit' ? <ArrowDownRight size={14} /> : <Zap size={14} />;
const actionColor = (a: string) => a === 'add' ? 'bg-[var(--positive-bg)] text-[var(--positive)]' : a === 'hold' ? 'bg-[var(--info-bg)] text-[var(--info)]' : a === 'reduce' ? 'bg-[var(--warning-bg)] text-[var(--warning)]' : a === 'exit' ? 'bg-[var(--negative-bg)] text-[var(--negative)]' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]';

export default function RecommendationsPage() {
  const router = useRouter();
  const [recs, setRecs] = React.useState<ActionRecommendation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const [pfRes] = await Promise.all([api.portfolios.list()]);
        if (pfRes.success && pfRes.data.length > 0) {
          const allRecs: ActionRecommendation[] = [];
          for (const p of pfRes.data.slice(0, 3)) {
            const rRes = await api.portfolios.recommendations(p.id).catch(() => ({ success: true, data: [] as ActionRecommendation[] }));
            if (rRes.success) allRecs.push(...rRes.data.map((r: ActionRecommendation) => ({ ...r, portfolioId: p.id })));
          }
          setRecs(allRecs);
        }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
    </div>
  );

  if (!recs.length) return (
    <div className="p-6 max-w-7xl mx-auto">
      <EmptyState icon={Lightbulb} title="No recommendations yet" description="Add positions to your portfolio and the engine will generate actionable recommendations based on risk metrics and market conditions." action={{ label: 'Create Portfolio', onClick: () => router.push('/portfolio') }} />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><Lightbulb size={18} /> Action Recommendations</h1>
          <p className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5">{recs.length} recommendations across your portfolios</p>
        </div>
      </div>

      <div className="space-y-3">
        {recs.map(r => (
          <div key={r.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 hover:border-[var(--border-strong)] transition-colors">
            <div className="flex items-start gap-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${actionColor(r.action)}`}>
                {actionIcon(r.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{r.title}</h3>
                  <Badge variant="outline" className="font-mono text-[9px]">{r.action.toUpperCase()}</Badge>
                  {r.confidence != null && (
                    <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{r.confidence}% confidence</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {r.reasoning.map((reason, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
                      <Check size={11} className="mt-0.5 text-[var(--brand)] shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
                {r.triggeredBy.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.triggeredBy.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded font-mono text-[8px] text-[var(--text-tertiary)] bg-[var(--surface-2)]">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => router.push('/portfolio')}>View Portfolio</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
