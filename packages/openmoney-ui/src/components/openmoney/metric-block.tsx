import * as React from "react";
import { cn } from "../../lib/utils";

interface MetricBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: { value: string; direction: "up" | "down" | "neutral" };
  trend?: "up" | "down" | "neutral";
  size?: "sm" | "default" | "lg";
  loading?: boolean;
}

function MetricBlock({
  label,
  value,
  change,
  trend,
  size = "default",
  loading = false,
  className,
  ...props
}: MetricBlockProps) {
  if (loading) {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        {change && <div className="h-3 w-16 animate-pulse rounded bg-muted" />}
      </div>
    );
  }

  const sizeClasses = {
    sm: { value: "text-lg", label: "text-xs" },
    default: { value: "text-2xl", label: "text-xs" },
    lg: { value: "text-3xl", label: "text-sm" },
  };

  return (
    <div className={cn("space-y-1", className)} {...props}>
      <p className={cn("text-muted-fg font-medium", sizeClasses[size].label)}>
        {label}
      </p>
      <p className={cn(
        "font-mono tabular-nums tracking-tight font-semibold",
        sizeClasses[size].value,
        trend === "up" && "text-positive",
        trend === "down" && "text-negative"
      )}>
        {value}
      </p>
      {change && (
        <p className={cn(
          "text-xs font-mono tabular-nums",
          change.direction === "up" && "text-positive",
          change.direction === "down" && "text-negative",
          change.direction === "neutral" && "text-muted-fg"
        )}>
          {change.direction === "up" && "? "}
          {change.direction === "down" && "? "}
          {change.value}
        </p>
      )}
    </div>
  );
}

export { MetricBlock };
export type { MetricBlockProps };
