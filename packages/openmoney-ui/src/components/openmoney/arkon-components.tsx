/**
 * ARKON Design System — Signature Components
 * Terminal-grade finance UI primitives
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

/* ───────────────────────────────────────────────────────────────
   DeltaBadge — Signed percentage change with directional icon
   ─────────────────────────────────────────────────────────────── */

interface DeltaBadgeProps {
  value: string;
  status: "positive" | "negative" | "neutral";
  size?: "sm" | "md";
}

export function DeltaBadge({ value, status, size = "sm" }: DeltaBadgeProps) {
  const styles = {
    positive: "bg-[var(--positive-bg)] text-[var(--positive)] border-[var(--positive)]/20",
    negative: "bg-[var(--negative-bg)] text-[var(--negative)] border-[var(--negative)]/20",
    neutral: "bg-muted text-muted-foreground border-border",
  }[status];

  const Icon = { positive: ArrowUpRight, negative: ArrowDownRight, neutral: Minus }[status];

  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 font-mono font-medium border rounded-[var(--radius-sm)] px-1.5 py-0.5",
      size === "sm" ? "text-[10px]" : "text-xs",
      styles
    )}>
      <Icon size={size === "sm" ? 10 : 12} strokeWidth={2.5} />
      {value}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────
   SparklineBar — Tick-mark bar chart (signature ARKON motif)
   ─────────────────────────────────────────────────────────────── */

interface SparklineBarProps {
  values: number[];
  status?: "positive" | "negative" | "neutral";
  height?: number;
  barWidth?: number;
  gap?: number;
  className?: string;
}

export function SparklineBar({
  values, status = "neutral", height = 32, barWidth = 3, gap = 2, className,
}: SparklineBarProps) {
  const activeColor = {
    positive: "var(--brand)",
    negative: "var(--negative)",
    neutral: "var(--text-tertiary)",
  }[status];

  const max = Math.max(...values, 0.001);
  const lastThird = Math.floor(values.length * 0.66);

  return (
    <div className={cn("flex items-end overflow-hidden", className)} style={{ height, gap }} aria-hidden="true">
      {values.map((v, i) => {
        const barHeight = Math.max(2, (v / max) * height);
        const isRecent = i >= lastThird;
        return (
          <div key={i} style={{
            width: barWidth, height: barHeight,
            backgroundColor: isRecent ? activeColor : "var(--border-strong)",
            borderRadius: 1, flexShrink: 0,
            transition: `height 0.3s ease ${i * 8}ms`,
          }} />
        );
      })}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   MetricCard — KPI with hero value, delta, and sparkline
   ─────────────────────────────────────────────────────────────── */

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaLabel?: string;
  subvalue?: string;
  accent?: boolean;
  status?: "positive" | "negative" | "neutral";
  sparkline?: number[];
  className?: string;
}

export function MetricCard({
  label, value, delta, deltaLabel, subvalue, accent, status = "neutral", sparkline, className,
}: MetricCardProps) {
  return (
    <div className={cn(
      "relative p-4 bg-[var(--background-panel)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden",
      accent && "shadow-[var(--shadow-accent)]",
      className
    )}>
      {accent && (
        <div className="absolute inset-0 pointer-events-none border border-[var(--brand-border)] rounded-[var(--radius-md)]" />
      )}

      <p className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground mb-3">{label}</p>

      <div className="flex items-baseline gap-2 mb-1">
        <span className={cn(
          "font-mono text-4xl font-semibold leading-none",
          accent ? "text-foreground" : "text-foreground"
        )}>
          {value}
        </span>
        {delta && <DeltaBadge value={delta} status={status} />}
      </div>

      {deltaLabel && <p className="font-mono text-[11px] text-[var(--text-tertiary)] mb-3">{deltaLabel}</p>}

      {sparkline && <SparklineBar values={sparkline} status={status} />}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   StatusBadge — Inline status pill for data rows
   ─────────────────────────────────────────────────────────────── */

type StatusType = "ACTIVE" | "COMPLETED" | "REVIEWING" | "FAILED" | "PENDING" | "PAUSED";

const STATUS_STYLES: Record<StatusType, string> = {
  ACTIVE: "bg-[var(--positive-bg)] text-[var(--positive)] border-[var(--positive)]/20",
  COMPLETED: "bg-muted text-muted-foreground border-border",
  REVIEWING: "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]/20",
  FAILED: "bg-[var(--negative-bg)] text-[var(--negative)] border-[var(--negative)]/20",
  PENDING: "bg-muted text-muted-foreground border-border",
  PAUSED: "bg-muted text-muted-foreground border-border",
};

const STATUS_DOT: Record<StatusType, string> = {
  ACTIVE: "bg-[var(--positive)] animate-pulse",
  COMPLETED: "bg-muted-foreground",
  REVIEWING: "bg-[var(--warning)]",
  FAILED: "bg-[var(--negative)]",
  PENDING: "bg-muted-foreground",
  PAUSED: "bg-muted-foreground",
};

export function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] font-mono uppercase text-[9px] tracking-widest font-medium border",
      STATUS_STYLES[status],
      className
    )}>
      <span className={cn("w-1 h-1 rounded-full", STATUS_DOT[status])} />
      {status}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────
   LiveIndicator — Pulsing connection status
   ─────────────────────────────────────────────────────────────── */

export function LiveIndicator({ label = "LIVE", className }: { label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-foreground", className)}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-foreground" />
      </span>
      {label}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────
   SignalGauge — Horizontal segmented gauge bar
   ─────────────────────────────────────────────────────────────── */

interface SignalGaugeProps {
  value: number;
  label?: string;
  segments?: number;
  accentColor?: string;
  className?: string;
}

export function SignalGauge({
  value, label, segments = 40, accentColor = "var(--brand)", className,
}: SignalGaugeProps) {
  const filled = Math.round((value / 100) * segments);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <p className="font-mono uppercase text-[10px] tracking-widest text-[var(--text-tertiary)] mb-2">{label}</p>
      )}
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: segments }, (_, i) => (
          <div key={i} className="flex-1 rounded-[1px]" style={{
            height: 6,
            backgroundColor: i < filled ? accentColor : "var(--background-elevated)",
            transition: "background-color 0.05s ease",
            transitionDelay: `${i * 8}ms`,
          }} />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {["0%", "25%", "50%", "75%", "100%"].map((l) => (
          <span key={l} className="font-mono text-[9px] text-[var(--text-tertiary)]">{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   PriorityBadge — HIGH/MEDIUM/LOW with vertical bars
   ─────────────────────────────────────────────────────────────── */

type Priority = "HIGH" | "MEDIUM" | "LOW";

const PRIORITY_STYLES: Record<Priority, string> = {
  HIGH: "text-[var(--negative)]",
  MEDIUM: "text-[var(--warning)]",
  LOW: "text-[var(--text-secondary)]",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const bars = { HIGH: 3, MEDIUM: 2, LOW: 1 }[priority];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-medium",
      PRIORITY_STYLES[priority],
      className
    )}>
      <span className="flex items-end gap-[2px]">
        {[1, 2, 3].map((b) => (
          <span key={b} className={cn("w-[3px] rounded-[1px]", b <= bars ? "opacity-100" : "opacity-20")}
            style={{ height: b * 4, backgroundColor: "currentColor" }} />
        ))}
      </span>
      {priority}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────
   TagChip — Small labeled chip for categories
   ─────────────────────────────────────────────────────────────── */

export function TagChip({ label, active, className }: { label: string; active?: boolean; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-sm font-mono text-[10px] tracking-wide border",
      active
        ? "bg-muted text-foreground border-border"
        : "bg-muted text-muted-foreground border-border",
      className
    )}>
      {label}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────
   SectionHeader — Panel top bar with breadcrumb/title/actions
   ─────────────────────────────────────────────────────────────── */

interface SectionHeaderProps {
  breadcrumb?: string;
  title: string;
  badge?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ breadcrumb, title, badge, actions, children, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]", className)}>
      <div className="flex items-center gap-2 min-w-0">
        {breadcrumb && (
          <>
            <span className="font-sans text-sm text-[var(--text-tertiary)] truncate">{breadcrumb}</span>
            <span className="text-[var(--text-tertiary)]">/</span>
          </>
        )}
        <span className="font-sans text-sm font-medium text-[var(--text-primary)] truncate">{title}</span>
        {badge && (
          <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--brand-dim)] text-[var(--brand)] border border-[var(--brand-border)]">
            {badge}
          </span>
        )}
      </div>
      {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
      {children}
    </div>
  );
}
