import * as React from "react";
import { cn } from "../../lib/utils";
import { ChevronRight, ChevronDown, Plus } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type JournalDirection = "bullish" | "bearish" | "neutral";

type JournalOutcome =
  | "correct"
  | "incorrect"
  | "too_early"
  | "too_late"
  | "unresolved";

interface JournalCardProps {
  id: string;
  title: string;
  ticker?: string;
  direction: JournalDirection;
  thesis: string;
  catalysts?: string[];
  timeframe: string;
  confidence: number;
  actualOutcome?: JournalOutcome;
  createdAt: string;
  onAddOutcome?: (id: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Direction config
// ---------------------------------------------------------------------------

const directionConfig: Record<
  JournalDirection,
  { label: string; bgColor: string; textColor: string; borderColor: string }
> = {
  bullish: {
    label: "Bullish",
    bgColor: "bg-positive/10",
    textColor: "text-positive",
    borderColor: "border-positive",
  },
  bearish: {
    label: "Bearish",
    bgColor: "bg-negative/10",
    textColor: "text-negative",
    borderColor: "border-negative",
  },
  neutral: {
    label: "Neutral",
    bgColor: "bg-info/10",
    textColor: "text-info",
    borderColor: "border-info",
  },
};

// ---------------------------------------------------------------------------
// Outcome config
// ---------------------------------------------------------------------------

const outcomeConfig: Record<
  JournalOutcome,
  { label: string; bgColor: string; textColor: string } | null
> = {
  correct: {
    label: "Correct",
    bgColor: "bg-positive/10",
    textColor: "text-positive",
  },
  incorrect: {
    label: "Incorrect",
    bgColor: "bg-negative/10",
    textColor: "text-negative",
  },
  too_early: {
    label: "Too early",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
  },
  too_late: {
    label: "Too late",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-400",
  },
  unresolved: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays < 1) {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatConfidence(value: number): string {
  return `${Math.round(value)}%`;
}

function confidenceColor(value: number): string {
  if (value >= 80) return "bg-positive text-white";
  if (value >= 60) return "bg-warning/80 text-white";
  return "bg-muted-fg/40 text-muted-fg";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function JournalCard({
  id,
  title,
  ticker,
  direction,
  thesis,
  catalysts,
  timeframe,
  confidence,
  actualOutcome = "unresolved",
  createdAt,
  onAddOutcome,
  className,
}: JournalCardProps) {
  const [thesisExpanded, setThesisExpanded] = React.useState(false);
  const [catalystsExpanded, setCatalystsExpanded] = React.useState(false);

  const dirCfg = directionConfig[direction];
  const outcomeCfg = actualOutcome
    ? outcomeConfig[actualOutcome]
    : null;
  const isUnresolved = actualOutcome === "unresolved";

  const hasCatalysts = catalysts && catalysts.length > 0;
  const thesisTruncated = thesis.length > 180;
  const displayThesis =
    thesisExpanded || !thesisTruncated
      ? thesis
      : thesis.slice(0, 180) + "…";

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Title */}
            <h4 className="text-sm font-semibold text-foreground">
              {title}
            </h4>

            {/* Ticker badge */}
            {ticker && (
              <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-mono font-bold text-foreground uppercase">
                {ticker}
              </span>
            )}

            {/* Direction badge */}
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                dirCfg.bgColor,
                dirCfg.textColor,
              )}
            >
              {dirCfg.label}
            </span>

            {/* Confidence badge */}
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold font-mono",
                confidenceColor(confidence),
              )}
            >
              {formatConfidence(confidence)}
            </span>
          </div>
        </div>

        {/* Outcome badge or Add outcome button */}
        {!isUnresolved && outcomeCfg ? (
          <span
            className={cn(
              "shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
              outcomeCfg.bgColor,
              outcomeCfg.textColor,
            )}
          >
            {outcomeCfg.label}
          </span>
        ) : isUnresolved && onAddOutcome ? (
          <button
            type="button"
            onClick={() => onAddOutcome(id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150",
              "border border-dashed border-muted-fg/40 text-muted-fg hover:border-muted-fg hover:text-foreground",
            )}
          >
            <Plus className="size-3" />
            Add outcome
          </button>
        ) : null}
      </div>

      {/* Thesis */}
      <div className="mt-3">
        <p className="text-sm text-muted-fg leading-relaxed whitespace-pre-line">
          {displayThesis}
        </p>
        {thesisTruncated && (
          <button
            type="button"
            onClick={() => setThesisExpanded((prev) => !prev)}
            className="mt-1 text-xs font-medium text-info hover:text-info/80 transition-colors"
          >
            {thesisExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Catalysts (collapsible) */}
      {hasCatalysts && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setCatalystsExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-fg hover:text-foreground transition-colors"
          >
            {catalystsExpanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
            Catalysts ({catalysts!.length})
          </button>

          {catalystsExpanded && (
            <ul className="mt-2 space-y-1 pl-5">
              {catalysts!.map((catalyst, idx) => (
                <li
                  key={idx}
                  className="list-disc text-xs text-muted-fg leading-relaxed"
                >
                  {catalyst}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
        {/* Timeframe tag */}
        <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-fg">
          {timeframe}
        </span>

        {/* Created timestamp */}
        <p className="text-[11px] text-muted-fg/60">
          {formatTimestamp(createdAt)}
        </p>
      </div>
    </div>
  );
}

export { JournalCard };
export type { JournalCardProps, JournalDirection, JournalOutcome };
