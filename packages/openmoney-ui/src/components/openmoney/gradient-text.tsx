'use client';

import { type ReactNode, type CSSProperties, useEffect, useId } from 'react';
import { cn } from '../../lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   GradientText — renders text with an animated gradient fill using CSS
   background-clip.

   Uses `bg-clip-text text-transparent` to clip the background gradient
   to the text shape. When `animate` is true, the background-position shifts
   horizontally in a looping animation, creating a flowing gradient effect.

   ⚠️  DESIGN.md lists gradient text as an anti-pattern for product UI.
   Reserve this component for marketing/hero surfaces only — never inside
   the dashboard or data-intensive views. The DISPLAY typography scale
   is likewise restricted to marketing pages.

   Follows DESIGN.md animation rules: ease-in-out, no bounce, non-blocking.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface GradientTextProps {
  /** The text to render with gradient fill */
  children: ReactNode;
  /** Additional classes — apply typography tokens here (text-display, text-h1, etc.) */
  className?: string;
  /** Gradient start color. Default: 'var(--brand)' */
  gradientFrom?: string;
  /** Gradient middle color. Omitting creates a two-color gradient. */
  gradientVia?: string;
  /** Gradient end color. Default: 'var(--positive)' */
  gradientTo?: string;
  /** Gradient angle in degrees. Default: 90 (left-to-right) */
  angle?: number;
  /** If true, animates the background-position for a flowing shimmer.
   *  Duration is 3s to keep it subtle. Default: false */
  animate?: boolean;
  /** HTML element to render. Default: 'span' */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p' | 'div';
}

// Module-level guard — only inject keyframes once globally
let keyframesInjected = false;

/**
 * Text with an animated CSS gradient fill.
 *
 * @example
 * ```tsx
 * // Static gradient headline (marketing use)
 * <GradientText as="h1" className="text-display" gradientFrom="#fff" gradientTo="var(--brand)">
 *   Build Wealth, Automatically
 * </GradientText>
 *
 * // Animated gradient
 * <GradientText as="h2" className="text-h1" animate>
 *   Premium Analytics
 * </GradientText>
 * ```
 */
export function GradientText({
  children,
  className,
  gradientFrom = 'var(--brand)',
  gradientVia,
  gradientTo = 'var(--positive)',
  angle = 90,
  animate = false,
  as: Tag = 'span',
}: GradientTextProps) {
  const uid = useId();

  useEffect(() => {
    if (!animate || keyframesInjected) return;
    keyframesInjected = true;

    const styleEl = document.createElement('style');
    styleEl.id = 'om-gradient-text-keyframes';
    styleEl.textContent = `
      @keyframes om-gradient-flow {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      // Only remove if this was the last instance (keep it simple: never remove)
    };
  }, [animate]);

  const stops = gradientVia
    ? `${gradientFrom}, ${gradientVia}, ${gradientTo}`
    : `${gradientFrom}, ${gradientTo}`;

  const style: CSSProperties = {
    backgroundImage: `linear-gradient(${angle}deg, ${stops})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    ...(animate && {
      backgroundSize: '200% 100%',
      animation: 'om-gradient-flow 3s ease-in-out infinite alternate',
    }),
  };

  return (
    <Tag className={cn('inline-block', className)} style={style} data-gradient-text={uid}>
      {children}
    </Tag>
  );
}

GradientText.displayName = 'GradientText';
