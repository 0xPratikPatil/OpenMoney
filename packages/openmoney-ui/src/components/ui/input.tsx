import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input type={type} data-slot="input"
      className={cn(
        "flex h-8 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background-input)] px-2.5 font-mono text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-[var(--brand)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
