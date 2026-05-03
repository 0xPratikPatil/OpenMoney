import * as React from "react";
import { cn } from "../../lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PriceChartProps {
  children?: React.ReactNode;
  loading?: boolean;
  timeframes?: string[];
  selectedTimeframe?: string;
  onTimeframeChange?: (tf: string) => void;
  height?: number;
}

const DEFAULT_TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PriceChart = React.forwardRef<HTMLDivElement, PriceChartProps>(
  (
    {
      children,
      loading = false,
      timeframes = DEFAULT_TIMEFRAMES,
      selectedTimeframe,
      onTimeframeChange,
      height = 400,
    },
    ref,
  ) => {
    const hasNoData = !loading && !children;

    return (
      <div
        className="rounded-lg border border-border bg-background overflow-hidden"
        style={{ height: height + 44 }} // 44px for toolbar
      >
        {/* Timeframe toolbar */}
        <div className="flex items-center justify-between px-3 h-[44px] border-b border-border">
          <div className="flex items-center gap-1">
            {timeframes.map((tf) => {
              const isSelected = selectedTimeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => onTimeframeChange?.(tf)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isSelected
                      ? "bg-foreground text-background"
                      : "text-muted-fg hover:text-foreground hover:bg-muted",
                  )}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart area */}
        <div
          ref={ref}
          className="relative"
          style={{ height }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="animate-pulse rounded bg-muted"
                  style={{ width: 300, height: height * 0.6 }}
                />
                <p className="text-xs text-muted-fg animate-pulse">
                  Loading chart data…
                </p>
              </div>
            </div>
          ) : hasNoData ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-muted-fg">No data available</p>
            </div>
          ) : (
            <div className="absolute inset-0">{children}</div>
          )}
        </div>
      </div>
    );
  },
);

PriceChart.displayName = "PriceChart";

export { PriceChart };
export type { PriceChartProps };
