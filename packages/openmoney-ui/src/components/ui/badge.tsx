import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border px-2 py-0.5 font-mono uppercase text-[9px] tracking-widest font-medium whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--background-elevated)] text-[var(--text-secondary)] border-[var(--border)]",
        brand:
          "bg-[var(--brand-dim)] text-[var(--brand)] border-[var(--brand-border)]",
        success:
          "bg-[var(--positive-bg)] text-[var(--positive)] border-[var(--positive)]/20",
        destructive:
          "bg-[var(--negative-bg)] text-[var(--negative)] border-[var(--negative)]/20",
        warning:
          "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]/20",
        outline:
          "border-[var(--border)] text-[var(--text-secondary)]",
        ghost:
          "text-[var(--text-tertiary)] border-transparent hover:bg-[var(--background-elevated)]",
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
