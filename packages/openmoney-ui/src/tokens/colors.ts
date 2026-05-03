export const colors = {
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  primary: {
    DEFAULT: 'var(--primary)',
    fg: 'var(--primary-fg)',
  },
  secondary: {
    DEFAULT: 'var(--secondary)',
    fg: 'var(--secondary-fg)',
  },
  muted: {
    DEFAULT: 'var(--muted)',
    fg: 'var(--muted-fg)',
  },
  accent: {
    DEFAULT: 'var(--accent)',
    fg: 'var(--accent-fg)',
  },
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',
  destructive: 'var(--destructive)',
  positive: 'var(--positive)',
  negative: 'var(--negative)',
  warning: 'var(--warning)',
  info: 'var(--info)',
  accentBrand: {
    DEFAULT: 'var(--accent-brand)',
    hover: 'var(--accent-brand-hover)',
  },
} as const;

export type ColorKey = keyof typeof colors;
