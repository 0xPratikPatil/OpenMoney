import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-all duration-150 outline-none disabled:pointer-events-none disabled:opacity-40 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand)] text-[var(--text-inverse)] hover:bg-[var(--brand-hover)] border border-transparent active:scale-[0.97]",
        outline:
          "bg-transparent text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--background-elevated)] active:scale-[0.97]",
        ghost:
          "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-elevated)] border border-transparent active:scale-[0.97]",
        danger:
          "bg-[var(--negative-bg)] text-[var(--negative)] border border-[var(--negative)]/20 hover:border-[var(--negative)]/40 active:scale-[0.97]",
        terminal:
          "bg-[var(--background-elevated)] text-[var(--brand)] border border-[var(--brand-border)] hover:bg-[var(--brand-dim)] font-mono active:scale-[0.97]",
      },
      size: {
        default: "h-8 px-4 rounded-[var(--radius-sm)]",
        sm: "h-7 px-3 rounded-[var(--radius-sm)] text-[10px]",
        lg: "h-9 px-5 rounded-[var(--radius-md)]",
        icon: "size-8 rounded-[var(--radius-sm)]",
        "icon-sm": "size-7 rounded-[var(--radius-sm)]",
      },
    },
    defaultVariants: { variant: "outline", size: "default" },
  }
)

function Button({
  className, variant = "outline", size = "default", asChild = false, ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp data-slot="button" data-variant={variant} data-size={size}
      className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
}

export { Button, buttonVariants }
