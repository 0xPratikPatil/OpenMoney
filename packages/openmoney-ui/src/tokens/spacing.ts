/**
 * OpenMoney Design Tokens — Spacing
 *
 * Base unit: 4px. All values are multiples with fractional allowances
 * for micro-adjustments (xxs=2px, md=12px).
 *
 * @see DESIGN.md — Layout section
 */

export const spacing = {
  xxs: 'var(--spacing-xxs)',              // 2px
  xs: 'var(--spacing-xs)',                 // 4px
  sm: 'var(--spacing-sm)',                 // 8px
  md: 'var(--spacing-md)',                 // 12px
  lg: 'var(--spacing-lg)',                 // 16px
  xl: 'var(--spacing-xl)',                 // 24px
  xxl: 'var(--spacing-xxl)',               // 32px
  '3xl': 'var(--spacing-3xl)',             // 48px
  '4xl': 'var(--spacing-4xl)',             // 64px
  section: 'var(--spacing-section)',       // 96px
  dataRow: 'var(--spacing-data-row)',      // 44px
  metricGap: 'var(--spacing-metric-gap)',  // 20px
  cardPadding: 'var(--spacing-card-padding)', // 20px
  dashboardGap: 'var(--spacing-dashboard-gap)', // 20px
  inputHeight: 'var(--spacing-input-height)',   // 36px
  buttonHeightSm: 'var(--spacing-button-height-sm)', // 32px
  buttonHeightMd: 'var(--spacing-button-height-md)', // 36px
  buttonHeightLg: 'var(--spacing-button-height-lg)', // 44px
  iconSm: 'var(--spacing-icon-sm)',        // 16px
  iconMd: 'var(--spacing-icon-md)',        // 20px
  iconLg: 'var(--spacing-icon-lg)',        // 24px
} as const;

export type SpacingToken = keyof typeof spacing;
