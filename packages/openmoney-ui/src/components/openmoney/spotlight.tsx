'use client';

import { useRef, useState, useCallback, type ReactNode, type MouseEvent, type CSSProperties } from 'react';
import { cn } from '../../lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   Spotlight — hover card with a radial-gradient spotlight that follows the
   cursor position.

   Renders a card with children and overlays a radial gradient centered at
   the cursor position on mouse move. The gradient fades out on mouse leave.

   Uses CSS custom properties for the gradient position, avoiding re-render
   overhead for the gradient itself. The spotlight is applied as a
   pseudo-background behind the children via a dedicated overlay layer.

   Per DESIGN.md: gradients on chrome surfaces are discouraged, but this
   is an interactive cursor-following effect, not a static decorative
   gradient. Use sparingly.

   ═══════════════════════════════════════════════════════════════════════════ */

export interface SpotlightProps {
  /** Content rendered inside the card */
  children: ReactNode;
  /** Additional wrapper classes */
  className?: string;
  /** CSS color value for the spotlight. Default: 'var(--brand-glow)' */
  spotlightColor?: string;
  /** Radius of the spotlight in pixels. Default: 350 */
  spotlightRadius?: number;
  /** Opacity of the spotlight. Default: 0.15 */
  spotlightOpacity?: number;
}

/**
 * A card that creates a cursor-following spotlight effect.
 *
 * The radial gradient is positioned at the mouse cursor coordinates on
 * every `mousemove` event. On mouse leave, the gradient fades out with
 * a 300ms ease-out transition.
 *
 * @example
 * ```tsx
 * <Spotlight spotlightColor="var(--positive)" spotlightRadius={400}>
 *   <div className="p-8">
 *     <h3 className="text-h2">Premium Feature</h3>
 *     <p className="text-text-secondary mt-2">Hover over me.</p>
 *   </div>
 * </Spotlight>
 * ```
 */
export function Spotlight({
  children,
  className,
  spotlightColor = 'var(--brand-glow)',
  spotlightRadius = 350,
  spotlightOpacity = 0.15,
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setPosition(null);
  }, []);

  const spotlightStyle: CSSProperties = position
    ? {
        background: `radial-gradient(${spotlightRadius}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent ${spotlightOpacity * 100}%)`,
        opacity: 1,
      }
    : {
        background: `radial-gradient(${spotlightRadius}px circle at 50% 50%, ${spotlightColor}, transparent 0%)`,
        opacity: 0,
      };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-lg border bg-surface-1',
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Spotlight overlay layer ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 ease-out"
        style={spotlightStyle}
        aria-hidden="true"
      />

      {/* ── Content layer (above spotlight) ── */}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

Spotlight.displayName = 'Spotlight';
