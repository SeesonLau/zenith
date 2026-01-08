// src/constants/categories.ts
// 🎯 SINGLE SOURCE OF TRUTH FOR ALL CATEGORIES
// Edit this file to add/remove/modify categories across the entire app

import { FINANCE_CATEGORY_COLORS } from "../lib/financeConstants";

// ==========================================
// HABIT TRACKER CATEGORIES
// ==========================================
export const HABIT_CATEGORIES = [
  'Productivity',
  'Self-Care',
  'Logistics',
  'Enjoyment',
  'Nothing',
] as const;

export type HabitCategory = typeof HABIT_CATEGORIES[number];

export const HABIT_ACTIVITIES = {
  Productivity: ['Personal Project', 'Studying', 'Working'],
  'Self-Care': ['Bathing', 'Cooking', 'Eating', 'Exercise', 'Peace', 'Sleeping'],
  Logistics: ['Chores', 'Errands', 'Travel'],
  Enjoyment: ['Anime', 'Gaming', 'Leisure', 'Modding', 'Music', 'Reading', 'Romance', 'Socializing', 'Watching Videos'],
  Nothing: ['Doomscrolling', 'Procrastinating'],
} as const;

export type HabitActivity = {
  [K in HabitCategory]: readonly string[];
};

// Helper to get all activities for a category
export function getActivitiesForCategory(category: HabitCategory): readonly string[] {
  return HABIT_ACTIVITIES[category] || [];
}

// Helper to get all possible activity strings
export function getAllHabitActivities(): string[] {
  return Object.values(HABIT_ACTIVITIES).flat();
}

// ==========================================
// FINANCE TRACKER CATEGORIES
// ==========================================
export const TRANSACTION_TYPES = ['income', 'expense'] as const;

export type TransactionType = typeof TRANSACTION_TYPES[number];

export const EXPENSE_CATEGORIES = [
  'Load/Data',
  'Transport',
  'School',
  'Health',
  'Digital',
  'Social',
  'Corrupt',
  'Food',
  'Give',
  'Shopping',
] as const;

export const INCOME_CATEGORIES = [
  'Allowance',
  'Salary',
  'Freelance',
  'Gift',
  'Repayment',
  'Investments',
] as const;

export const FINANCE_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as const;
export type FinanceTypeCategory = typeof FINANCE_CATEGORIES[number];

export const CURRENCIES = [
  'PHP',
  'USD',
  'EUR',
  'JPY',
  'SGD',
  'AUD',
] as const;

export type CurrencyCode = typeof CURRENCIES[number];

// Currency symbols helper
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    PHP: '₱',
    USD: '$',
    EUR: '€',
    JPY: '¥',
    SGD: 'S$',
    AUD: 'A$',
};

export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

// ==========================================
// DIARY CATEGORIES
// ==========================================
export const MOOD_OPTIONS = [
  'Happy',
  'Sad',
  'Neutral',
  'Excited',
  'Anxious',
  'Angry',
  'Grateful',
  'Reflective',
] as const;

export type MoodType = typeof MOOD_OPTIONS[number];

// Mood emoji helper
export const MOOD_EMOJIS: Record<MoodType, string> = {
  Happy: '😊',
  Sad: '😢',
  Neutral: '😐',
  Excited: '🤩',
  Anxious: '😰',
  Angry: '😠',
  Grateful: '🙏',
  Reflective: '🤔',
};

export function getMoodEmoji(mood: MoodType): string {
  return MOOD_EMOJIS[mood] || '😐';
}

// ==========================================
// LEISURE TRACKER CATEGORIES
// ==========================================
export const LEISURE_TYPES = [
  'Anime',
  'Animeh',
  'Manga',
  'Mangah',
  'Manhwa',
  'Manhwah',
  'Manhua',
  'Manhuah',
  'Webtoon',
  'Fanart',
  'Imagination',
  'Acquainted',
  'Stranger',
  'Sensual',
] as const;

export type LeisureType = typeof LEISURE_TYPES[number];

// Leisure type groupings for UI organization
export const LEISURE_TYPE_GROUPS = {
  I: ['Anime', 'Manga', 'Manhwa', 'Manhua', 'Webtoon'],
  II: ['Animeh', 'Mangah', 'Manhwah', 'Manhuah'],
  III: ['Fanart', 'Imagination', 'Acquainted', 'Stranger', 'Sensual'],
} as const;

export type LeisureTypeGroup = keyof typeof LEISURE_TYPE_GROUPS;

// Helper to get types for a group
export function getLeisureTypesForGroup(group: LeisureTypeGroup): readonly string[] {
  return LEISURE_TYPE_GROUPS[group];
}

// Helper to get all groups
export function getAllLeisureGroups(): LeisureTypeGroup[] {
  return Object.keys(LEISURE_TYPE_GROUPS) as LeisureTypeGroup[];
}

// Leisure type display names (for better UI labels)
export const LEISURE_TYPE_LABELS: Record<LeisureType, string> = {
  Anime: 'Anime',
  Animeh: 'Anime (H)',
  Manga: 'Manga',
  Mangah: 'Manga (H)',
  Manhwa: 'Manhwa',
  Manhwah: 'Manhwa (H)',
  Manhua: 'Manhua',
  Manhuah: 'Manhua (H)',
  Webtoon: 'Webtoon',
  Fanart: 'Fan Art',
  Imagination: 'Imagination',
  Acquainted: 'Acquainted',
  Stranger: 'Stranger',
  Sensual: 'Sensual',
};

export function getLeisureTypeLabel(type: LeisureType): string {
  return LEISURE_TYPE_LABELS[type] || type;
}

// ==========================================
// VALIDATION HELPERS
// ==========================================
export function isValidHabitCategory(value: string): value is HabitCategory {
  return HABIT_CATEGORIES.includes(value as HabitCategory);
}

export function isValidHabitActivity(category: HabitCategory, activity: string): boolean {
  const activities = HABIT_ACTIVITIES[category] as readonly string[];
  return activities?.includes(activity) || false;
}

export function isValidFinanceCategory(value: string): value is FinanceTypeCategory {
  return FINANCE_CATEGORIES.includes(value as FinanceTypeCategory);
}

export function isValidTransactionType(value: string): value is TransactionType {
  return TRANSACTION_TYPES.includes(value as TransactionType);
}

export function isValidCurrency(value: string): value is CurrencyCode {
  return CURRENCIES.includes(value as CurrencyCode);
}

export function isValidMood(value: string): value is MoodType {
  return MOOD_OPTIONS.includes(value as MoodType);
}

export function isValidLeisureType(value: string): value is LeisureType {
  return LEISURE_TYPES.includes(value as LeisureType);
}

// ==========================================
// CATEGORY COLORS (Optional - for UI consistency)
// ==========================================
export const HABIT_CATEGORY_COLORS: Record<HabitCategory, string> = {
  Productivity: '#3B82F6', // blue
  'Self-Care': '#10B981', // green
  Logistics: '#F59E0B', // amber
  Enjoyment: '#8B5CF6', // purple
  Nothing: '#6B7280', // gray
};

export const FINANCE_CATEGORY_CONFIG: Record<FinanceTypeCategory, { icon: string; color: string }> = {
  // --- INCOME ---
  Allowance: { icon: 'wallet', color: 'bg-green-500' },
  Salary: { icon: 'cash', color: 'bg-emerald-600' },
  Gift: { icon: 'gift', color: 'bg-pink-500' },
  Repayment: { icon: 'return-up-back', color: 'bg-cyan-500' },
  Freelance: { icon: 'briefcase', color: 'bg-indigo-500' },
  Investments: { icon: 'trending-up', color: 'bg-violet-500' },

  // --- EXPENSES ---
  'Load/Data': { icon: 'wifi', color: 'bg-sky-500' },
  Transport: { icon: 'bus', color: 'bg-yellow-500' },
  School: { icon: 'school', color: 'bg-purple-500' },
  Health: { icon: 'medkit', color: 'bg-rose-500' },
  Digital: { icon: 'laptop', color: 'bg-blue-500' },
  Social: { icon: 'people', color: 'bg-orange-400' },
  Corrupt: { icon: 'alert-circle', color: 'bg-red-700' },
  Food: { icon: 'restaurant', color: 'bg-orange-600' },
  Give: { icon: 'heart', color: 'bg-pink-400' },
  Shopping: { icon: 'cart', color: 'bg-teal-500' },
};

export function getHabitCategoryColor(category: HabitCategory): string {
  return HABIT_CATEGORY_COLORS[category] || '#6B7280';
}

export function getFinanceCategoryColor(category: FinanceTypeCategory): string {
  return FINANCE_CATEGORY_CONFIG[category]?.color || '#6B7280';
}