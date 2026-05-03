"use client";

import * as React from "react";
// cn utility - available if needed

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TickerSearchItem {
  ticker: string;
  name: string;
  exchange?: string;
  price?: number;
}

export interface TickerSearchGroup {
  label: string;
  items: TickerSearchItem[];
}

export interface TickerSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (ticker: string, name: string) => void;
  searchPlaceholder?: string;
  groups?: TickerSearchGroup[];
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function TickerSearch({
  open = false,
  onOpenChange,
  onSelect,
  searchPlaceholder = "Search tickers…",
  groups = [],
}: TickerSearchProps) {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);

  /* ---------- Global Ctrl+K / Cmd+K listener ---------- */

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange?.(!open);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  /* ---------- Filter groups by debounced search ---------- */

  const filtered = React.useMemo(() => {
    if (!debouncedSearch.trim()) return groups;
    const q = debouncedSearch.toLowerCase().trim();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.ticker.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, debouncedSearch]);

  /* ---------- Reset search on close ---------- */

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  /* ---------- Render ---------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 gap-0"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search tickers</DialogTitle>
          <DialogDescription>
            Search for stocks, ETFs, and crypto tickers.
          </DialogDescription>
        </DialogHeader>

        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {filtered.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.ticker}
                    value={`${item.ticker} ${item.name}`}
                    onSelect={() => {
                      onSelect?.(item.ticker, item.name);
                      onOpenChange?.(false);
                    }}
                    className="flex items-center justify-between gap-2"
                  >
                    {/* Left: ticker + name */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                        {item.ticker}
                      </span>
                      <span className="text-muted-fg text-xs truncate">
                        {item.name}
                      </span>
                    </div>

                    {/* Right: exchange badge + price */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.exchange && (
                        <span className="rounded-sm px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-fg leading-none">
                          {item.exchange}
                        </span>
                      )}
                      {item.price != null && (
                        <span className="font-mono text-xs tabular-nums text-foreground">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export { TickerSearch };

