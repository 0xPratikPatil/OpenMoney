"use client";

import * as React from "react";
import {
  format,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange & { preset?: string }) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

interface Preset {
  label: string;
  key: string;
  compute: () => { from: Date; to: Date };
}

const PRESETS: Preset[] = [
  { label: "1D", key: "1D", compute: () => ({ from: subDays(new Date(), 1), to: new Date() }) },
  { label: "1W", key: "1W", compute: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "1M", key: "1M", compute: () => ({ from: subMonths(new Date(), 1), to: new Date() }) },
  { label: "3M", key: "3M", compute: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: "6M", key: "6M", compute: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
  { label: "1Y", key: "1Y", compute: () => ({ from: subYears(new Date(), 1), to: new Date() }) },
  { label: "3Y", key: "3Y", compute: () => ({ from: subYears(new Date(), 3), to: new Date() }) },
  { label: "5Y", key: "5Y", compute: () => ({ from: subYears(new Date(), 5), to: new Date() }) },
  { label: "YTD", key: "YTD", compute: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  { label: "ALL", key: "ALL", compute: () => ({ from: subYears(new Date(), 20), to: new Date() }) },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateRange(from: Date, to: Date): string {
  const fmtFrom = format(from, "MMM d, yyyy");
  const fmtTo = format(to, "MMM d, yyyy");
  return `${fmtFrom} – ${fmtTo}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(value);
  const [activePreset, setActivePreset] = React.useState<string | undefined>();
  const [open, setOpen] = React.useState(false);

  /* ---------- Sync temp selection when dialog opens ---------- */

  React.useEffect(() => {
    if (open) setTempRange(value);
  }, [open, value]);

  /* ---------- Handlers ---------- */

  function handlePresetClick(preset: Preset) {
    const range = preset.compute();
    setTempRange(range);
    setActivePreset(preset.key);
    onChange?.({ ...range, preset: preset.key });
    setOpen(false);
  }

  function handleCalendarSelect(range: DateRange | undefined) {
    if (!range) return;
    // We only accept a fully selected range (both from and to)
    if (!range.from || !range.to) {
      setTempRange({ from: range.from, to: range.from });
      return;
    }
    setTempRange(range);
    setActivePreset(undefined);
  }

  function handleApply() {
    if (tempRange?.from && tempRange?.to) {
      onChange?.({ ...tempRange, preset: activePreset });
      setOpen(false);
    }
  }

  /* ---------- Display label ---------- */

  const displayLabel = value
    ? formatDateRange(value.from, value.to)
    : "Select range";

  /* ---------- Render ---------- */

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-fg" />
          <span className="min-w-[8rem] text-left tabular-nums">{displayLabel}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0"
        align="start"
        sideOffset={6}
      >
        <div className="flex">
          {/* ---------- Presets sidebar ---------- */}
          <div className="flex flex-col gap-0.5 p-2 border-r border-border min-w-[4rem]">
            {PRESETS.map((preset) => (
              <Button
                key={preset.key}
                variant="ghost"
                size="sm"
                className={cn(
                  "justify-start font-normal",
                  activePreset === preset.key && "bg-accent text-accent-foreground",
                )}
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* ---------- Calendar panels ---------- */}
          <div className="p-2">
            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={handleCalendarSelect as any}
              numberOfMonths={2}
              defaultMonth={tempRange?.from ?? new Date()}
              showOutsideDays={false}
            />

            <Separator className="my-2" />

            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-xs text-muted-fg tabular-nums">
                {tempRange?.from && tempRange?.to
                  ? formatDateRange(tempRange.from, tempRange.to)
                  : "Select a range"}
              </span>
              <Button
                variant="default"
                size="sm"
                disabled={!tempRange?.from || !tempRange?.to}
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DateRangePicker };

