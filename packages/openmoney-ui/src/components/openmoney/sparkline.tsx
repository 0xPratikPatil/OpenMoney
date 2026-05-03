"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  showFill?: boolean;
  color?: string;
  loading?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalise data to fit within the SVG viewBox (0–width, 0–height),
 * preserving the aspect ratio of the series.
 */
function normalise(
  data: number[],
  width: number,
  height: number,
): { points: { x: number; y: number }[]; path: string; area: string } {
  if (data.length === 0) {
    return { points: [], path: "", area: "" };
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // avoid division by zero when all values equal

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - ((value - min) / range) * (height - 2) - 1, // 1px inset
  }));

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  const area =
    points.length > 1
      ? `M${points[0]!.x.toFixed(1)},${height}L${line.substring(1)}L${points[points.length - 1]!.x.toFixed(1)},${height}Z`
      : "";

  return { points, path: line, area };
}

function autoColor(data: number[]): string {
  if (!data || data.length < 2) return "var(--muted-fg)";
  const last = data[data.length - 1]!;
  const first = data[0]!;
  if (last > first) return "var(--positive)";
  if (last < first) return "var(--negative)";
  return "var(--muted-fg)";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function Sparkline({
  data,
  width = 80,
  height = 24,
  showFill = false,
  color,
  loading = false,
  className,
}: SparklineProps) {
  const strokeColor = color ?? autoColor(data);
  const { path, area } = React.useMemo(
    () => normalise(data, width, height),
    [data, width, height],
  );

  /* ---------- Loading skeleton ---------- */

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          className,
        )}
        style={{ width, height }}
        aria-label="Loading sparkline"
      >
        <Loader2 className="size-4 animate-spin text-muted-fg" />
      </div>
    );
  }

  /* ---------- Empty state ---------- */

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-1 text-muted-fg",
          className,
        )}
        style={{ width, height }}
        aria-label="No data"
      >
        <Minus className="size-3" />
      </div>
    );
  }

  /* ---------- Rendered sparkline ---------- */

  const trend =
    data.length >= 2
      ? data[data.length - 1]! > data[0]!
        ? "up"
        : data[data.length - 1]! < data[0]!
          ? "down"
          : "flat"
      : "flat";

  const TrendIcon =
    trend === "up"
      ? TrendingUp
      : trend === "down"
        ? TrendingDown
        : Minus;

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      style={{ width, height }}
      role="img"
      aria-label={`Sparkline trend: ${trend === "up" ? "upward" : trend === "down" ? "downward" : "flat"}`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="shrink-0 overflow-visible"
      >
        {/* Area fill */}
        {showFill && area && (
          <path
            d={area}
            fill={strokeColor}
            fillOpacity={0.12}
          />
        )}

        {/* Line */}
        {path && (
          <path
            d={path}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* End dot */}
        {data.length > 0 && (
          <circle
            cx={
              ((data.length - 1) / (data.length - 1 || 1)) * width
            }
            cy={
              height -
              ((data[data.length - 1]! - Math.min(...data)) /
                (Math.max(...data) - Math.min(...data) || 1)) *
                (height - 2) -
              1
            }
            r={2}
            fill={strokeColor}
          />
        )}
      </svg>

      {/* Small direction indicator */}
      <TrendIcon
        className="size-3 shrink-0"
        style={{ color: strokeColor }}
      />
    </div>
  );
}

export { Sparkline };
export type { SparklineProps };

