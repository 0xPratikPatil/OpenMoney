'use client';

import { motion } from 'motion/react';
import { useTypewriter } from '@/hooks/use-typewriter';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   Typewriter — types text character by character with a blinking cursor.
   Uses useTypewriter hook for character-by-character reveal.

   Follows DESIGN.md: 50ms/char default, subtle caret blink animation.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface TypewriterProps {
  /** Full text string to type, character by character */
  text: string;
  /** Speed in ms per character. Default: 50 */
  speed?: number;
  /** Initial delay before typing starts in ms. Default: 0 */
  startDelay?: number;
  /** If true, loops the typing animation continuously */
  loop?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Show a blinking pipe cursor at the end. Default: true */
  showCursor?: boolean;
}

/**
 * Types text character by character with a blinking pipe cursor at the end.
 * Supports configurable speed, initial delay, and optional looping.
 *
 * @example
 * <Typewriter text="Analyzing market data..." speed={40} />
 *
 * @example
 * <Typewriter
 *   text="Loading portfolio..."
 *   loop
 *   speed={60}
 *   startDelay={500}
 * />
 */
export function Typewriter({
  text,
  speed = 50,
  startDelay = 0,
  loop = false,
  className,
  showCursor = true,
}: TypewriterProps) {
  const displayText = useTypewriter({
    text,
    speed,
    startDelay,
    loop,
    start: true,
  });

  return (
    <motion.span
      className={cn('inline-flex items-baseline', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <span>{displayText}</span>
      {showCursor && (
        <span
          className="ml-0.5 inline-block w-px animate-pulse select-none"
          aria-hidden="true"
        >
          |
        </span>
      )}
    </motion.span>
  );
}
