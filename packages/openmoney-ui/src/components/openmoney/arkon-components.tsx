/**
 * OpenMoney Finance Components
 * Uses proper Tailwind classes (bg-primary, text-foreground, border-border)
 * NOT raw CSS vars
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

/* ── DeltaBadge ── */
interface DeltaBadgeProps { value: string; status: "positive" | "negative" | "neutral"; size?: "sm" | "md"; }

export function DeltaBadge({ value, status, size = "sm" }: DeltaBadgeProps) {
  const styles = {
    positive: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    negative: "bg-red-500/10 text-red-500 border-red-500/20",
    neutral: "bg-muted text-muted-foreground border-border",
  }[status];
  const Icon = { positive: ArrowUpRight, negative: ArrowDownRight, neutral: Minus }[status];

  return (
    <span className={cn("inline-flex items-center gap-0.5 font-mono font-medium border rounded-md px-1.5 py-0.5", size === "sm" ? "text-[10px]" : "text-xs", styles)}>
      <Icon size={size === "sm" ? 10 : 12} strokeWidth={2.5} />
      {value}
    </span>
  );
}

/* ── SparklineBar ── */
interface SparklineBarProps { values: number[]; status?: "positive" | "negative" | "neutral"; height?: number; barWidth?: number; gap?: number; className?: string; }

export function SparklineBar({ values, status = "neutral", height = 32, barWidth = 3, gap = 2, className }: SparklineBarProps) {
  const activeColor = { positive: "var(--foreground)", negative: "var(--destructive)", neutral: "var(--muted-foreground)" }[status];
  const max = Math.max(...values, 0.001);
  const lastThird = Math.floor(values.length * 0.66);

  return (
    <div className={cn("flex items-end overflow-hidden", className)} style={{ height, gap }} aria-hidden="true">
      {values.map((v, i) => {
        const barHeight = Math.max(2, (v / max) * height);
        const isRecent = i >= lastThird;
        return <div key={i} style={{ width: barWidth, height: barHeight, backgroundColor: isRecent ? activeColor : "var(--border)", borderRadius: 1, flexShrink: 0, transition: `height 0.3s ease ${i * 8}ms` }} />;
      })}
    </div>
  );
}

/* ── MetricCard ── */
interface MetricCardProps { label: string; value: string; delta?: string; deltaLabel?: string; accent?: boolean; status?: "positive" | "negative" | "neutral"; sparkline?: number[]; className?: string; }

export function MetricCard({ label, value, delta, deltaLabel, accent, status = "neutral", sparkline, className }: MetricCardProps) {
  return (
    <div className={cn("relative p-4 border border-foreground/10 rounded-md overflow-hidden", accent && "border-foreground/20", className)}>
      <p className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground mb-3">{label}</p>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-mono text-4xl font-semibold leading-none">{value}</span>
        {delta && <DeltaBadge value={delta} status={status} />}
      </div>
      {deltaLabel && <p className="font-mono text-[11px] text-muted-foreground mb-3">{deltaLabel}</p>}
      {sparkline && <SparklineBar values={sparkline} status={status} />}
    </div>
  );
}

/* ── StatusBadge ── */
type StatusType = "ACTIVE" | "COMPLETED" | "REVIEWING" | "FAILED" | "PENDING" | "PAUSED";

const STATUS_STYLES: Record<StatusType, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  COMPLETED: "bg-muted text-muted-foreground border-border",
  REVIEWING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
  PENDING: "bg-muted text-muted-foreground border-border",
  PAUSED: "bg-muted text-muted-foreground border-border",
};

const STATUS_DOT: Record<StatusType, string> = {
  ACTIVE: "bg-emerald-500 animate-pulse",
  COMPLETED: "bg-muted-foreground",
  REVIEWING: "bg-amber-500",
  FAILED: "bg-red-500",
  PENDING: "bg-muted-foreground",
  PAUSED: "bg-muted-foreground",
};

export function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono uppercase text-[9px] tracking-wider font-medium border", STATUS_STYLES[status], className)}>
      <span className={cn("w-1 h-1 rounded-full", STATUS_DOT[status])} />
      {status}
    </span>
  );
}

/* ── LiveIndicator ── */
export function LiveIndicator({ label = "LIVE", className }: { label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground", className)}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-foreground" />
      </span>
      {label}
    </span>
  );
}

/* ── SignalGauge ── */
interface SignalGaugeProps { value: number; label?: string; segments?: number; className?: string; }

export function SignalGauge({ value, label, segments = 40, className }: SignalGaugeProps) {
  const filled = Math.round((value / 100) * segments);
  return (
    <div className={cn("w-full", className)}>
      {label && <p className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground mb-2">{label}</p>}
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: segments }, (_, i) => (
          <div key={i} className="flex-1 rounded-[1px]" style={{ height: 6, backgroundColor: i < filled ? "var(--foreground)" : "var(--muted)", transition: "background-color 0.05s ease", transitionDelay: `${i * 8}ms` }} />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {["0%", "25%", "50%", "75%", "100%"].map((l) => <span key={l} className="font-mono text-[9px] text-muted-foreground">{l}</span>)}
      </div>
    </div>
  );
}

/* ── PriorityBadge ── */
type Priority = "HIGH" | "MEDIUM" | "LOW";
const PRIORITY_STYLES: Record<Priority, string> = { HIGH: "text-red-500", MEDIUM: "text-amber-500", LOW: "text-muted-foreground" };

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const bars = { HIGH: 3, MEDIUM: 2, LOW: 1 }[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-medium", PRIORITY_STYLES[priority], className)}>
      <span className="flex items-end gap-[2px]">
        {[1, 2, 3].map((b) => <span key={b} className={cn("w-[3px] rounded-[1px]", b <= bars ? "opacity-100" : "opacity-20")} style={{ height: b * 4, backgroundColor: "currentColor" }} />)}
      </span>
      {priority}
    </span>
  );
}

/* ── TagChip ── */
export function TagChip({ label, active, className }: { label: string; active?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-sm font-mono text-[10px] tracking-wide border", active ? "bg-muted text-foreground border-border" : "bg-muted text-muted-foreground border-border", className)}>
      {label}
    </span>
  );
}
