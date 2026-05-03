"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JournalFormData {
  title: string;
  ticker?: string;
  direction: string;
  thesis: string;
  catalysts?: string;
  timeframe: string;
  confidence: number;
  expectedOutcome?: string;
}

interface JournalFormProps {
  onSubmit: (data: JournalFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Partial<JournalFormData>;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIRECTION_OPTIONS = [
  { value: "bullish", label: "Bullish", color: "var(--positive)" },
  { value: "bearish", label: "Bearish", color: "var(--negative)" },
  { value: "neutral", label: "Neutral", color: "var(--info)" },
] as const;

const TIMEFRAME_OPTIONS = [
  { value: "short_term", label: "Short-term", description: "Days to weeks" },
  {
    value: "medium_term",
    label: "Medium-term",
    description: "Weeks to months",
  },
  { value: "long_term", label: "Long-term", description: "Months to years" },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function JournalForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
  className,
}: JournalFormProps) {
  /* ---------- Form state ---------- */

  const [title, setTitle] = React.useState(initialData?.title ?? "");
  const [ticker, setTicker] = React.useState(initialData?.ticker ?? "");
  const [direction, setDirection] = React.useState(
    initialData?.direction ?? "bullish",
  );
  const [thesis, setThesis] = React.useState(initialData?.thesis ?? "");
  const [catalysts, setCatalysts] = React.useState(
    initialData?.catalysts ?? "",
  );
  const [timeframe, setTimeframe] = React.useState(
    initialData?.timeframe ?? "short_term",
  );
  const [confidence, setConfidence] = React.useState(
    initialData?.confidence ?? 75,
  );
  const [expectedOutcome, setExpectedOutcome] = React.useState(
    initialData?.expectedOutcome ?? "",
  );

  /* ---------- Validation ---------- */

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!title.trim()) {
      next.title = "Title is required";
    }
    if (!thesis.trim()) {
      next.thesis = "Thesis is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  /* ---------- Submit ---------- */

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      ticker: ticker.trim().toUpperCase() || undefined,
      direction,
      thesis: thesis.trim(),
      catalysts: catalysts.trim() || undefined,
      timeframe,
      confidence,
      expectedOutcome: expectedOutcome.trim() || undefined,
    });
  }

  /* ---------- Error display helper ---------- */

  function fieldError(field: string): string | undefined {
    return errors[field];
  }

  /* ---------- Render ---------- */

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5", className)}
    >
      {/* ====== Title ====== */}
      <fieldset>
        <label
          htmlFor="jf-title"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          Title <span className="text-negative">*</span>
        </label>
        <input
          id="jf-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. AAPL earnings beat"
          className={cn(
            "h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm text-foreground transition-colors",
            "placeholder:text-muted-fg/50",
            "focus:border-muted-fg focus:outline-none focus:ring-1 focus:ring-muted-fg/30",
            fieldError("title")
              ? "border-negative"
              : "border-border",
          )}
          aria-invalid={!!fieldError("title")}
          aria-describedby={
            fieldError("title") ? "jf-title-error" : undefined
          }
        />
        {fieldError("title") && (
          <p
            id="jf-title-error"
            className="mt-1 text-[11px] text-negative"
          >
            {fieldError("title")}
          </p>
        )}
      </fieldset>

      {/* ====== Ticker ====== */}
      <fieldset>
        <label
          htmlFor="jf-ticker"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          Ticker
        </label>
        <input
          id="jf-ticker"
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="e.g. AAPL"
          maxLength={10}
          className={cn(
            "h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm font-mono text-foreground uppercase transition-colors",
            "placeholder:text-muted-fg/50 placeholder:normal-case",
            "focus:border-muted-fg focus:outline-none focus:ring-1 focus:ring-muted-fg/30",
            "border-border",
          )}
        />
      </fieldset>

      {/* ====== Direction ====== */}
      <fieldset>
        <label className="mb-1.5 block text-xs font-medium text-foreground">
          Direction <span className="text-negative">*</span>
        </label>
        <div className="flex gap-2">
          {DIRECTION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDirection(opt.value)}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-center text-xs font-semibold transition-all duration-150",
                direction === opt.value
                  ? "border-current bg-current/10"
                  : "border-border bg-transparent text-muted-fg hover:text-foreground",
              )}
              style={{
                borderColor:
                  direction === opt.value ? opt.color : undefined,
                color: direction === opt.value ? opt.color : undefined,
              }}
              aria-pressed={direction === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* ====== Thesis ====== */}
      <fieldset>
        <label
          htmlFor="jf-thesis"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          Thesis <span className="text-negative">*</span>
        </label>
        <textarea
          id="jf-thesis"
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          placeholder="Explain your reasoning…"
          rows={4}
          className={cn(
            "w-full rounded-md border bg-transparent px-3 py-2 text-sm text-foreground transition-colors resize-y",
            "placeholder:text-muted-fg/50",
            "focus:border-muted-fg focus:outline-none focus:ring-1 focus:ring-muted-fg/30",
            fieldError("thesis") ? "border-negative" : "border-border",
          )}
          aria-invalid={!!fieldError("thesis")}
          aria-describedby={
            fieldError("thesis") ? "jf-thesis-error" : undefined
          }
        />
        {fieldError("thesis") && (
          <p
            id="jf-thesis-error"
            className="mt-1 text-[11px] text-negative"
          >
            {fieldError("thesis")}
          </p>
        )}
      </fieldset>

      {/* ====== Catalysts ====== */}
      <fieldset>
        <label
          htmlFor="jf-catalysts"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          Catalysts
        </label>
        <input
          id="jf-catalysts"
          type="text"
          value={catalysts}
          onChange={(e) => setCatalysts(e.target.value)}
          placeholder="Comma-separated, e.g. earnings, product launch"
          className={cn(
            "h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm text-foreground transition-colors",
            "placeholder:text-muted-fg/50",
            "focus:border-muted-fg focus:outline-none focus:ring-1 focus:ring-muted-fg/30",
            "border-border",
          )}
        />
      </fieldset>

      {/* ====== Timeframe ====== */}
      <fieldset>
        <label className="mb-1.5 block text-xs font-medium text-foreground">
          Timeframe <span className="text-negative">*</span>
        </label>
        <div className="flex gap-2">
          {TIMEFRAME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeframe(opt.value)}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-center transition-all duration-150",
                timeframe === opt.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-transparent text-muted-fg hover:text-foreground",
              )}
              aria-pressed={timeframe === opt.value}
            >
              <span className="block text-xs font-semibold">{opt.label}</span>
              <span className="mt-0.5 block text-[10px] opacity-70">
                {opt.description}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* ====== Confidence slider ====== */}
      <fieldset>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-medium text-foreground">
            Confidence
          </label>
          <span className="font-mono text-xs font-bold tabular-nums text-foreground">
            {confidence}%
          </span>
        </div>
        <div className="relative flex items-center">
          <span className="mr-2 text-[10px] text-muted-fg">50</span>
          <input
            type="range"
            min={50}
            max={99}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className={cn(
              "h-1.5 w-full appearance-none rounded-full bg-muted outline-none",
              " [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
              " [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground",
              " [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm",
              " [&::-webkit-slider-thumb]:cursor-pointer",
              " [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full",
              " [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-foreground",
              " [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow-sm",
              " [&::-moz-range-thumb]:cursor-pointer",
            )}
            style={{
              background: `linear-gradient(to right, var(--positive) 0%, var(--positive) ${((confidence - 50) / 49) * 100}%, var(--muted) ${((confidence - 50) / 49) * 100}%, var(--muted) 100%)`,
            }}
            aria-label="Confidence level"
          />
          <span className="ml-2 text-[10px] text-muted-fg">99</span>
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-fg">
          <span>Hesitant</span>
          <span>Highly confident</span>
        </div>
      </fieldset>

      {/* ====== Expected Outcome ====== */}
      <fieldset>
        <label
          htmlFor="jf-outcome"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          Expected outcome
        </label>
        <input
          id="jf-outcome"
          type="text"
          value={expectedOutcome}
          onChange={(e) => setExpectedOutcome(e.target.value)}
          placeholder="e.g. +5% in 3 months"
          className={cn(
            "h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm text-foreground transition-colors",
            "placeholder:text-muted-fg/50",
            "focus:border-muted-fg focus:outline-none focus:ring-1 focus:ring-muted-fg/30",
            "border-border",
          )}
        />
      </fieldset>

      {/* ====== Actions ====== */}
      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150",
              "border border-border bg-background text-foreground hover:bg-muted",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-150",
            "bg-foreground text-background hover:opacity-90",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Saving…" : "Submit prediction"}
        </button>
      </div>
    </form>
  );
}

export { JournalForm };
export type { JournalFormProps, JournalFormData };
