/**
 * OpenMoney Design Tokens — Border Radius
 *
 * Base: 0.2rem (deliberately tight).
 * Code is always sharp (none). Interactive surfaces use 0.2rem.
 *
 * @see DESIGN.md — Shapes section
 */

export const radius = {
  none: 'var(--radius-none)',    // 0px
  sharp: 'var(--radius-sharp)',  // 0px (alias — for code blocks)
  xs: 'var(--radius-xs)',        // calc(0.2rem - 2px)
  sm: 'var(--radius-sm)',        // calc(0.2rem - 1px)
  md: 'var(--radius-md)',        // 0.2rem (default)
  lg: 'var(--radius-lg)',        // calc(0.2rem + 2px)
  xl: 'var(--radius-xl)',        // calc(0.2rem + 4px)
  full: 'var(--radius-full)',    // 9999px
} as const;

export type RadiusToken = keyof typeof radius;
