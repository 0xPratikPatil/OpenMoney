"use client";

import { cn } from "../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FreshnessState = "live" | "recent" | "stale" | "delayed" | "offline";

interface DataFreshnessIndicatorProps {
  state: FreshnessState;
  timestamp?: Date;
  label?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// State config
// ---------------------------------------------------------------------------

const stateConfig: Record<
  FreshnessState,
  { dotColor: string; defaultLabel: string; ringColor: string }
> = {
  live: {
    dotColor: "var(--positive)",
    defaultLabel: "Live",
    ringColor: "shadow-[0_0_6px_var(--positive)]",
  },
  recent: {
    dotColor: "var(--info)",
    defaultLabel: "Recent",
    ringColor: "shadow-[0_0_6px_var(--info)]",
  },
  stale: {
    dotColor: "var(--warning)",
    defaultLabel: "Stale",
    ringColor: "shadow-[0_0_6px_var(--warning)]",
  },
  delayed: {
    dotColor: "#EA580C", // orange-600
    defaultLabel: "Delayed",
    ringColor: "shadow-[0_0_6px_#EA580C]",
  },
  offline: {
    dotColor: "var(--negative)",
    defaultLabel: "Offline",
    ringColor: "shadow-[0_0_6px_var(--negative)]",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function relativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function DataFreshnessIndicator({
  state,
  timestamp,
  label,
  className,
}: DataFreshnessIndicatorProps) {
  const cfg = stateConfig[state];
  const displayLabel = label ?? cfg.defaultLabel;

  const dot = (
    <span
      className={cn(
        "relative inline-flex size-2 shrink-0 rounded-full",
        state === "live" && "animate-pulse",
        cfg.ringColor,
      )}
      style={{ backgroundColor: cfg.dotColor }}
    />
  );

  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none",
        "bg-background border border-border",
        className,
      )}
    >
      {dot}
      <span className="text-foreground">{displayLabel}</span>
    </span>
  );

  /* ---------- With tooltip ---------- */

  if (timestamp) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{inner}</TooltipTrigger>
          <TooltipContent side="top" align="center">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium">
                Last update: {formatTimestamp(timestamp)}
              </span>
              <span className="text-[11px] text-muted-fg/70">
                {relativeTime(timestamp)}
              </span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  /* ---------- Without tooltip ---------- */

  return inner;
}

export { DataFreshnessIndicator };
export type { DataFreshnessIndicatorProps, FreshnessState };
