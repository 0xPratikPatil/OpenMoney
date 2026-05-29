'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button, Input, Label, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Card, CardHeader, CardTitle, CardContent } from '@openmoney/ui';
import { ArrowLeft, Save, Loader2, BookOpen, Target, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [ticker, setTicker] = React.useState('');
  const [direction, setDirection] = React.useState<string>('bullish');
  const [thesis, setThesis] = React.useState('');
  const [catalysts, setCatalysts] = React.useState('');
  const [timeframe, setTimeframe] = React.useState<string>('medium_term');
  const [confidence, setConfidence] = React.useState(70);
  const [expectedOutcome, setExpectedOutcome] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !thesis.trim()) { toast.error('Title and thesis are required'); return; }
    setSaving(true);
    try {
      const res = await api.journal.create({
        title: title.trim(), ticker: ticker.trim() || null, direction: direction as any,
        thesis: thesis.trim(), catalysts: catalysts.trim() || null, timeframe: timeframe as any,
        confidence, expectedOutcome: expectedOutcome.trim() || null,
      });
      if (res.success) { toast.success('Journal entry created'); router.push(`/journal/${res.data.id}`); }
      else throw new Error(res.error);
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="rounded-lg p-1.5 hover:bg-[var(--accent)]"><ArrowLeft size={18} className="text-[var(--text-secondary)]" /></button>
        <div><h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><BookOpen size={16} /> New Journal Entry</h1><p className="font-mono text-[11px] text-[var(--text-secondary)]">Log your investment thesis and track prediction accuracy</p></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-mono uppercase text-[var(--text-secondary)] tracking-wider">Thesis Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Ticker (optional)</Label><Input placeholder="e.g., AAPL" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} className="font-mono" /></div>
              <div><Label>Direction</Label><Select value={direction} onValueChange={setDirection}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="bullish"><TrendingUp size={12} className="inline mr-1 text-[var(--positive)]" /> Bullish</SelectItem><SelectItem value="bearish"><TrendingUp size={12} className="inline mr-1 text-[var(--negative)] rotate-180" /> Bearish</SelectItem><SelectItem value="neutral">Neutral</SelectItem></SelectContent>
              </Select></div>
              <div><Label>Timeframe</Label><Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="short_term">Short Term (&lt;3mo)</SelectItem><SelectItem value="medium_term">Medium Term (3-12mo)</SelectItem><SelectItem value="long_term">Long Term (1yr+)</SelectItem></SelectContent>
              </Select></div>
            </div>
            <div><Label>Title</Label><Input placeholder="e.g., AAPL will outperform due to Services growth" value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div><Label>Thesis</Label><textarea className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--brand-border)] min-h-[120px] resize-y" placeholder="Explain your investment thesis in detail. What's the core insight? What data supports it?" value={thesis} onChange={e => setThesis(e.target.value)} /></div>
            <div><Label>Catalysts</Label><Input placeholder="e.g., Earnings beat, Product launch, Interest rate cut" value={catalysts} onChange={e => setCatalysts(e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-mono uppercase text-[var(--text-secondary)] tracking-wider">Prediction Calibration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2"><Label>Confidence: {confidence}%</Label><span className={`font-mono text-xs ${confidence >= 80 ? 'text-[var(--positive)]' : confidence >= 60 ? 'text-[var(--warning)]' : 'text-[var(--negative)]'}`}>{confidence >= 80 ? 'High conviction' : confidence >= 60 ? 'Moderate conviction' : 'Low conviction'}</span></div>
              <input type="range" min={50} max={99} value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-[var(--surface-2)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--foreground)] [&::-webkit-slider-thumb]:cursor-pointer" />
              <div className="flex justify-between mt-1"><span className="font-mono text-[8px] text-[var(--text-tertiary)]">50% (Coin flip)</span><span className="font-mono text-[8px] text-[var(--text-tertiary)]">99% (Absolute certainty)</span></div>
            </div>
            <div><Label>Expected Outcome</Label><Input placeholder="e.g., Stock reaches $200 by Q3 2025" value={expectedOutcome} onChange={e => setExpectedOutcome(e.target.value)} /></div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}><ArrowLeft size={14} /> Cancel</Button>
          <Button type="submit" disabled={saving || !title.trim() || !thesis.trim()}>{saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Entry</>}</Button>
        </div>
      </form>
    </div>
  );
}
