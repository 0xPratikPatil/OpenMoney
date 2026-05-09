'use client';

import { cn } from "../../lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RiskSegment {
  value: number;
  label: string;
  color: string;
}

interface RiskGaugeProps {
  value: number;
  max?: number;
  label: string;
  size?: "sm" | "default" | "lg";
  segments?: RiskSegment[];
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Arc math
// ---------------------------------------------------------------------------

/**
 * Convert polar coords to cartesian, used for SVG arc paths.
 * Semi-circle: startAngle=-210°, endAngle=+30° (sweeps 240°)
 */
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    r,
    r,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

// ---------------------------------------------------------------------------
// Gauge dimensions per size
// ---------------------------------------------------------------------------

const sizeConfig = {
  sm: { dimension: 120, stroke: 8, fontSize: "text-xl", labelSize: "text-[9px]" },
  default: { dimension: 160, stroke: 10, fontSize: "text-3xl", labelSize: "text-[10px]" },
  lg: { dimension: 200, stroke: 12, fontSize: "text-4xl", labelSize: "text-[11px]" },
} as const;

const ARC_START = -210;
const ARC_END = 30;
const ARC_SWEEP = ARC_END - ARC_START; // 240 degrees

const DEFAULT_SEGMENTS: RiskSegment[] = [
  { value: 33.33, label: "Low", color: "var(--positive)" },
  { value: 33.33, label: "Medium", color: "var(--warning)" },
  { value: 33.34, label: "High", color: "var(--negative)" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function RiskGauge({
  value,
  max = 100,
  label,
  size = "default",
  segments = DEFAULT_SEGMENTS,
  loading = false,
}: RiskGaugeProps) {
  const { dimension, stroke, fontSize, labelSize } = sizeConfig[size];
  const radius = dimension / 2 - stroke;
  const cx = dimension / 2;
  const cy = dimension / 2 + stroke / 2;

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div
          className="relative animate-pulse rounded-full bg-muted"
          style={{ width: dimension, height: dimension * 0.8 }}
        />
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  // Clamp value
  const clampedValue = Math.min(Math.max(value, 0), max);
  const needleAngle = ARC_START + (clampedValue / max) * ARC_SWEEP;

  // Build segment arcs
  let cumulativeAngle = ARC_START;

  return (
    <div className="flex flex-col items-center justify-center gap-2 select-none">
      <svg
        width={dimension}
        height={dimension * 0.78}
        viewBox={`0 0 ${dimension} ${dimension * 0.78}`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        role="meter"
        aria-label={`${label}: ${clampedValue}${max === 100 ? "%" : ""}`}
      >
        {/* Background arc */}
        <path
          d={describeArc(cx, cy, radius, ARC_START, ARC_END)}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        {/* Segments */}
        {segments.map((seg, idx) => {
          const segSweep = (seg.value / 100) * ARC_SWEEP;
          const segStart = cumulativeAngle;
          const segEnd = cumulativeAngle + segSweep;
          cumulativeAngle = segEnd;

          return (
            <path
              key={idx}
              d={describeArc(cx, cy, radius, segStart, segEnd)}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
              className="transition-opacity hover:opacity-80"
            />
          );
        })}

        {/* Needle dot */}
        {(() => {
          const dotPos = polarToCartesian(
            cx,
            cy,
            radius - stroke / 2,
            needleAngle,
          );
          return (
            <circle
              cx={dotPos.x}
              cy={dotPos.y}
              r={stroke * 0.45}
              fill="var(--foreground)"
              stroke="var(--background)"
              strokeWidth={1.5}
            />
          );
        })()}

        {/* Center value */}
        <text
          x={cx}
          y={cy + stroke * 0.5}
          textAnchor="middle"
          dominantBaseline="central"
          className={cn("fill-foreground font-mono font-bold tracking-tight", fontSize)}
        >
          {clampedValue}
          {max === 100 ? "%" : ""}
        </text>

        {/* Label below value */}
        <text
          x={cx}
          y={cy + stroke * 2.2}
          textAnchor="middle"
          dominantBaseline="central"
          className={cn("fill-muted-fg font-medium uppercase tracking-wider", labelSize)}
        >
          {label}
        </text>
      </svg>

      {/* Segment legend */}
      <div className="flex items-center gap-3 mt-1">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[10px] text-muted-fg">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { RiskGauge };
export type { RiskGaugeProps, RiskSegment };
