// src/hooks/useThemeColors.ts
import { useTheme } from '@/src/contexts/ThemeContext';
import { DarkTokens, LightTokens, StaticColors } from '@/src/constants/theme';

export type ThemeColors = typeof DarkTokens & typeof StaticColors;

export function useThemeColors(): ThemeColors {
  const { theme } = useTheme();
  const isDark = theme === 'slate';
  return { ...(isDark ? DarkTokens : LightTokens), ...StaticColors };
}