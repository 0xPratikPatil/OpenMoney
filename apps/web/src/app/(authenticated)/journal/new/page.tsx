'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button, JournalForm, type JournalFormData } from '@openmoney/ui';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  New Journal Entry Page                                                     */
/* -------------------------------------------------------------------------- */

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (data: JournalFormData) => {
      setLoading(true);
      try {
        const res = await api.journal.create({
          title: data.title,
          ticker: data.ticker ?? null,
          direction: data.direction as 'bullish' | 'bearish' | 'neutral',
          thesis: data.thesis,
          catalysts: data.catalysts ?? null,
          timeframe: data.timeframe as 'short_term' | 'medium_term' | 'long_term',
          confidence: data.confidence,
          expectedOutcome: data.expectedOutcome ?? null,
        });

        if (!res.success) throw new Error(res.error ?? 'Failed to create entry');

        toast.success('Journal entry created');
        router.push('/journal');
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to create entry');
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const handleCancel = React.useCallback(() => {
    router.push('/journal');
  }, [router]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push('/journal')}
          aria-label="Back to journal"
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">New Journal Entry</h1>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            Document your investment thesis and track your prediction accuracy
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
        <JournalForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
}

