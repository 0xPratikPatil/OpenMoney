import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--text-primary)] text-[var(--background)] hover:opacity-90 active:scale-[0.98]",
        brand:
          "bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90 active:scale-[0.98] shadow-[var(--shadow-glow)]",
        destructive:
          "bg-[var(--destructive)] text-white hover:opacity-90 active:scale-[0.98]",
        outline:
          "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-elevated)] active:scale-[0.98]",
        secondary:
          "bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] active:scale-[0.98]",
        ghost:
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] active:scale-[0.98]",
        link: "text-[var(--brand)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-3.5",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3.5 text-xs has-[>svg]:px-2.5",
        lg: "h-11 rounded-xl px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-xl px-8 text-base",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({
  className, variant = "default", size = "default", asChild = false, ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp data-slot="button" data-variant={variant} data-size={size}
      className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
}

export { Button, buttonVariants }
