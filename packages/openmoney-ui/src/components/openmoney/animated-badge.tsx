'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   AnimatedBadge — badge with a subtle pulse/glow animation on mount.
   Extends the shadcn/ui Badge styling with motion/react entrance.

   Follows DESIGN.md: 200ms ease-out, opacity from 0.8 → 1, subtle pulse.
   ═══════════════════════════════════════════════════════════════════════════ */

const animatedBadgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive text-white',
        outline:
          'text-foreground border-border',
        positive:
          'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        negative:
          'border-transparent bg-red-500/15 text-red-600 dark:text-red-400',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

type AnimatedBadgeVariant = NonNullable<VariantProps<typeof animatedBadgeVariants>['variant']>;

export interface AnimatedBadgeProps {
  children: ReactNode;
  /** Visual style variant. Default: 'default' */
  variant?: AnimatedBadgeVariant;
  /** Additional CSS classes */
  className?: string;
  /** If false, disables animation (static render). Default: true */
  animate?: boolean;
}

const pulseVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

/**
 * A badge with a gentle scale-in entrance and optional opacity pulse.
 * Mirrors the shadcn/ui Badge styling with additional 'positive' and
 * 'negative' variants for semantic financial coloring.
 *
 * @example
 * <AnimatedBadge variant="positive">+2.4%</AnimatedBadge>
 *
 * @example
 * <AnimatedBadge variant="negative" animate={false}>-1.2%</AnimatedBadge>
 */
export function AnimatedBadge({
  children,
  variant = 'default',
  className,
  animate: shouldAnimate = true,
}: AnimatedBadgeProps) {
  if (!shouldAnimate) {
    return (
      <span className={cn(animatedBadgeVariants({ variant }), className)}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={pulseVariants}
      className={cn(animatedBadgeVariants({ variant }), className)}
    >
      {children}
    </motion.span>
  );
}

export { animatedBadgeVariants };
