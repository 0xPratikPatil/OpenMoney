'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, type JournalEntry } from '@/lib/api';
import { Button, Badge, Skeleton, Card, CardHeader, CardTitle, CardContent, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@openmoney/ui';
import { ArrowLeft, BookOpen, TrendingUp, Target, Calendar, Save, Loader2, Check, X, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function JournalDetailPage() {
  const params = useParams(); const router = useRouter();
  const id = params.id as string;
  const [entry, setEntry] = React.useState<JournalEntry | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [outcome, setOutcome] = React.useState<string>('');
  const [outcomeNotes, setOutcomeNotes] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.journal.get(id);
        if (res.success) { setEntry(res.data); setOutcome(res.data.actualOutcome ?? ''); setOutcomeNotes(res.data.outcomeNotes ?? ''); }
      } catch (e) { toast.error('Failed to load entry'); } finally { setLoading(false); }
    })();
  }, [id]);

  const handleResolve = async () => {
    if (!outcome) { toast.error('Select an outcome'); return; }
    setSaving(true);
    try {
      const res = await api.journal.update(id, { actualOutcome: outcome as any, outcomeNotes: outcomeNotes.trim() || null } as any);
      if (res.success) { toast.success('Outcome recorded'); setEntry(res.data); }
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="p-6 max-w-3xl mx-auto space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-32 rounded-xl" /></div>;
  if (!entry) return <div className="p-6 max-w-3xl mx-auto"><p>Entry not found</p></div>;

  const directionColor = entry.direction === 'bullish' ? 'text-[var(--positive)]' : entry.direction === 'bearish' ? 'text-[var(--negative)]' : 'text-[var(--text-secondary)]';
  const isResolved = !!entry.actualOutcome;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg p-1.5 hover:bg-[var(--accent)]"><ArrowLeft size={18} className="text-[var(--text-secondary)]" /></button>
        <div><h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><BookOpen size={16} /> {entry.title}</h1><p className="font-mono text-[11px] text-[var(--text-secondary)]">Created {new Date(entry.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Direction', value: entry.direction.toUpperCase(), color: directionColor, icon: TrendingUp },
          { label: 'Confidence', value: `${entry.confidence}%`, icon: Target },
          { label: 'Timeframe', value: entry.timeframe.replace(/_/g, ' ').toUpperCase(), icon: Calendar },
        ].map(m => (
          <div key={m.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-3 text-center">
            <m.icon size={12} className={`mx-auto mb-1 ${m.color ?? 'text-[var(--text-tertiary)]'}`} />
            <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-tertiary)]">{m.label}</p>
            <p className={`mt-1 text-sm font-bold font-mono ${m.color ?? 'text-[var(--text-primary)]'}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Thesis */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-mono uppercase text-[var(--text-secondary)] tracking-wider">Thesis</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{entry.thesis}</p>
          {entry.catalysts && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Catalysts</p>
              <p className="text-xs text-[var(--text-secondary)]">{entry.catalysts}</p>
            </div>
          )}
          {entry.expectedOutcome && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Expected Outcome</p>
              <p className="text-xs text-[var(--text-secondary)]">{entry.expectedOutcome}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase text-[var(--text-secondary)] tracking-wider flex items-center gap-2">
            {isResolved ? <Check size={14} className="text-[var(--positive)]" /> : <Clock size={14} className="text-[var(--warning)]" />}
            {isResolved ? 'Outcome Recorded' : 'Resolve Prediction'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isResolved ? (
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold ${
                entry.actualOutcome === 'correct' ? 'bg-[var(--positive-bg)] text-[var(--positive)]' :
                entry.actualOutcome === 'incorrect' ? 'bg-[var(--negative-bg)] text-[var(--negative)]' :
                entry.actualOutcome === 'too_early' || entry.actualOutcome === 'too_late' ? 'bg-[var(--warning-bg)] text-[var(--warning)]' :
                'bg-[var(--surface-2)] text-[var(--text-secondary)]'
              }`}>
                {entry.actualOutcome === 'correct' ? '✅' : entry.actualOutcome === 'incorrect' ? '❌' : '⚠️'}
                {entry.actualOutcome?.replace(/_/g, ' ').toUpperCase()}
              </div>
              {entry.outcomeNotes && <p className="text-sm text-[var(--text-secondary)]">{entry.outcomeNotes}</p>}
              {entry.outcomeDate && <p className="font-mono text-[10px] text-[var(--text-tertiary)]">Resolved: {new Date(entry.outcomeDate).toLocaleDateString()}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Outcome</Label>
                <Select value={outcome} onValueChange={setOutcome}>
                  <SelectTrigger><SelectValue placeholder="Select outcome..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="correct">✅ Correct</SelectItem>
                    <SelectItem value="incorrect">❌ Incorrect</SelectItem>
                    <SelectItem value="too_early">⚠️ Too Early</SelectItem>
                    <SelectItem value="too_late">⚠️ Too Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <textarea className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--brand-border)] min-h-[80px] resize-y" placeholder="What happened? What did you learn?" value={outcomeNotes} onChange={e => setOutcomeNotes(e.target.value)} />
              </div>
              <Button size="sm" onClick={handleResolve} disabled={saving || !outcome}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Record Outcome
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accuracy stats */}
      <div className="text-center py-4">
        <button onClick={() => router.push('/journal')} className="text-xs text-[var(--brand)] hover:underline font-mono flex items-center gap-1 justify-center"><BarChart3 size={12} /> View accuracy dashboard</button>
      </div>
    </div>
  );
}
