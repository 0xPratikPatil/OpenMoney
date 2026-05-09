'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, type JournalEntry } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  EmptyState,
  Callout,
} from '@openmoney/ui';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeframe(tf: string): string {
  const map: Record<string, string> = {
    short_term: 'Short-term (days to weeks)',
    medium_term: 'Medium-term (weeks to months)',
    long_term: 'Long-term (months to years)',
  };
  return map[tf] ?? tf.replace(/_/g, ' ');
}

function directionConfig(direction: string) {
  switch (direction) {
    case 'bullish':
      return { label: 'Bullish', icon: TrendingUp, color: 'var(--positive)', bg: 'bg-[var(--positive)]/10' };
    case 'bearish':
      return { label: 'Bearish', icon: TrendingDown, color: 'var(--negative)', bg: 'bg-[var(--negative)]/10' };
    default:
      return { label: 'Neutral', icon: Minus, color: 'var(--warning)', bg: 'bg-[var(--warning)]/10' };
  }
}

function outcomeConfig(outcome: string) {
  switch (outcome) {
    case 'correct':
      return { label: 'Correct', icon: CheckCircle, color: 'var(--positive)', bg: 'bg-[var(--positive)]/10' };
    case 'incorrect':
      return { label: 'Incorrect', icon: XCircle, color: 'var(--negative)', bg: 'bg-[var(--negative)]/10' };
    case 'too_early':
      return { label: 'Too Early', icon: Clock, color: 'var(--warning)', bg: 'bg-[var(--warning)]/10' };
    case 'too_late':
      return { label: 'Too Late', icon: Clock, color: '#EA580C', bg: 'bg-orange-500/10' };
    default:
      return { label: 'Unresolved', icon: Clock, color: 'var(--text-secondary)', bg: 'bg-[var(--border)]' };
  }
}

/* -------------------------------------------------------------------------- */
/*  Outcome Form                                                               */
/* -------------------------------------------------------------------------- */

function OutcomeForm({
  entry,
  onSaved,
}: {
  entry: JournalEntry;
  onSaved: () => void;
}) {
  const [outcome, setOutcome] = React.useState('');
  const [outcomeDate, setOutcomeDate] = React.useState(
    new Date().toISOString().split('T')[0] ?? new Date().toISOString().slice(0, 10),
  );
  const [outcomeNotes, setOutcomeNotes] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome) return;

    setSaving(true);
    try {
      const res = await api.journal.update(entry.id, {
        actualOutcome: outcome,
        outcomeDate: new Date(outcomeDate).toISOString(),
        outcomeNotes: outcomeNotes || null,
      });
      if (!res.success) throw new Error(res.error ?? 'Failed to update');
      toast.success('Outcome recorded');
      onSaved();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to record outcome');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--text-primary)]">
          Outcome <span className="text-[var(--negative)]">*</span>
        </label>
        <Select value={outcome} onValueChange={setOutcome}>
          <SelectTrigger>
            <SelectValue placeholder="Select outcome..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="correct">
              <span className="flex items-center gap-2">
                <CheckCircle size={14} className="text-[var(--positive)]" />
                Correct
              </span>
            </SelectItem>
            <SelectItem value="incorrect">
              <span className="flex items-center gap-2">
                <XCircle size={14} className="text-[var(--negative)]" />
                Incorrect
              </span>
            </SelectItem>
            <SelectItem value="too_early">
              <span className="flex items-center gap-2">
                <Clock size={14} className="text-[var(--warning)]" />
                Too early
              </span>
            </SelectItem>
            <SelectItem value="too_late">
              <span className="flex items-center gap-2">
                <Clock size={14} className="text-orange-500" />
                Too late
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label
          htmlFor="outcome-date"
          className="mb-1.5 block text-xs font-medium text-[var(--text-primary)]"
        >
          Outcome date
        </label>
        <input
          id="outcome-date"
          type="date"
          value={outcomeDate}
          onChange={(e) => setOutcomeDate(e.target.value)}
          className="h-9 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-1 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--text-secondary)]/30"
        />
      </div>

      <div>
        <label
          htmlFor="outcome-notes"
          className="mb-1.5 block text-xs font-medium text-[var(--text-primary)]"
        >
          Notes
        </label>
        <Textarea
          id="outcome-notes"
          value={outcomeNotes}
          onChange={(e) => setOutcomeNotes(e.target.value)}
          placeholder="What happened? What did you learn?"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={!outcome || saving}>
        {saving ? 'Saving...' : 'Record Outcome'}
      </Button>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function JournalDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [entry, setEntry] = React.useState<JournalEntry | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const fetchEntry = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.journal.get(id);
      if (!res.success) throw new Error(res.error ?? 'Entry not found');
      setEntry(res.data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load entry');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await api.journal.delete(id);
      if (!res.success) throw new Error(res.error ?? 'Failed to delete');
      toast.success('Entry deleted');
      router.push('/journal');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete entry');
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const isUnresolved = !entry?.actualOutcome;
  const dirCfg = entry ? directionConfig(entry.direction) : null;
  const outcCfg = entry?.actualOutcome ? outcomeConfig(entry.actualOutcome) : null;

  /* ======== Loading ======== */

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  /* ======== Error ======== */

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Callout variant="error" title="Failed to load entry">
          <p className="mb-3">{error}</p>
          <div className="flex gap-2">
            <Button onClick={fetchEntry}>
              <RefreshCw size={14} className="mr-1.5" />
              Retry
            </Button>
            <Button variant="outline" onClick={() => router.push('/journal')}>
              <ArrowLeft size={14} className="mr-1.5" />
              Back to Journal
            </Button>
          </div>
        </Callout>
      </div>
    );
  }

  /* ======== Not Found ======== */

  if (!entry) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EmptyState
          icon={AlertTriangle}
          title="Entry not found"
          description="This journal entry could not be found or has been deleted."
          action={{
            label: 'Back to Journal',
            onClick: () => router.push('/journal'),
          }}
        />
      </div>
    );
  }

  /* ======== Data ======== */

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/journal')}
            aria-label="Back to journal"
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] truncate">
              {entry.title}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Created {formatDate(entry.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/journal/new')}
          >
            <Edit3 size={14} className="mr-1.5" />
            Edit
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-[var(--negative)] border-[var(--negative)]/30 hover:bg-[var(--negative)]/10">
                <Trash2 size={14} className="mr-1.5" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete entry</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &ldquo;{entry.title}&rdquo;? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-[var(--negative)] hover:bg-[var(--negative)]/90"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thesis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Thesis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                {entry.thesis}
              </p>
            </CardContent>
          </Card>

          {/* Catalysts */}
          {entry.catalysts && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Catalysts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {(entry.catalysts ?? '').split(',').map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-brand)]" />
                      {c.trim()}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Expected Outcome */}
          {entry.expectedOutcome && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Expected Outcome</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-primary)]">{entry.expectedOutcome}</p>
              </CardContent>
            </Card>
          )}

          {/* Outcome Notes */}
          {entry.outcomeNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Outcome Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-primary)] whitespace-pre-line">
                  {entry.outcomeNotes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Outcome Form (if unresolved) */}
          {isUnresolved && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Record Outcome</CardTitle>
              </CardHeader>
              <CardContent>
                <OutcomeForm entry={entry} onSaved={fetchEntry} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Direction */}
          {dirCfg && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Direction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${dirCfg.bg}`}>
                  <dirCfg.icon size={16} style={{ color: dirCfg.color }} />
                  <span style={{ color: dirCfg.color }}>{dirCfg.label}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ticker */}
          {entry.ticker && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Ticker</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="font-mono text-sm">
                  {entry.ticker}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Confidence */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-[var(--accent-brand)]" />
                <span className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                  {entry.confidence}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeframe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Timeframe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                <Calendar size={14} className="text-[var(--text-secondary)]" />
                {formatTimeframe(entry.timeframe)}
              </div>
            </CardContent>
          </Card>

          {/* Outcome Badge */}
          {outcCfg && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Outcome</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${outcCfg.bg}`}>
                  <outcCfg.icon size={18} style={{ color: outcCfg.color }} />
                  <span className="text-base font-bold" style={{ color: outcCfg.color }}>
                    {outcCfg.label}
                  </span>
                </div>
                {entry.outcomeDate && (
                  <p className="mt-2 text-xs text-[var(--text-secondary)]">
                    Resolved {formatDateShort(entry.outcomeDate)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="relative flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full border-2 border-[var(--accent-brand)] bg-[var(--bg-primary)]" />
                    <div className="h-8 w-px bg-[var(--border)]" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-medium text-[var(--text-primary)]">Created</p>
                    <p className="text-xs text-[var(--text-secondary)]">{formatDateShort(entry.createdAt)}</p>
                  </div>
                </div>

                {entry.outcomeDate && (
                  <div className="flex items-start gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full border-2 border-[var(--positive)] bg-[var(--bg-primary)]" />
                      <div className="h-8 w-px bg-[var(--border)]" />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-medium text-[var(--text-primary)]">Outcome</p>
                      <p className="text-xs text-[var(--text-secondary)]">{formatDateShort(entry.outcomeDate)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="h-3 w-3 rounded-full border-2 border-[var(--text-secondary)] bg-[var(--bg-primary)]" />
                  <div className="pt-0.5">
                    <p className="text-sm font-medium text-[var(--text-primary)]">Now</p>
                    <p className="text-xs text-[var(--text-secondary)]">{formatDateShort(new Date().toISOString())}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
