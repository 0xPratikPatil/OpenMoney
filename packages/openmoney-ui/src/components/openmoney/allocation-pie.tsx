import * as React from "react";
import { cn } from "../../lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AllocationSegment {
  label: string;
  value: number;
  color: string;
}

interface AllocationPieProps {
  segments: AllocationSegment[];
  totalLabel?: string;
  loading?: boolean;
  size?: number;
}

// ---------------------------------------------------------------------------
// Arc helpers
// ---------------------------------------------------------------------------

interface ArcCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  d: string;
}

function buildArcPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): ArcCoords {
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;

  const x1 = cx + outerR * Math.cos(startRad);
  const y1 = cy + outerR * Math.sin(startRad);
  const x2 = cx + outerR * Math.cos(endRad);
  const y2 = cy + outerR * Math.sin(endRad);

  const x1Inner = cx + innerR * Math.cos(startRad);
  const y1Inner = cy + innerR * Math.sin(startRad);
  const x2Inner = cx + innerR * Math.cos(endRad);
  const y2Inner = cy + innerR * Math.sin(endRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  const d = [
    `M ${x1} ${y1}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x2Inner} ${y2Inner}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1Inner} ${y1Inner}`,
    "Z",
  ].join(" ");

  return { x1, y1, x2, y2, d };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function AllocationPie({
  segments,
  totalLabel,
  loading = false,
  size = 200,
}: AllocationPieProps) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.6;
  const cx = size / 2;
  const cy = size / 2;

  const total = React.useMemo(
    () => segments.reduce((sum, s) => sum + s.value, 0),
    [segments],
  );

  const hasData = segments.length > 0 && total > 0;

  // Build arc data
  const arcs = React.useMemo(() => {
    if (!hasData) return [];

    let cumulativeAngle = 0;
    return segments.map((seg) => {
      const sweep = (seg.value / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sweep;
      cumulativeAngle = endAngle;

      return {
        ...buildArcPath(cx, cy, outerRadius, innerRadius, startAngle, endAngle),
        segment: seg,
        percentage: ((seg.value / total) * 100).toFixed(1),
      };
    });
  }, [segments, total, hasData, cx, cy, outerRadius, innerRadius]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className="animate-pulse rounded-full bg-muted"
          style={{ width: size, height: size }}
        />
        <div className="flex flex-wrap justify-center gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="size-3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center gap-2" style={{ height: size + 40 }}>
        <div
          className="flex items-center justify-center rounded-full border-2 border-dashed border-border"
          style={{ width: size, height: size }}
        >
          <span className="text-sm text-muted-fg">No allocation data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Asset allocation donut chart"
      >
        {arcs.map((arc, idx) => (
          <g key={idx}>
            <path
              d={arc.d}
              fill={arc.segment.color}
              stroke="var(--background)"
              strokeWidth={1.5}
              className={cn(
                "transition-opacity duration-150",
                hoveredIdx !== null && hoveredIdx !== idx && "opacity-50",
                hoveredIdx === idx && "opacity-90",
              )}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          </g>
        ))}

        {/* Center label */}
        {totalLabel != null && (
          <>
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-fg text-[10px] font-medium uppercase tracking-wider"
              style={{ fontSize: Math.max(size * 0.05, 8) }}
            >
              {totalLabel}
            </text>
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground font-mono font-bold"
              style={{ fontSize: Math.max(size * 0.09, 12) }}
            >
              {total.toLocaleString()}
            </text>
          </>
        )}
      </svg>

      {/* Tooltip on hover */}
      {hoveredIdx !== null && arcs[hoveredIdx] && (
        <div className="text-center rounded-md bg-muted px-3 py-1.5">
          <p className="text-xs font-semibold text-foreground">
            {arcs[hoveredIdx].segment.label}
          </p>
          <p className="text-[10px] font-mono text-muted-fg">
            {arcs[hoveredIdx].segment.value.toLocaleString()} ({arcs[hoveredIdx].percentage}%)
          </p>
        </div>
      )}

      {/* Legend */}
      {!hoveredIdx && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {arcs.map((arc, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span
                className="inline-block size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: arc.segment.color }}
              />
              <span className="text-[11px] text-muted-fg truncate max-w-[80px]">
                {arc.segment.label}
              </span>
              <span className="text-[11px] font-mono tabular-nums text-muted-fg">
                {arc.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { AllocationPie };
export type { AllocationPieProps, AllocationSegment };
