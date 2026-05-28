'use client';

import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   ScaleIn — scales children from a smaller size to full on mount.
   Used for modals, cards, and popover content entrances.
   Follows DESIGN.md: 0.95 → 1 scale, 200ms ease-out.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ScaleInProps {
  children: ReactNode;
  /** Initial scale. Default: 0.95 */
  from?: number;
  /** Duration in seconds. Default: 0.2 */
  duration?: number;
  /** Delay in seconds. Default: 0 */
  delay?: number;
  /** CSS class */
  className?: string;
}

export function ScaleIn({
  children,
  from = 0.95,
  duration = 0.2,
  delay = 0,
  className,
}: ScaleInProps) {
  const variants: Variants = {
    hidden: { opacity: 0, scale: from },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
