// src/lib/constants.ts
import type { 
  HabitCategory, 
  FinanceTypeCategory, 
  LeisureType, 
  MoodType 
} from '@/src/types/database.types';

// ==========================================
// THEME COLORS
// ==========================================
export const COLORS = {
  // Primary slate theme
  background: {
    primary: '#0f172a',    // slate-900
    secondary: '#1e293b',  // slate-800
    tertiary: '#334155',   // slate-700
  },
  text: {
    primary: '#ffffff',
    secondary: '#cbd5e1',  // slate-300
    tertiary: '#94a3b8',   // slate-400
    muted: '#64748b',      // slate-500
  },
  border: {
    default: '#334155',    // slate-700
    light: '#475569',      // slate-600
  },
  // Feature colors
  accent: {
    sky: '#0ea5e9',        // sky-500
    purple: '#a855f7',     // purple-500
    green: '#22c55e',      // green-500
    red: '#ef4444',        // red-500
    pink: '#ec4899',       // pink-500
    blue: '#3b82f6',       // blue-500
    orange: '#f97316',     // orange-500
    yellow: '#eab308',     // yellow-500
    gray: '#6b7280',       // gray-500
  },
} as const;

// ==========================================
// HABIT TRACKER CONSTANTS
// ==========================================
export const HABIT_CONFIG = {
  categories: {
    Productivity: {
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-900/20',
      icon: 'briefcase' as const,
      activities: ['Working', 'Studying', 'Personal Project'],
    },
    'Self-Care': {
      color: 'bg-green-500',
      textColor: 'text-green-400',
      borderColor: 'border-green-500',
      bgColor: 'bg-green-900/20',
      icon: 'heart' as const,
      activities: ['Sleeping', 'Exercise', 'Eating', 'Cooking', 'Bathing', 'Peace'],
    },
    Logistics: {
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-900/20',
      icon: 'car' as const,
      activities: ['Errands', 'Chores', 'Travel'],
    },
    Enjoyment: {
      color: 'bg-pink-500',
      textColor: 'text-pink-400',
      borderColor: 'border-pink-500',
      bgColor: 'bg-pink-900/20',
      icon: 'happy' as const,
      activities: ['Socializing', 'Romance', 'Gaming', 'Watching Videos', 'Reading', 'Leisure'],
    },
    Nothing: {
      color: 'bg-gray-500',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-500',
      bgColor: 'bg-gray-900/20',
      icon: 'time' as const,
      activities: ['Doomscrolling', 'Procrastinating'],
    },
  } as const satisfies Record<HabitCategory, {
    color: string;
    textColor: string;
    borderColor: string;
    bgColor: string;
    icon: string;
    activities: readonly string[];
  }>,
} as const;

// ==========================================
// FINANCE TRACKER CONSTANTS
// ==========================================
export const FINANCE_CONFIG = {
  categories: {
    Load: { icon: 'phone-portrait' as const, color: 'bg-blue-500' },
    Fare: { icon: 'bus' as const, color: 'bg-yellow-500' },
    School: { icon: 'school' as const, color: 'bg-purple-500' },
    'Personal-Physical': { icon: 'shirt' as const, color: 'bg-pink-500' },
    'Personal-Digital': { icon: 'phone-portrait' as const, color: 'bg-sky-500' },
    Favor: { icon: 'gift' as const, color: 'bg-green-500' },
    Corrupt: { icon: 'alert-circle' as const, color: 'bg-red-500' },
    Food: { icon: 'restaurant' as const, color: 'bg-orange-500' },
    Give: { icon: 'heart' as const, color: 'bg-pink-400' },
    Refund: { icon: 'return-up-back' as const, color: 'bg-green-400' },
    Withdraw: { icon: 'cash' as const, color: 'bg-blue-400' },
  } as const satisfies Record<FinanceTypeCategory, { icon: string; color: string }>,
  
  transactionTypes: {
    income: {
      color: 'bg-green-500',
      textColor: 'text-green-400',
      icon: 'arrow-down' as const,
      label: 'Income',
    },
    expense: {
      color: 'bg-red-500',
      textColor: 'text-red-400',
      icon: 'arrow-up' as const,
      label: 'Expense',
    },
  } as const,
} as const;

// ==========================================
// LEISURE TRACKER CONSTANTS
// ==========================================
export const LEISURE_CONFIG = {
  types: {
      Manga: {
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-900/20',
      icon: 'book-open' as const,
      emoji: '📘',
    },
    
    Mangah: {
      color: 'bg-green-500',
      textColor: 'text-green-400',
      borderColor: 'border-green-500',
      bgColor: 'bg-green-900/20',
      icon: 'book-open' as const,
      emoji: '📗',
    },

    Manhwah: {
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-900/20',
      icon: 'book-open' as const,
      emoji: '📙',
    },

    Manhuah: {
      color: 'bg-red-500',
      textColor: 'text-red-400',
      borderColor: 'border-red-500',
      bgColor: 'bg-red-900/20',
      icon: 'book-open' as const,
      emoji: '📕',
    },

    Fanart: {
      color: 'bg-pink-500',
      textColor: 'text-pink-400',
      borderColor: 'border-pink-500',
      bgColor: 'bg-pink-900/20',
      icon: 'palette' as const,
      emoji: '🎨',
    },

    Acquainted: {
      color: 'bg-orange-500',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500',
      bgColor: 'bg-orange-900/20',
      icon: 'people' as const,
      emoji: '🙂',
    },

    Stranger: {
      color: 'bg-orange-500',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500',
      bgColor: 'bg-orange-900/20',
      icon: 'person-outline' as const,
      emoji: '👤',
    },

    Sensual: {
      color: 'bg-red-600',
      textColor: 'text-red-400',
      borderColor: 'border-red-600',
      bgColor: 'bg-red-900/30',
      icon: 'heart' as const,
      emoji: '💖',
    },

  } as const satisfies Record<LeisureType, {
    color: string;
    textColor: string;
    borderColor: string;
    bgColor: string;
    icon: string;
    emoji: string;
  }>,
} as const;

// ==========================================
// DIARY CONSTANTS
// ==========================================
export const DIARY_CONFIG = {
  moods: {
    Happy: {
      icon: 'happy' as const,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-400',
      emoji: '😊',
    },
    Sad: {
      icon: 'sad' as const,
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      emoji: '😢',
    },
    Neutral: {
      icon: 'remove-circle' as const,
      color: 'bg-gray-500',
      textColor: 'text-gray-400',
      emoji: '😐',
    },
    Excited: {
      icon: 'sparkles' as const,
      color: 'bg-orange-500',
      textColor: 'text-orange-400',
      emoji: '🤩',
    },
    Anxious: {
      icon: 'alert-circle' as const,
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      emoji: '😰',
    },
    Angry: {
      icon: 'flame' as const,
      color: 'bg-red-500',
      textColor: 'text-red-400',
      emoji: '😠',
    },
    Grateful: {
      icon: 'heart' as const,
      color: 'bg-pink-500',
      textColor: 'text-pink-400',
      emoji: '🙏',
    },
    Reflective: {
      icon: 'bulb' as const,
      color: 'bg-sky-500',
      textColor: 'text-sky-400',
      emoji: '🤔',
    },
  } as const satisfies Record<MoodType, {
    icon: string;
    color: string;
    textColor: string;
    emoji: string;
  }>,
} as const;

// ==========================================
// HELPER FUNCTIONS
// ==========================================
export function getHabitConfig(category: HabitCategory) {
  return HABIT_CONFIG.categories[category];
}

export function getLeisureConfig(type: LeisureType) {
  return LEISURE_CONFIG.types[type];
}

export function getMoodConfig(mood: MoodType) {
  return DIARY_CONFIG.moods[mood];
}

export function getFinanceCategoryConfig(category: FinanceTypeCategory) {
  return FINANCE_CONFIG.categories[category];
}

export function getTransactionTypeConfig(type: 'income' | 'expense') {
  return FINANCE_CONFIG.transactionTypes[type];
}