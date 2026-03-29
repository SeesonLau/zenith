// src/constants/theme.ts
// Single source of truth for all color tokens.
// useThemeColors() consumes this — screens never reference raw hex values.
// When theme switching is implemented, add new theme objects here.

/** Tokens that change between dark and light themes */
export const DarkTokens = {
  bgPrimary:      '#0f172a',  // slate-900
  bgSurface:      '#1e293b',  // slate-800
  bgSurfaceHover: '#334155',  // slate-700
  textPrimary:    '#ffffff',
  textSecondary:  '#cbd5e1',  // slate-300
  textTertiary:   '#94a3b8',  // slate-400
  borderSurface:  '#334155',  // slate-700
} as const;

export const LightTokens = {
  bgPrimary:      '#ffffff',
  bgSurface:      '#f8fafc',  // slate-50
  bgSurfaceHover: '#f1f5f9',  // slate-100
  textPrimary:    '#0f172a',  // slate-900
  textSecondary:  '#475569',  // slate-600
  textTertiary:   '#64748b',  // slate-500
  borderSurface:  '#e2e8f0',  // slate-200
} as const;

/** Colors that do not change with the theme */
export const StaticColors = {
  // Module accent colors
  moduleHabits:   '#9333ea',  // purple-600
  moduleFinance:  '#16a34a',  // green-600
  moduleDiary:    '#0284c7',  // sky-600
  moduleLeisure:  '#db2777',  // pink-600

  // Semantic status colors
  success:  '#22c55e',  // green-500
  warning:  '#f59e0b',  // amber-500
  danger:   '#ef4444',  // red-500
  info:     '#0ea5e9',  // sky-500
} as const;

export type ThemeTokenKey = keyof typeof DarkTokens;
export type StaticColorKey = keyof typeof StaticColors;
