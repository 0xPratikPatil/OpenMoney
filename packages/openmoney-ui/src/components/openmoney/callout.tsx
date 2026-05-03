import * as React from "react";
import { cn } from "../../lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CalloutVariant = "info" | "warn" | "error" | "success";

interface CalloutProps {
  variant: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Variant config
// ---------------------------------------------------------------------------

const variantConfig: Record<
  CalloutVariant,
  {
    border: string;
    icon: React.ReactNode;
    titleColor: string;
  }
> = {
  info: {
    border: "border-l-info",
    titleColor: "text-info",
    icon: (
      <svg
        className="size-4 shrink-0 text-info"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
  warn: {
    border: "border-l-warning",
    titleColor: "text-warning",
    icon: (
      <svg
        className="size-4 shrink-0 text-warning"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
  error: {
    border: "border-l-negative",
    titleColor: "text-negative",
    icon: (
      <svg
        className="size-4 shrink-0 text-negative"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    ),
  },
  success: {
    border: "border-l-positive",
    titleColor: "text-positive",
    icon: (
      <svg
        className="size-4 shrink-0 text-positive"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    ),
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function Callout({
  variant,
  title,
  children,
  onClose,
  className,
}: CalloutProps) {
  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      className={cn(
        "relative flex gap-3 rounded-lg border border-border border-l-4 border-l-solid bg-transparent p-4",
        config.border,
        className,
      )}
    >
      {/* Icon */}
      <div className="mt-0.5">{config.icon}</div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {title && (
          <h5
            className={cn(
              "text-sm font-semibold leading-snug",
              config.titleColor,
            )}
          >
            {title}
          </h5>
        )}
        <div
          className={cn(
            "text-sm text-muted-fg leading-relaxed",
            title && "mt-1",
          )}
        >
          {children}
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="size-6 shrink-0 flex items-center justify-center rounded text-muted-fg hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export { Callout };
export type { CalloutProps, CalloutVariant };
