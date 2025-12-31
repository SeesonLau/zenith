// src/hooks/useThemeColors.ts
import { useTheme } from '@/src/contexts/ThemeContext';

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string;
  bgSurface: string;
  bgSurfaceHover: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Borders
  borderSurface: string;
  
  // Module Colors (same in both themes)
  moduleHabits: string;
  moduleFinance: string;
  moduleDiary: string;
  moduleLeisure: string;
  
  // Status Colors
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export function useThemeColors(): ThemeColors {
  const { theme } = useTheme();
  
  const isDark = theme === 'slate';
  
  return {
    // Backgrounds
    bgPrimary: isDark ? '#0f172a' : '#ffffff',      // slate-900 : white
    bgSurface: isDark ? '#1e293b' : '#f8fafc',      // slate-800 : slate-50
    bgSurfaceHover: isDark ? '#334155' : '#f1f5f9', // slate-700 : slate-100
    
    // Text
    textPrimary: isDark ? '#ffffff' : '#0f172a',    // white : slate-900
    textSecondary: isDark ? '#cbd5e1' : '#475569',  // slate-300 : slate-600
    textTertiary: isDark ? '#94a3b8' : '#64748b',   // slate-400 : slate-500
    
    // Borders
    borderSurface: isDark ? '#334155' : '#e2e8f0',  // slate-700 : slate-200
    
    // Module Colors (same in both themes)
    moduleHabits: '#9333ea',   // purple-600
    moduleFinance: '#16a34a',  // green-600
    moduleDiary: '#0284c7',    // sky-600
    moduleLeisure: '#db2777',  // pink-600
    
    // Status Colors
    success: '#22c55e',  // green-500
    warning: '#f59e0b',  // amber-500
    danger: '#ef4444',   // red-500
    info: '#0ea5e9',     // sky-500
  };
}