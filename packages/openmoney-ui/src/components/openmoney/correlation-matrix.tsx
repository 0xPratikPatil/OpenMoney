import * as React from "react";
import { cn } from "../../lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CorrelationEntry {
  ticker: string;
  correlations: Record<string, number>;
}

interface CorrelationMatrixProps {
  data: CorrelationEntry[];
  loading?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Color interpolation
// ---------------------------------------------------------------------------

/**
 * Interpolate between two hex colors. Returns an rgba string.
 * Used to map correlation coefficients to heatmap cell colors.
 */
function interpolateColor(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number,
  t: number,
): string {
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

/** Green (positive), White (zero), Red (negative) */
function correlationColor(value: number): string {
  // Clamp to [-1, 1]
  const v = Math.max(-1, Math.min(1, value));

  if (v > 0) {
    // Positive: white → green (0 → 1)
    return interpolateColor(
      240, 240, 240,   // white-ish
      22, 163, 74,      // positive green (#16A34A)
      v,
    );
  }
  // Negative: red → white (-1 → 0)
  return interpolateColor(
    220, 38, 38,        // negative red (#DC2626)
    240, 240, 240,      // white-ish
    1 + v,              // flip t so v=-1 gives red, v=0 gives white
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CELL_SIZE = 56;
const LABEL_WIDTH = 80;
const HEADER_HEIGHT = 48;
const GAP = 2;

function CorrelationMatrix({
  data,
  loading = false,
  className,
}: CorrelationMatrixProps) {
  const [tooltip, setTooltip] = React.useState<{
    x: number;
    y: number;
    pair: string;
    value: number;
  } | null>(null);
  const [threshold, setThreshold] = React.useState<number>(0);

  // --- Loading state ---
  if (loading) {
    const skeletonCount = Math.min(data.length || 5, 6);
    return (
      <div className={cn("space-y-1", className)}>
        {/* Header skeleton */}
        <div className="flex items-end gap-[2px] pl-[80px]">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="h-5 w-[56px] animate-pulse rounded bg-muted"
            />
          ))}
        </div>
        {/* Row skeletons */}
        {Array.from({ length: skeletonCount }).map((_, row) => (
          <div key={row} className="flex items-center gap-[2px]">
            <div className="mr-2 h-5 w-[72px] animate-pulse rounded bg-muted" />
            {Array.from({ length: skeletonCount }).map((_, col) => (
              <div
                key={col}
                className="size-[56px] animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // --- Empty state ---
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12",
          className,
        )}
      >
        <p className="text-sm font-medium text-muted-fg">
          No correlation data
        </p>
        <p className="mt-1 text-xs text-muted-fg/60">
          Add securities to view pairwise correlations
        </p>
      </div>
    );
  }

  const tickers = data.map((d) => d.ticker);

  const svgWidth = LABEL_WIDTH + tickers.length * (CELL_SIZE + GAP) + GAP;
  const svgHeight =
    HEADER_HEIGHT + tickers.length * (CELL_SIZE + GAP) + GAP;

  function getValue(rowTicker: string, colTicker: string): number | null {
    const entry = data.find((d) => d.ticker === rowTicker);
    if (!entry) return null;
    const val = entry.correlations[colTicker];
    return val ?? null;
  }

  function handleCellClick(
    rowTicker: string,
    colTicker: string,
    value: number,
    clientX: number,
    clientY: number,
  ) {
    if (Math.abs(value) < threshold) return;
    setTooltip({
      x: clientX,
      y: clientY,
      pair: `${rowTicker} / ${colTicker}`,
      value,
    });
  }

  return (
    <div className={cn("relative select-none", className)}>
      {/* Threshold toggle */}
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setThreshold(threshold === 0 ? 0.3 : 0)}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
            threshold > 0
              ? "bg-info/10 text-info"
              : "bg-muted text-muted-fg hover:text-foreground",
          )}
        >
          {threshold > 0 ? "Showing |r| ≥ 0.3" : "Show all correlations"}
        </button>
      </div>

      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="overflow-visible"
        role="grid"
        aria-label="Correlation matrix heatmap"
      >
        {/* Column headers (ticker labels) */}
        {tickers.map((ticker, col) => (
          <text
            key={`col-${ticker}`}
            x={LABEL_WIDTH + col * (CELL_SIZE + GAP) + CELL_SIZE / 2}
            y={HEADER_HEIGHT - 12}
            textAnchor="end"
            transform={`rotate(-45, ${LABEL_WIDTH + col * (CELL_SIZE + GAP) + CELL_SIZE / 2}, ${HEADER_HEIGHT - 12})`}
            className="fill-muted-fg text-[11px] font-mono font-medium"
          >
            {ticker}
          </text>
        ))}

        {/* Row labels + cells */}
        {tickers.map((rowTicker, row) => (
          <g key={`row-${rowTicker}`}>
            {/* Row label */}
            <text
              x={LABEL_WIDTH - 8}
              y={HEADER_HEIGHT + row * (CELL_SIZE + GAP) + CELL_SIZE / 2}
              textAnchor="end"
              dominantBaseline="central"
              className="fill-muted-fg text-[11px] font-mono font-medium"
            >
              {rowTicker}
            </text>

            {tickers.map((colTicker, col) => {
              const value = getValue(rowTicker, colTicker);
              const isSignificant =
                value !== null && Math.abs(value) >= threshold;
                            const isSelf = row === col;

              // Only show upper triangle + diagonal
              if (col < row) {
                return (
                  <rect
                    key={`cell-${rowTicker}-${colTicker}`}
                    x={LABEL_WIDTH + col * (CELL_SIZE + GAP)}
                    y={HEADER_HEIGHT + row * (CELL_SIZE + GAP)}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    fill="transparent"
                  />
                );
              }

              const fillColor =
                value !== null
                  ? isSelf
                    ? "var(--muted)"
                    : correlationColor(value)
                  : "var(--muted)";

              const opacity = isSignificant || isSelf ? 1 : 0.3;

              return (
                <g
                  key={`cell-${rowTicker}-${colTicker}`}
                  onClick={(e) => {
                    if (value !== null && !isSelf) {
                      const rect = (
                        e.currentTarget as SVGGElement
                      ).getBoundingClientRect();
                      handleCellClick(
                        rowTicker,
                        colTicker,
                        value,
                        rect.left + rect.width / 2,
                        rect.top,
                      );
                    }
                  }}
                  className={cn(
                    !isSelf && "cursor-pointer",
                  )}
                  role="gridcell"
                  aria-label={
                    value !== null
                      ? `${rowTicker}/${colTicker}: ${value.toFixed(2)}`
                      : `${rowTicker}/${colTicker}: no data`
                  }
                >
                  <rect
                    x={LABEL_WIDTH + col * (CELL_SIZE + GAP)}
                    y={HEADER_HEIGHT + row * (CELL_SIZE + GAP)}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    rx={4}
                    fill={fillColor}
                    opacity={opacity}
                    className="transition-opacity hover:opacity-90"
                  />

                  {/* Value label */}
                  {value !== null && (isSignificant || isSelf) && (
                    <text
                      x={
                        LABEL_WIDTH +
                        col * (CELL_SIZE + GAP) +
                        CELL_SIZE / 2
                      }
                      y={
                        HEADER_HEIGHT +
                        row * (CELL_SIZE + GAP) +
                        CELL_SIZE / 2
                      }
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={cn(
                        "text-[11px] font-mono font-bold",
                        isSelf
                          ? "fill-muted-fg"
                          : Math.abs(value) > 0.7
                            ? "fill-white"
                            : "fill-foreground",
                      )}
                    >
                      {value.toFixed(2)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border border-border bg-background px-3 py-2 shadow-lg"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 8,
          }}
        >
          <p className="text-xs font-semibold text-foreground">
            {tooltip.pair}
          </p>
          <p className="mt-0.5 text-[11px] font-mono tabular-nums text-muted-fg">
            r = {tooltip.value.toFixed(4)}
          </p>
        </div>
      )}

      {/* Click-away to dismiss tooltip */}
      {tooltip && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setTooltip(null)}
        />
      )}
    </div>
  );
}

export { CorrelationMatrix };
export type { CorrelationMatrixProps, CorrelationEntry };
