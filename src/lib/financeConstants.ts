// src/lib/financeConstants.ts (FIXED - Correct Icon Typing)
import type { FinanceTypeCategory, TransactionType } from '@/src/types/database.types';

/**
 * Valid Ionicons icon names
 * Use string literal type for icon names
 */
type IoniconsName = 
  | 'phone-portrait-outline'
  | 'car-outline'
  | 'school-outline'
  | 'shirt-outline'
  | 'apps-outline'
  | 'hand-left-outline'
  | 'warning-outline'
  | 'restaurant-outline'
  | 'gift-outline'
  | 'return-down-back-outline'
  | 'cash-outline'
  | 'arrow-down'
  | 'arrow-up'
  | 'wallet-outline';

/**
 * Color mapping for all finance categories
 * Matches the 11 categories defined in database.types.ts
 */
export const FINANCE_CATEGORY_COLORS: Record<FinanceTypeCategory, string> = {
  Load: 'bg-blue-500',               // Mobile load, credits
  Fare: 'bg-cyan-500',               // Transportation
  School: 'bg-indigo-500',           // Education
  'Personal-Physical': 'bg-pink-500', // Physical items
  'Personal-Digital': 'bg-purple-500', // Digital purchases
  Favor: 'bg-yellow-500',            // Favors, loans
  Corrupt: 'bg-red-500',             // Unauthorized
  Food: 'bg-orange-500',             // Food & drinks
  Give: 'bg-green-500',              // Gifts, donations
  Refund: 'bg-teal-500',             // Refunds
  Withdraw: 'bg-gray-500',           // Withdrawals
};

/**
 * Icon mapping for finance categories
 */
export const FINANCE_CATEGORY_ICONS: Record<FinanceTypeCategory, IoniconsName> = {
  Load: 'phone-portrait-outline',
  Fare: 'car-outline',
  School: 'school-outline',
  'Personal-Physical': 'shirt-outline',
  'Personal-Digital': 'apps-outline',
  Favor: 'hand-left-outline',
  Corrupt: 'warning-outline',
  Food: 'restaurant-outline',
  Give: 'gift-outline',
  Refund: 'return-down-back-outline',
  Withdraw: 'cash-outline',
};

/**
 * Description for each category
 */
export const FINANCE_CATEGORY_DESCRIPTIONS: Record<FinanceTypeCategory, string> = {
  Load: 'Mobile load, prepaid credits',
  Fare: 'Transportation costs',
  School: 'Education expenses',
  'Personal-Physical': 'Physical items, clothing, gadgets',
  'Personal-Digital': 'Apps, subscriptions, digital content',
  Favor: 'Money lent or borrowed',
  Corrupt: 'Unauthorized or fraudulent charges',
  Food: 'Food and beverages',
  Give: 'Gifts and donations',
  Refund: 'Money returned or refunded',
  Withdraw: 'Cash withdrawals',
};

/**
 * Transaction type configuration
 */
export interface TransactionTypeConfig {
  color: string;
  icon: IoniconsName;
  label: string;
}

export const TRANSACTION_TYPE_CONFIG: Record<TransactionType, TransactionTypeConfig> = {
  income: {
    color: 'bg-green-500',
    icon: 'arrow-down',
    label: 'Income',
  },
  expense: {
    color: 'bg-red-500',
    icon: 'arrow-up',
    label: 'Expense',
  },
};

/**
 * Get configuration for a transaction type
 */
export function getTransactionTypeConfig(type: TransactionType): TransactionTypeConfig {
  return TRANSACTION_TYPE_CONFIG[type];
}

/**
 * Get color class for a finance category
 */
export function getCategoryColor(category: FinanceTypeCategory): string {
  return FINANCE_CATEGORY_COLORS[category];
}

/**
 * Get icon for a finance category
 */
export function getCategoryIcon(category: FinanceTypeCategory): IoniconsName {
  return FINANCE_CATEGORY_ICONS[category];
}

/**
 * Get description for a finance category
 */
export function getCategoryDescription(category: FinanceTypeCategory): string {
  return FINANCE_CATEGORY_DESCRIPTIONS[category];
}