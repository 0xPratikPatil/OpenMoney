/**
 * OpenMoney Design Tokens — Color
 *
 * All color tokens map to CSS custom properties defined in globals.css.
 * Every var reference here MUST have a corresponding definition in globals.css.
 *
 * @see DESIGN.md — Colors section for full semantic documentation
 */

export const colors = {
  /* ── Surface / shadcn compat ── */
  background: 'var(--background)' as const,
  foreground: 'var(--foreground)' as const,
  card: 'var(--card)' as const,
  cardForeground: 'var(--card-foreground)' as const,
  popover: 'var(--popover)' as const,
  popoverForeground: 'var(--popover-foreground)' as const,
  primary: 'var(--primary)' as const,
  primaryForeground: 'var(--primary-foreground)' as const,
  secondary: 'var(--secondary)' as const,
  secondaryForeground: 'var(--secondary-foreground)' as const,
  muted: 'var(--muted)' as const,
  mutedForeground: 'var(--muted-foreground)' as const,
  accent: 'var(--accent)' as const,
  accentForeground: 'var(--accent-foreground)' as const,
  destructive: 'var(--destructive)' as const,
  destructiveForeground: 'var(--destructive-foreground)' as const,
  border: 'var(--border)' as const,
  input: 'var(--input)' as const,
  ring: 'var(--ring)' as const,

  /* ── Brand accent ── */
  brand: {
    DEFAULT: 'var(--brand)' as const,
    dim: 'var(--brand-dim)' as const,
    border: 'var(--brand-border)' as const,
    hover: 'var(--brand-hover)' as const,
    glow: 'var(--brand-glow)' as const,
  },

  /* ── Financial semantics ── */
  positive: 'var(--positive)' as const,
  positiveBg: 'var(--positive-bg)' as const,
  negative: 'var(--negative)' as const,
  negativeBg: 'var(--negative-bg)' as const,
  warning: 'var(--warning)' as const,
  warningBg: 'var(--warning-bg)' as const,
  info: 'var(--info)' as const,
  infoBg: 'var(--info-bg)' as const,
  success: 'var(--success)' as const,

  /* ── Surface ladder ── */
  surface0: 'var(--surface-0)' as const,
  surface1: 'var(--surface-1)' as const,
  surface2: 'var(--surface-2)' as const,
  surface3: 'var(--surface-3)' as const,

  /* ── Text hierarchy ── */
  textPrimary: 'var(--text-primary)' as const,
  textSecondary: 'var(--text-secondary)' as const,
  textTertiary: 'var(--text-tertiary)' as const,
  textInverse: 'var(--text-inverse)' as const,

  /* ── Border ── */
  borderStrong: 'var(--border-strong)' as const,
  borderSubtle: 'var(--border-subtle)' as const,

  /* ── Chart palette ── */
  chart1: 'var(--chart-1)' as const,
  chart2: 'var(--chart-2)' as const,
  chart3: 'var(--chart-3)' as const,
  chart4: 'var(--chart-4)' as const,
  chart5: 'var(--chart-5)' as const,
  chart6: 'var(--chart-6)' as const,
  chart7: 'var(--chart-7)' as const,
  chart8: 'var(--chart-8)' as const,
} as const;

export type ColorToken = keyof typeof colors;
export type BrandColorToken = keyof typeof colors.brand;
