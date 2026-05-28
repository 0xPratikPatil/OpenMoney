'use client';

import { useRef, useState, useCallback, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   MagneticButton — button that subtly tracks cursor movement within its
   bounds, creating a magnetic pull effect. Wraps the existing Button.

   Follows DESIGN.md: restrained motion under 8px shift, 300ms snap-back.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface MagneticButtonProps {
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Magnetic pull strength (0–1). Higher = more drift. Default: 0.3 */
  strength?: number;
  /** Merges onto a child element via Radix Slot instead of wrapping */
  asChild?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * A button that responds to cursor proximity — the element drifts slightly
 * toward the mouse pointer within its bounds, then springs back on leave.
 *
 * @example
 * <MagneticButton onClick={handleClick}>Hover me</MagneticButton>
 *
 * @example
 * <MagneticButton strength={0.5} className="mt-4">
 *   Stronger magnetic pull
 * </MagneticButton>
 */
export function MagneticButton({
  children,
  className,
  strength = 0.3,
  asChild = false,
  onClick,
}: MagneticButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate cursor offset from center, normalized to [-0.5, 0.5]
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = (e.clientX - centerX) / (rect.width / 2);
      const offsetY = (e.clientY - centerY) / (rect.height / 2);

      // Clamp to [-1, 1] and scale by strength (max 8px drift as per DESIGN.md)
      const clampedStrength = Math.min(Math.max(strength, 0), 1);
      setPosition({
        x: Math.min(Math.max(offsetX, -1), 1) * clampedStrength * 8,
        y: Math.min(Math.max(offsetY, -1), 1) * clampedStrength * 8,
      });
    },
    [strength],
  );

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        mass: 0.5,
      }}
      className={cn('inline-block', className)}
    >
      <Button asChild={asChild} onClick={onClick}>
        {children}
      </Button>
    </motion.div>
  );
}
