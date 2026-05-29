/**
 * OpenMoney Finance Components — all semantic Tailwind tokens, no raw CSS vars.
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

/* ── DeltaBadge ── */
interface DeltaBadgeProps {
  value: string;
  status: "positive" | "negative" | "neutral";
  size?: "sm" | "md";
}

const deltaStyles: Record<DeltaBadgeProps["status"], string> = {
  positive: "bg-positive-bg text-positive border-positive/20",
  negative: "bg-negative-bg text-negative border-negative/20",
  neutral:  "bg-muted text-muted-foreground border-border",
};

const deltaIcon: Record<DeltaBadgeProps["status"], typeof ArrowUpRight> = {
  positive: ArrowUpRight,
  negative: ArrowDownRight,
  neutral:  Minus,
};

export function DeltaBadge({ value, status, size = "sm" }: DeltaBadgeProps) {
  const Icon = deltaIcon[status];
  return (
    <span
      data-slot="delta-badge"
      className={cn(
        "inline-flex items-center gap-0.5 font-mono font-medium border rounded-md px-1.5 py-0.5",
        size === "sm" ? "text-[10px]" : "text-xs",
        deltaStyles[status]
      )}
    >
      <Icon size={size === "sm" ? 10 : 12} strokeWidth={2.5} />
      {value}
    </span>
  );
}

/* ── SparklineBar ── */
interface SparklineBarProps {
  values: number[];
  status?: "positive" | "negative" | "neutral";
  height?: number;
  barWidth?: number;
  gap?: number;
  className?: string;
}

const sparklineColors: Record<NonNullable<SparklineBarProps["status"]>, string> = {
  positive: "bg-positive",
  negative: "bg-negative",
  neutral:  "bg-muted-foreground",
};

export function SparklineBar({
  values,
  status = "neutral",
  height = 32,
  barWidth = 3,
  gap = 2,
  className,
}: SparklineBarProps) {
  const max = Math.max(...values, 0.001);
  const lastThird = Math.floor(values.length * 0.66);

  return (
    <div
      className={cn("flex items-end overflow-hidden", className)}
      style={{ height, gap }}
      aria-hidden="true"
    >
      {values.map((v, i) => {
        const barHeight = Math.max(2, (v / max) * height);
        const isRecent = i >= lastThird;
        return (
          <div
            key={i}
            className={cn(
              "shrink-0 rounded-[1px] transition-[height]",
              isRecent ? sparklineColors[status] : "bg-border"
            )}
            style={{
              width: barWidth,
              height: barHeight,
              transitionDuration: "0.3s",
              transitionDelay: `${i * 8}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ── MetricCard ── */
interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaLabel?: string;
  accent?: boolean;
  status?: "positive" | "negative" | "neutral";
  sparkline?: number[];
  className?: string;
}

export function MetricCard({
  label, value, delta, deltaLabel, accent, status = "neutral", sparkline, className,
}: MetricCardProps) {
  return (
    <div
      data-slot="metric-card"
      className={cn(
        "relative p-4 border border-foreground/10 rounded-md overflow-hidden",
        accent && "border-foreground/20",
        className
      )}
    >
      <p className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground mb-3">
        {label}
      </p>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-mono text-4xl font-semibold leading-none">{value}</span>
        {delta && <DeltaBadge value={delta} status={status} />}
      </div>
      {deltaLabel && (
        <p className="font-mono text-[11px] text-muted-foreground mb-3">{deltaLabel}</p>
      )}
      {sparkline && <SparklineBar values={sparkline} status={status} />}
    </div>
  );
}

/* ── StatusBadge ── */
type StatusType = "ACTIVE" | "COMPLETED" | "REVIEWING" | "FAILED" | "PENDING" | "PAUSED";

const statusBadgeStyles: Record<StatusType, string> = {
  ACTIVE:    "bg-positive-bg text-positive border-positive/20",
  COMPLETED: "bg-muted text-muted-foreground border-border",
  REVIEWING: "bg-warning-bg text-warning border-warning/20",
  FAILED:    "bg-negative-bg text-negative border-negative/20",
  PENDING:   "bg-muted text-muted-foreground border-border",
  PAUSED:    "bg-muted text-muted-foreground border-border",
};

const statusDot: Record<StatusType, string> = {
  ACTIVE:    "bg-positive animate-pulse",
  COMPLETED: "bg-muted-foreground",
  REVIEWING: "bg-warning",
  FAILED:    "bg-negative",
  PENDING:   "bg-muted-foreground",
  PAUSED:    "bg-muted-foreground",
};

export function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono uppercase text-[9px] tracking-wider font-medium border",
        statusBadgeStyles[status],
        className
      )}
    >
      <span className={cn("w-1 h-1 rounded-full", statusDot[status])} />
      {status}
    </span>
  );
}

/* ── LiveIndicator ── */
export function LiveIndicator({ label = "LIVE", className }: { label?: string; className?: string }) {
  return (
    <span
      data-slot="live-indicator"
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-foreground" />
      </span>
      {label}
    </span>
  );
}

/* ── SignalGauge ── */
interface SignalGaugeProps {
  value: number;
  label?: string;
  segments?: number;
  className?: string;
}

export function SignalGauge({ value, label, segments = 40, className }: SignalGaugeProps) {
  const filled = Math.round((value / 100) * segments);
  return (
    <div data-slot="signal-gauge" className={cn("w-full", className)}>
      {label && (
        <p className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground mb-2">
          {label}
        </p>
      )}
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: segments }, (_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-[1px]",
              i < filled ? "bg-foreground" : "bg-muted"
            )}
            style={{
              height: 6,
              transition: "background-color 0.05s ease",
              transitionDelay: `${i * 8}ms`,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {["0%", "25%", "50%", "75%", "100%"].map((l) => (
          <span key={l} className="font-mono text-[9px] text-muted-foreground">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── PriorityBadge ── */
type Priority = "HIGH" | "MEDIUM" | "LOW";

const priorityStyles: Record<Priority, string> = {
  HIGH:   "text-destructive",
  MEDIUM: "text-warning",
  LOW:    "text-muted-foreground",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const bars = { HIGH: 3, MEDIUM: 2, LOW: 1 }[priority];
  return (
    <span
      data-slot="priority-badge"
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-medium",
        priorityStyles[priority],
        className
      )}
    >
      <span className="flex items-end gap-[2px]">
        {[1, 2, 3].map((b) => (
          <span
            key={b}
            className={cn(
              "w-[3px] rounded-[1px]",
              b <= bars ? "opacity-100" : "opacity-20"
            )}
            style={{ backgroundColor: "currentColor", height: b * 4 }}
          />
        ))}
      </span>
      {priority}
    </span>
  );
}

/* ── TagChip ── */
export function TagChip({ label, active, className }: {
  label: string; active?: boolean; className?: string;
}) {
  return (
    <span
      data-slot="tag-chip"
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm font-mono text-[10px] tracking-wide border",
        active
          ? "bg-muted text-foreground border-border"
          : "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      {label}
    </span>
  );
}
