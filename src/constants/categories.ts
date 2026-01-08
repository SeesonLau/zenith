// src/constants/categories.ts
// 🎯 SINGLE SOURCE OF TRUTH FOR ALL CATEGORIES
// Edit this file to add/remove/modify categories across the entire app

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

export const FINANCE_CATEGORIES = [
  'Load',
  'Fare',
  'School',
  'Personal-Physical',
  'Personal-Digital',
  'Favor',
  'Corrupt',
  'Food',
  'Give',
  'Refund',
  'Withdraw',
] as const;

export type FinanceTypeCategory = typeof FINANCE_CATEGORIES[number];

export const CURRENCIES = [
  'PHP',
  'USD',
  'EUR',
  'JPY',
  'GBP',
  'AUD',
  'CAD',
  'CNY',
  'KRW',
] as const;

export type CurrencyCode = typeof CURRENCIES[number];

// Currency symbols helper
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  PHP: '₱',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  CNY: '¥',
  KRW: '₩',
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

export const FINANCE_CATEGORY_COLORS: Record<FinanceTypeCategory, string> = {
  Load: '#3B82F6',
  Fare: '#F59E0B',
  School: '#8B5CF6',
  'Personal-Physical': '#10B981',
  'Personal-Digital': '#06B6D4',
  Favor: '#EC4899',
  Corrupt: '#EF4444',
  Food: '#F97316',
  Give: '#14B8A6',
  Refund: '#84CC16',
  Withdraw: '#6366F1',
};

export function getHabitCategoryColor(category: HabitCategory): string {
  return HABIT_CATEGORY_COLORS[category] || '#6B7280';
}

export function getFinanceCategoryColor(category: FinanceTypeCategory): string {
  return FINANCE_CATEGORY_COLORS[category] || '#6B7280';
}