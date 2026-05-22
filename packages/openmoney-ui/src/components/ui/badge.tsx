import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-lg border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--text-primary)] text-[var(--background)] border-transparent",
        secondary:
          "bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--border)]",
        outline:
          "border-[var(--border)] text-[var(--text-secondary)]",
        success:
          "bg-[var(--success-muted)] text-[var(--success)] border-[var(--success)]/10",
        destructive:
          "bg-[var(--destructive-muted)] text-[var(--destructive)] border-[var(--destructive)]/10",
        warning:
          "bg-[var(--warning-muted)] text-[var(--warning)] border-[var(--warning)]/10",
        brand:
          "bg-[var(--brand-muted)] text-[var(--brand)] border-[var(--brand-border)]",
        ghost:
          "text-[var(--text-tertiary)] border-transparent hover:bg-[var(--surface-elevated)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({
  className, variant = "default", asChild = false, ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp data-slot="badge" data-variant={variant}
      className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
