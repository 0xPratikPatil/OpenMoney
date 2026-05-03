import * as React from "react";
import { cn } from "../../lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Position {
  id: string;
  ticker: string;
  name?: string;
  quantity: number;
  avgPrice: number;
  currentPrice?: number;
  marketValue?: number;
  unrealizedPnl?: number;
  unrealizedPnlPercent?: number;
  allocation?: number;
  openedAt: string;
}

interface PositionTableProps {
  positions: Position[];
  loading?: boolean;
  onRowClick?: (id: string) => void;
  visibleColumns?: string[];
}

type SortKey = keyof Position | null;
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// Column definition
// ---------------------------------------------------------------------------

interface ColumnDef {
  key: string;
  label: string;
  accessor: (row: Position) => React.ReactNode;
  sortable: boolean;
  align: "left" | "right";
  format?: (value: number) => string;
}

const ALL_COLUMNS: ColumnDef[] = [
  {
    key: "ticker",
    label: "Ticker",
    accessor: (row) => (
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">{row.ticker}</span>
        {row.name && (
          <span className="text-xs text-muted-fg">{row.name}</span>
        )}
      </div>
    ),
    sortable: true,
    align: "left",
  },
  {
    key: "quantity",
    label: "Qty",
    accessor: (row) => row.quantity.toLocaleString(),
    sortable: true,
    align: "right",
  },
  {
    key: "avgPrice",
    label: "Avg Price",
    accessor: (row) => `$${row.avgPrice.toFixed(2)}`,
    sortable: true,
    align: "right",
  },
  {
    key: "currentPrice",
    label: "Price",
    accessor: (row) =>
      row.currentPrice != null ? `$${row.currentPrice.toFixed(2)}` : "—",
    sortable: true,
    align: "right",
  },
  {
    key: "marketValue",
    label: "Mkt Value",
    accessor: (row) =>
      row.marketValue != null
        ? `$${row.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "—",
    sortable: true,
    align: "right",
  },
  {
    key: "unrealizedPnl",
    label: "P&L",
    accessor: (row) =>
      row.unrealizedPnl != null ? formatCurrency(row.unrealizedPnl) : "—",
    sortable: true,
    align: "right",
  },
  {
    key: "unrealizedPnlPercent",
    label: "P&L %",
    accessor: (row) =>
      row.unrealizedPnlPercent != null ? (
        <span
          className={cn(
            row.unrealizedPnlPercent >= 0 ? "text-positive" : "text-negative",
          )}
        >
          {row.unrealizedPnlPercent >= 0 ? "+" : ""}
          {row.unrealizedPnlPercent.toFixed(2)}%
        </span>
      ) : (
        "—"
      ),
    sortable: true,
    align: "right",
  },
  {
    key: "allocation",
    label: "Alloc",
    accessor: (row) =>
      row.allocation != null ? `${row.allocation.toFixed(1)}%` : "—",
    sortable: true,
    align: "right",
  },
  {
    key: "openedAt",
    label: "Opened",
    accessor: (row) => formatDate(row.openedAt),
    sortable: true,
    align: "right",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = `$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function sortPositions(
  positions: Position[],
  key: SortKey,
  dir: SortDir,
): Position[] {
  if (!key) return positions;
  return [...positions].sort((a, b) => {
    const aVal = a[key as keyof Position];
    const bVal = b[key as keyof Position];

    // Nulls sort last
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    let cmp = 0;
    if (typeof aVal === "string" && typeof bVal === "string") {
      cmp = aVal.localeCompare(bVal);
    } else {
      cmp = (aVal as number) - (bVal as number);
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

const SKELETON_ROWS = 5;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PositionTable({
  positions,
  loading = false,
  onRowClick,
  visibleColumns,
}: PositionTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>(null);
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  const columns = React.useMemo(() => {
    if (!visibleColumns || visibleColumns.length === 0) return ALL_COLUMNS;
    return ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  const sorted = React.useMemo(
    () => sortPositions(positions, sortKey, sortDir),
    [positions, sortKey, sortDir],
  );

  const handleSort = (key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key as SortKey;
    });
  };

  const sortIndicator = (colKey: string) => {
    if (sortKey !== colKey) return null;
    return (
      <span className="ml-1 text-[10px] leading-none">
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  // Empty state
  if (!loading && positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-muted-fg">No positions yet</p>
        <button
          type="button"
          className="mt-2 text-sm text-info hover:underline focus:outline-none"
        >
          Add your first position
        </button>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className={cn(
                  "h-10 px-4 text-xs font-medium uppercase tracking-wider text-muted-fg select-none",
                  col.align === "right" ? "text-right" : "text-left",
                  idx === 0 && "sticky left-0 z-10 bg-muted/50",
                  col.sortable && "cursor-pointer hover:text-foreground transition-colors",
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center">
                  {col.label}
                  {col.sortable && sortIndicator(col.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading
            ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={`skel-${i}`} className="border-b border-border/60">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "h-12 px-4",
                        col.align === "right" ? "text-right" : "text-left",
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 animate-pulse rounded bg-muted",
                          col.key === "ticker" ? "w-20" : "w-16",
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : sorted.map((row) => {
                const isPositive =
                  row.unrealizedPnl != null && row.unrealizedPnl >= 0;
                const isNegative =
                  row.unrealizedPnl != null && row.unrealizedPnl < 0;

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-border/60 transition-colors",
                      onRowClick && "cursor-pointer",
                      "hover:bg-muted/40",
                    )}
                    onClick={() => onRowClick?.(row.id)}
                  >
                    {columns.map((col, idx) => {
                      const cellContent = col.accessor(row);

                      if (col.key === "unrealizedPnl") {
                        return (
                          <td
                            key={col.key}
                            className={cn(
                              "h-12 px-4 font-mono tabular-nums text-right",
                              isPositive && "text-positive",
                              isNegative && "text-negative",
                              idx === 0 && "sticky left-0 bg-background",
                            )}
                          >
                            {cellContent}
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "h-12 px-4",
                            col.align === "right"
                              ? "text-right font-mono tabular-nums"
                              : "",
                            idx === 0 &&
                              "sticky left-0 bg-background font-semibold",
                          )}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}

export { PositionTable };
export type { Position, PositionTableProps };
