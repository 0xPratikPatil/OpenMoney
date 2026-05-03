"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import {
  Plus,
  X,
  Eye,
  EyeOff,
  TrendingUp,
  Search,
  Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComparisonItem {
  ticker: string;
  color: string;
  visible: boolean;
}

interface ComparisonOverlayProps {
  items: ComparisonItem[];
  onToggleVisibility: (ticker: string) => void;
  onRemove: (ticker: string) => void;
  onAddTicker: (ticker: string) => void;
  benchmark?: string;
  onBenchmarkChange?: (benchmark: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BENCHMARK_OPTIONS = ["SPY", "QQQ", "IWM", "DIA", "AGG", "TLT", "GLD"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function ComparisonOverlay({
  items,
  onToggleVisibility,
  onRemove,
  onAddTicker,
  benchmark,
  onBenchmarkChange,
  className,
}: ComparisonOverlayProps) {
  const [adding, setAdding] = React.useState(false);
  const [newTicker, setNewTicker] = React.useState("");

  const inputRef = React.useRef<HTMLInputElement>(null);

  /* Focus input when add mode is activated */
  React.useEffect(() => {
    if (adding) {
      inputRef.current?.focus();
    }
  }, [adding]);

  /* ---------- Submit new ticker ---------- */

  function handleAdd() {
    const trimmed = newTicker.trim().toUpperCase();
    if (trimmed) {
      onAddTicker(trimmed);
      setNewTicker("");
      setAdding(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleAdd();
    }
    if (e.key === "Escape") {
      setAdding(false);
      setNewTicker("");
    }
  }

  /* ---------- Render ---------- */

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-background p-3",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="size-4 text-muted-fg" aria-hidden="true" />
          <span className="text-xs font-semibold text-foreground">
            Comparison
          </span>
        </div>

        {/* Add ticker button */}
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
            "border border-border text-muted-fg hover:border-muted-fg hover:text-foreground",
          )}
        >
          <Plus className="size-3" />
          Add
        </button>
      </div>

      {/* Inline add input */}
      {adding && (
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-fg" />
            <input
              ref={inputRef}
              type="text"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search ticker…"
              className={cn(
                "h-7 w-full rounded-md border border-border bg-muted pl-7 pr-2 text-xs font-mono text-foreground",
                "placeholder:text-muted-fg/50",
                "focus:border-muted-fg focus:outline-none",
              )}
              aria-label="Add ticker"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newTicker.trim()}
            className={cn(
              "inline-flex items-center justify-center rounded-md p-1 text-xs font-medium transition-colors",
              "bg-foreground text-background hover:opacity-90",
              "disabled:opacity-30 disabled:pointer-events-none",
            )}
            aria-label="Confirm add ticker"
          >
            <Check className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setNewTicker("");
            }}
            className="inline-flex items-center justify-center rounded-md p-1 text-muted-fg hover:text-foreground transition-colors"
            aria-label="Cancel add ticker"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Legend list */}
      {items.length > 0 && (
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li
              key={item.ticker}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
            >
              {/* Left: color dot + ticker */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="block size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "font-mono text-xs font-semibold tabular-nums transition-opacity",
                    item.visible
                      ? "text-foreground"
                      : "text-muted-fg opacity-50",
                  )}
                >
                  {item.ticker}
                </span>
              </div>

              {/* Right: visibility toggle + remove */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onToggleVisibility(item.ticker)}
                  className={cn(
                    "rounded p-0.5 transition-colors",
                    item.visible
                      ? "text-muted-fg hover:text-foreground"
                      : "text-muted-fg/40 hover:text-muted-fg",
                  )}
                  aria-label={
                    item.visible
                      ? `Hide ${item.ticker}`
                      : `Show ${item.ticker}`
                  }
                >
                  {item.visible ? (
                    <Eye className="size-3.5" />
                  ) : (
                    <EyeOff className="size-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(item.ticker)}
                  className="rounded p-0.5 text-muted-fg/60 hover:text-negative transition-colors"
                  aria-label={`Remove ${item.ticker}`}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <p className="py-2 text-center text-[11px] text-muted-fg">
          No tickers added. Click &ldquo;Add&rdquo; to compare assets.
        </p>
      )}

      {/* Benchmark picker */}
      {onBenchmarkChange && (
        <div className="flex items-center gap-2 border-t border-border pt-2">
          <label className="text-[11px] font-medium text-muted-fg shrink-0">
            Benchmark
          </label>
          <select
            value={benchmark ?? ""}
            onChange={(e) => onBenchmarkChange(e.target.value)}
            className={cn(
              "h-6 flex-1 rounded-md border border-border bg-muted px-2 text-xs font-mono text-foreground",
              "focus:border-muted-fg focus:outline-none",
            )}
            aria-label="Select benchmark"
          >
            <option value="" disabled>
              Select…
            </option>
            {BENCHMARK_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value="__custom__">Custom…</option>
          </select>
        </div>
      )}
    </div>
  );
}

export { ComparisonOverlay };
export type { ComparisonOverlayProps, ComparisonItem };
