'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   CursorGlow
   A subtle radial gradient that follows the cursor within a container,
   creating a soft spotlight effect behind content at the cursor position.
   
   Uses motion/react for smooth position interpolation via useSpring.
   Follows DESIGN.md: brand-glow token, smooth 300ms spring, no bounce.
   The glow fades out when the cursor leaves the container.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Types ───────────────────────────────────────────────────────────────── */

export interface CursorGlowProps {
  /** Content rendered above the glow */
  children: ReactNode;
  /** Additional classes on the wrapper */
  className?: string;
  /** Glow color. Default: 'var(--brand-glow)' */
  glowColor?: string;
  /** Diameter of the glow in px. Default: 400 */
  glowSize?: number;
}

/* ── Component ───────────────────────────────────────────────────────────── */

/**
 * Container that projects a radial gradient glow at the cursor position.
 * The glow is a single large radial gradient circle that follows the mouse,
 * creating a subtle spotlight effect behind content.
 *
 * Uses CSS radial-gradient for the glow to avoid additional DOM elements.
 * Position is driven by motion/react useSpring for smooth interpolation
 * (config: stiffness 150, damping 28 — no bounce, smooth decay).
 */
export function CursorGlow({
  children,
  className,
  glowColor = 'var(--brand-glow)',
  glowSize = 400,
}: CursorGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [opacity, setOpacity] = useState(0);

  // Motion values for smooth cursor tracking
  const cursorX = useMotionValue(-glowSize);
  const cursorY = useMotionValue(-glowSize);

  // Spring for smooth interpolation — no bounce (damping matches stiffness)
  const springX = useSpring(cursorX, { stiffness: 150, damping: 28 });
  const springY = useSpring(cursorY, { stiffness: 150, damping: 28 });
  const springOpacity = useSpring(opacity, { stiffness: 200, damping: 30 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cursorX.set(x);
      cursorY.set(y);

      if (!isHovering) {
        setIsHovering(true);
        setOpacity(1);
      }
    },
    [cursorX, cursorY, isHovering],
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setOpacity(0);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    setOpacity(1);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow layer — a single radial gradient that follows the cursor */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: springOpacity,
          background: `radial-gradient(circle ${glowSize / 2}px at ${springX}px ${springY}px, ${glowColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Content rendered above the glow */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
