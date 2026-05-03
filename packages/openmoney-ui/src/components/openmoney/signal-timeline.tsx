import * as React from "react";
import { cn } from "../../lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SignalAction = "hold" | "add" | "reduce" | "exit" | "rebalance";

interface SignalEntry {
  id: string;
  title: string;
  description: string;
  action: SignalAction;
  confidence: number;
  reasoning?: string[];
  createdAt: string;
}

interface SignalTimelineProps {
  signals: SignalEntry[];
  loading?: boolean;
  filter?: string;
  onFilterChange?: (filter: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Action config
// ---------------------------------------------------------------------------

const actionConfig: Record<
  SignalAction,
  { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
  hold: {
    label: "Hold",
    dotColor: "bg-info",
    bgColor: "bg-info/10",
    textColor: "text-info",
  },
  add: {
    label: "Add",
    dotColor: "bg-positive",
    bgColor: "bg-positive/10",
    textColor: "text-positive",
  },
  reduce: {
    label: "Reduce",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
  },
  exit: {
    label: "Exit",
    dotColor: "bg-negative",
    bgColor: "bg-negative/10",
    textColor: "text-negative",
  },
  rebalance: {
    label: "Rebalance",
    dotColor: "bg-info",
    bgColor: "bg-info/10",
    textColor: "text-info",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatConfidence(value: number): string {
  return `${Math.round(value)}%`;
}

function confidenceColor(value: number): string {
  if (value >= 80) return "bg-positive text-white";
  if (value >= 60) return "bg-warning/80 text-white";
  return "bg-muted-fg/40 text-muted-fg";
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Group signals by relative date bucket.
 */
type DateBucket = "Today" | "Yesterday" | "This Week" | "This Month" | "Older";

function getDateBucket(iso: string): DateBucket {
  const d = new Date(iso);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const diffDays = Math.floor(
    (startOfToday.getTime() - d.getTime()) / 86400000,
  );

  if (diffDays < 1 && d >= startOfToday) return "Today";
  if (diffDays < 2 && d >= startOfYesterday) return "Yesterday";

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  if (d >= startOfWeek) return "This Week";

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (d >= startOfMonth) return "This Month";

  return "Older";
}

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All signals" },
  { value: "add", label: "Add" },
  { value: "hold", label: "Hold" },
  { value: "reduce", label: "Reduce" },
  { value: "exit", label: "Exit" },
  { value: "rebalance", label: "Rebalance" },
];

// ---------------------------------------------------------------------------
// Signal card (inline)
// ---------------------------------------------------------------------------

function SignalCardInline({ signal }: { signal: SignalEntry }) {
  const [expanded, setExpanded] = React.useState(false);
  const config = actionConfig[signal.action];
  const hasReasoning = signal.reasoning && signal.reasoning.length > 0;

  return (
    <div
      className={cn(
        "rounded-lg border-l-4 bg-background p-4 shadow-sm transition-shadow hover:shadow-md",
        config.dotColor.replace("bg-", "border-"),
        "border-t border-r border-b border-border",
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {signal.title}
            </h4>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                config.bgColor,
                config.textColor,
              )}
            >
              {config.label}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold font-mono",
                confidenceColor(signal.confidence),
              )}
            >
              {formatConfidence(signal.confidence)} conf
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted-fg leading-relaxed">
            {signal.description}
          </p>
        </div>
      </div>

      {/* Reasoning (expandable) */}
      {hasReasoning && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs text-muted-fg hover:text-foreground transition-colors focus:outline-none"
          >
            <svg
              className={cn(
                "size-3 transition-transform duration-200",
                expanded && "rotate-90",
              )}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            Reasoning ({signal.reasoning!.length})
          </button>

          {expanded && (
            <ul className="mt-2 space-y-1 pl-4">
              {signal.reasoning!.map((reason, idx) => (
                <li
                  key={idx}
                  className="list-disc text-xs text-muted-fg leading-relaxed"
                >
                  {reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Timestamp footer */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] text-muted-fg/60">
          {formatTimestamp(signal.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PAGE_SIZE = 10;

function SignalTimeline({
  signals,
  loading = false,
  filter = "all",
  onFilterChange,
  className,
}: SignalTimelineProps) {
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  // Reset pagination when filter changes
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter]);

  const filtered =
    filter === "all"
      ? signals
      : signals.filter((s) => s.action === filter);

  // Group by date bucket, preserving chronological order (newest first)
  const grouped = React.useMemo(() => {
    const buckets: Record<DateBucket, SignalEntry[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
      Older: [],
    };

    for (const signal of filtered) {
      const bucket = getDateBucket(signal.createdAt);
      buckets[bucket].push(signal);
    }

    return buckets;
  }, [filtered]);

  const allGroups = Object.entries(grouped) as [DateBucket, SignalEntry[]][];
  const hasMore = visibleCount < filtered.length;

  // --- Loading state ---
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Filter skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 animate-pulse rounded-full bg-muted"
            />
          ))}
        </div>
        {/* Card skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  // --- Empty state ---
  if (!signals || signals.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12",
          className,
        )}
      >
        <p className="text-sm font-medium text-muted-fg">No signals yet</p>
        <p className="mt-1 text-xs text-muted-fg/60">
          Signals will appear here when generated
        </p>
      </div>
    );
  }

  // --- Empty for current filter ---
  if (filtered.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <FilterBar
          current={filter}
          onChange={onFilterChange}
        />
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
          <p className="text-sm font-medium text-muted-fg">
            No signals match this filter
          </p>
          <p className="mt-1 text-xs text-muted-fg/60">
            Try selecting a different action type
          </p>
        </div>
      </div>
    );
  }

  // Count visible items per group
  let remaining = visibleCount;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filter bar */}
      <FilterBar
        current={filter}
        onChange={onFilterChange}
      />

      {/* Timeline groups */}
      {allGroups.map(([bucket, bucketSignals]) => {
        if (bucketSignals.length === 0 || remaining <= 0) return null;

        const visible = bucketSignals.slice(0, remaining);
        remaining -= visible.length;

        if (visible.length === 0) return null;

        return (
          <div key={bucket}>
            {/* Date header */}
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-muted">
                <span className="text-[10px] font-bold text-muted-fg">
                  {bucket === "Today"
                    ? "T"
                    : bucket === "Yesterday"
                      ? "Y"
                      : bucket.charAt(0)}
                </span>
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
                {bucket}
              </h3>
              <div className="ml-auto text-[11px] tabular-nums text-muted-fg/50">
                {visible.length}
              </div>
            </div>

            {/* Signal cards */}
            <div className="space-y-3">
              {visible.map((signal) => (
                <SignalCardInline key={signal.id} signal={signal} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Show more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((prev) => prev + PAGE_SIZE)
            }
            className="rounded-md border border-border bg-background px-6 py-2 text-xs font-medium text-muted-fg transition-colors hover:border-muted-fg/30 hover:text-foreground"
          >
            Show more ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline filter bar
// ---------------------------------------------------------------------------

function FilterBar({
  current,
  onChange,
}: {
  current: string;
  onChange?: (filter: string) => void;
}) {
  if (!onChange) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-colors",
            current === opt.value
              ? "bg-foreground text-background"
              : "bg-muted text-muted-fg hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export { SignalTimeline };
export type { SignalTimelineProps, SignalEntry, SignalAction };
