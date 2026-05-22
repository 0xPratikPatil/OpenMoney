import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="skeleton"
      className={cn("rounded-[var(--radius-sm)] bg-[var(--background-elevated)]", className)}
      style={{
        backgroundImage: "linear-gradient(90deg, var(--border) 0%, var(--background-elevated) 50%, var(--border) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
      {...props}
    />
  )
}

export { Skeleton }
