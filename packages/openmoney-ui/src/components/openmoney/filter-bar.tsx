import * as React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDefinition {
  id: string;
  label: string;
  options?: FilterOption[];
  value?: string;
  onChange?: (value: string) => void;
}

interface ActiveFilter {
  id: string;
  value: string;
}

interface FilterBarProps {
  filters: FilterDefinition[];
  activeFilters: ActiveFilter[];
  onClear: () => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Look up the display label for a given filter-value pair.
 */
function getFilterLabel(
  filter: FilterDefinition,
  value: string,
): string {
  if (!filter.options) return value;
  const option = filter.options.find((o) => o.value === value);
  return option?.label ?? value;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function FilterBar({
  filters,
  activeFilters,
  onClear,
  className,
}: FilterBarProps) {
  const hasActiveFilters = activeFilters.length > 0;

  // Build a lookup of filter id → definition
  const filterMap = React.useMemo(() => {
    const map = new Map<string, FilterDefinition>();
    for (const f of filters) {
      map.set(f.id, f);
    }
    return map;
  }, [filters]);

  // Handle dropdown change
  function handleDropdownChange(
    _filterId: string,
    onChange: ((value: string) => void) | undefined,
    value: string,
  ) {
    onChange?.(value);
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Dropdown filters */}
      {filters.map((filter) => {
        if (!filter.options) return null;

        return (
          <select
            key={filter.id}
            value={filter.value ?? ""}
            onChange={(e) =>
              handleDropdownChange(
                filter.id,
                filter.onChange,
                e.target.value,
              )
            }
            className={cn(
              "h-9 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground",
              "border-border hover:border-muted-fg/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-muted-fg/50",
              "appearance-none cursor-pointer",
              !filter.value && "text-muted-fg",
            )}
            aria-label={filter.label}
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      })}

      {/* Active filter chips */}
      {activeFilters.map((active) => {
        const def = filterMap.get(active.id);
        if (!def) return null;

        const label = getFilterLabel(def, active.value);

        return (
          <span
            key={`${active.id}-${active.value}`}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium",
              "bg-muted text-foreground",
            )}
          >
            {label}
            <button
              type="button"
              onClick={() => def.onChange?.("")}
              className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-muted-fg hover:bg-muted-fg/20 hover:text-foreground transition-colors"
              aria-label={`Remove ${label} filter`}
            >
              <X className="size-3" />
            </button>
          </span>
        );
      })}

      {/* Clear all button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            "ml-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
            "text-muted-fg hover:text-foreground hover:bg-muted",
          )}
        >
          Clear all
        </button>
      )}
    </div>
  );
}

export { FilterBar };
export type { FilterBarProps, FilterDefinition, FilterOption, ActiveFilter };

