import { cn } from "../../lib/utils";
import { MetricBlock } from "./metric-block";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MetricsGridItem {
  label: string;
  value: string | number;
  change?: { value: string; direction: "up" | "down" | "neutral" };
  trend?: "up" | "down" | "neutral";
  size?: "sm" | "default" | "lg";
}

interface MetricsGridProps {
  items: MetricsGridItem[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  title?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Column maps
// ---------------------------------------------------------------------------

const columnClasses: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function MetricsGrid({
  items,
  columns = 3,
  loading = false,
  title,
  className,
}: MetricsGridProps) {
  // --- Loading state ---
  if (loading) {
    const skeletonCount = Math.max(items.length || columns, 4);
    return (
      <div className={cn("space-y-4", className)}>
        {title && (
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        )}
        <div
          className={cn("grid gap-4", columnClasses[columns])}
        >
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border p-4">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Empty state ---
  if (!items || items.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12",
          className,
        )}
      >
        <p className="text-sm font-medium text-muted-fg">No metrics</p>
        <p className="mt-1 text-xs text-muted-fg/60">
          Add metrics to populate this grid
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      )}
      <div className={cn("grid gap-4", columnClasses[columns])}>
        {items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-sm"
          >
            <MetricBlock
              label={item.label}
              value={item.value}
              change={item.change}
              trend={item.trend}
              size={item.size}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export { MetricsGrid };
export type { MetricsGridProps, MetricsGridItem };
