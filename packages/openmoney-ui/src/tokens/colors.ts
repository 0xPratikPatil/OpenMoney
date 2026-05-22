export const colors = {
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  surface: 'var(--surface)',
  surfaceElevated: 'var(--surface-elevated)',
  surfaceOverlay: 'var(--surface-overlay)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textTertiary: 'var(--text-tertiary)',
  brand: {
    DEFAULT: 'var(--brand)',
    foreground: 'var(--brand-foreground)',
    muted: 'var(--brand-muted)',
    border: 'var(--brand-border)',
    glow: 'var(--brand-glow)',
  },
  success: {
    DEFAULT: 'var(--success)',
    muted: 'var(--success-muted)',
  },
  destructive: {
    DEFAULT: 'var(--destructive)',
    muted: 'var(--destructive-muted)',
  },
  warning: {
    DEFAULT: 'var(--warning)',
    muted: 'var(--warning-muted)',
  },
  info: {
    DEFAULT: 'var(--info)',
    muted: 'var(--info-muted)',
  },
  border: 'var(--border)',
  borderHover: 'var(--border-hover)',
  borderFocus: 'var(--border-focus)',
  ring: 'var(--ring)',
} as const;

export type ColorKey = keyof typeof colors;
