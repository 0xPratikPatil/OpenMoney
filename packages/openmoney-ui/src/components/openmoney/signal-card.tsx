import * as React from "react";
import { cn } from "../../lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SignalAction = "hold" | "add" | "reduce" | "exit" | "rebalance";

interface SignalCardProps {
  title: string;
  description: string;
  action: SignalAction;
  confidence: number;
  reasoning?: string[];
  createdAt: string;
  onAction?: () => void;
}

// ---------------------------------------------------------------------------
// Action config
// ---------------------------------------------------------------------------

const actionConfig: Record<
  SignalAction,
  { label: string; borderColor: string; bgColor: string; textColor: string }
> = {
  hold: {
    label: "Hold",
    borderColor: "border-info",
    bgColor: "bg-info/10",
    textColor: "text-info",
  },
  add: {
    label: "Add",
    borderColor: "border-positive",
    bgColor: "bg-positive/10",
    textColor: "text-positive",
  },
  reduce: {
    label: "Reduce",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
  },
  exit: {
    label: "Exit",
    borderColor: "border-negative",
    bgColor: "bg-negative/10",
    textColor: "text-negative",
  },
  rebalance: {
    label: "Rebalance",
    borderColor: "border-info",
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function SignalCard({
  title,
  description,
  action,
  confidence,
  reasoning,
  createdAt,
  onAction,
}: SignalCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const config = actionConfig[action];

  const hasReasoning = reasoning && reasoning.length > 0;

  return (
    <div
      className={cn(
        "rounded-lg border-l-4 bg-background p-4 shadow-sm transition-shadow hover:shadow-md",
        config.borderColor,
        "border-t border-r border-b border-border",
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {title}
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
                confidenceColor(confidence),
              )}
            >
              {formatConfidence(confidence)} conf
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted-fg leading-relaxed">
            {description}
          </p>
        </div>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              config.bgColor,
              config.textColor,
              "hover:opacity-80",
            )}
          >
            Take action
          </button>
        )}
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
            Reasoning ({reasoning.length})
          </button>

          {expanded && (
            <ul className="mt-2 space-y-1 pl-4">
              {reasoning.map((reason, idx) => (
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
          {formatTimestamp(createdAt)}
        </p>
      </div>
    </div>
  );
}

export { SignalCard };
export type { SignalCardProps, SignalAction };
