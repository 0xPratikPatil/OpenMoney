'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import { useEffect, useRef, useState, useCallback, type ReactNode, type CSSProperties } from 'react';
import { cn } from '../../lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   Marquee — horizontal scrolling text / logo banner.

   Renders children in a continuous horizontal scroll with configurable
   speed, direction, and hover pause. Gradient fade edges conceal
   overflowing content at both ends for a polished infinite-ticker effect.

   The scroll animation uses a CSS keyframe animation (`marquee-scroll`)
   so that pausing on hover is handled via `animation-play-state`, which
   is performant and avoids the complexity of resuming motion/react
   imperative controls at an arbitrary mid-cycle position.

   Follows DESIGN.md animation rules: linear easing for constant speed,
   no bounce, no spring.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface MarqueeProps extends HTMLMotionProps<'div'> {
  /** Content to scroll. For logos, wrap each in a flex container. */
  children: ReactNode;
  /** Pixels per second scroll speed. Default: 50 */
  speed?: number;
  /** Scroll direction: 'left' (default) or 'right' */
  direction?: 'left' | 'right';
  /** Pause scrolling when the user hovers over the marquee. Default: true */
  pauseOnHover?: boolean;
  /** Width of the fade gradient on each edge in px. Default: 64 */
  fadeWidth?: number;
  /** Gap between items in px. Default: 32 */
  gap?: number;
  /** Additional classes applied to the outer wrapper */
  className?: string;
}

/* ── Injects the keyframe animation once globally ─────────────────────── */

let styleInjected = false;

function injectMarqueeKeyframes() {
  if (styleInjected || typeof document === 'undefined') return;
  styleInjected = true;

  const styleEl = document.createElement('style');
  styleEl.id = 'om-marquee-keyframes';
  styleEl.textContent = `
    @keyframes marquee-scroll-left {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes marquee-scroll-right {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }
  `;
  document.head.appendChild(styleEl);
}

/**
 * A horizontal auto-scrolling marquee with gradient fade edges.
 *
 * @example
 * ```tsx
 * <Marquee speed={60} pauseOnHover>
 *   {logos.map((logo) => (
 *     <div key={logo.id} className="shrink-0">{logo.icon}</div>
 *   ))}
 * </Marquee>
 * ```
 */
export function Marquee({
  children,
  speed = 50,
  direction = 'left',
  pauseOnHover = true,
  fadeWidth = 64,
  gap = 32,
  className,
  ...props
}: MarqueeProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(20); // fallback, re-measured on mount

  // Inject keyframes once
  useEffect(() => {
    injectMarqueeKeyframes();
  }, []);

  // Measure content width to calculate animation duration
  useEffect(() => {
    const measure = () => {
      if (!innerRef.current) return;
      // The inner div contains two copies of children — measure one copy
      const firstChild = innerRef.current.firstElementChild;
      if (firstChild) {
        const width = firstChild.scrollWidth;
        if (width > 0) {
          setDuration(width / speed);
        }
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    if (innerRef.current?.firstElementChild) {
      observer.observe(innerRef.current.firstElementChild);
    }

    return () => observer.disconnect();
  }, [children, speed]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsPaused(true);
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsPaused(false);
  }, [pauseOnHover]);

  const fadeColor = 'oklch(0.145 0 0)'; // surface-0

  const animationName =
    direction === 'left' ? 'marquee-scroll-left' : 'marquee-scroll-right';

  const scrollStyle: CSSProperties = {
    animationName,
    animationDuration: `${duration}s`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationPlayState: isPaused ? 'paused' : 'running',
    display: 'flex',
    width: 'max-content',
    gap: `${gap}px`,
  };

  return (
    <motion.div
      className={cn('relative w-full overflow-hidden', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="marquee"
      aria-live="off"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {/* ── Left gradient fade ── */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10"
        style={{
          width: `${fadeWidth}px`,
          background: `linear-gradient(to right, ${fadeColor}, transparent)`,
        }}
        aria-hidden="true"
      />

      {/* ── Right gradient fade ── */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10"
        style={{
          width: `${fadeWidth}px`,
          background: `linear-gradient(to left, ${fadeColor}, transparent)`,
        }}
        aria-hidden="true"
      />

      {/* ── Scrolling inner track ── */}
      <div ref={innerRef} className="flex w-max" style={scrollStyle}>
        {/* First copy */}
        <div className="flex shrink-0" style={{ gap: `${gap}px` }}>
          {children}
        </div>
        {/* Duplicate for seamless looping */}
        <div className="flex shrink-0" style={{ gap: `${gap}px` }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

Marquee.displayName = 'Marquee';
