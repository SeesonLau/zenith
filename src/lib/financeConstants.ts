// src/lib/financeConstants.ts
import type { FinanceTypeCategory, TransactionType } from '@/src/types/database.types';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export const FINANCE_CATEGORY_COLORS: Record<FinanceTypeCategory, string> = {
  // Expenses
  'Load/Data':   '#0ea5e9',
  'Transport':   '#eab308',
  'School':      '#a855f7',
  'Health':      '#f43f5e',
  'Digital':     '#3b82f6',
  'Social':      '#fb923c',
  'Investment':  '#8b5cf6',
  'Food':        '#ea580c',
  'Give':        '#f472b6',
  'Shopping':    '#14b8a6',
  // Income
  'Allowance':   '#22c55e',
  'Salary':      '#059669',
  'Freelance':   '#6366f1',
  'Gift':        '#ec4899',
  'Repayment':   '#06b6d4',
  'Investments': '#8b5cf6',
  'Corrupt':     '#b91c1c',
  'Borrowed':    '#f59e0b',
};

export const FINANCE_CATEGORY_ICONS: Record<FinanceTypeCategory, IoniconsName> = {
  // Expenses
  'Load/Data':   'wifi-outline',
  'Transport':   'bus-outline',
  'School':      'school-outline',
  'Health':      'medkit-outline',
  'Digital':     'laptop-outline',
  'Social':      'people-outline',
  'Investment':  'trending-up-outline',
  'Food':        'restaurant-outline',
  'Give':        'heart-outline',
  'Shopping':    'cart-outline',
  // Income
  'Allowance':   'wallet-outline',
  'Salary':      'cash-outline',
  'Freelance':   'briefcase-outline',
  'Gift':        'gift-outline',
  'Repayment':   'return-up-back-outline',
  'Investments': 'trending-up-outline',
  'Corrupt':     'alert-circle-outline',
  'Borrowed':    'swap-horizontal-outline',
};

export const FINANCE_CATEGORY_DESCRIPTIONS: Record<FinanceTypeCategory, string> = {
  // Expenses
  'Load/Data':   'Mobile load and data credits',
  'Transport':   'Transportation and fare costs',
  'School':      'Education and school expenses',
  'Health':      'Medical and health expenses',
  'Digital':     'Apps, subscriptions, digital content',
  'Social':      'Social and interpersonal expenses',
  'Investment':  'Investment expense or capital put in',
  'Food':        'Food and beverages',
  'Give':        'Gifts and donations given',
  'Shopping':    'Physical items, clothing, gadgets',
  // Income
  'Allowance':   'Regular allowance received',
  'Salary':      'Employment salary or wages',
  'Freelance':   'Freelance and contract income',
  'Gift':        'Gifts and money received',
  'Repayment':   'Money returned or repaid to you',
  'Investments': 'Investment returns and dividends',
  'Corrupt':     'Unauthorized or irregular income',
  'Borrowed':    'Money borrowed or loaned to you',
};

export interface TransactionTypeConfig {
  color: string;
  icon: IoniconsName;
  label: string;
}

export const TRANSACTION_TYPE_CONFIG: Record<TransactionType, TransactionTypeConfig> = {
  income: {
    color: '#22c55e',
    icon: 'arrow-up',
    label: 'Income',
  },
  expense: {
    color: '#ef4444',
    icon: 'arrow-down',
    label: 'Expense',
  },
};

export function getTransactionTypeConfig(type: TransactionType): TransactionTypeConfig {
  return TRANSACTION_TYPE_CONFIG[type];
}

export function getCategoryColor(category: FinanceTypeCategory): string {
  return FINANCE_CATEGORY_COLORS[category];
}

export function getCategoryIcon(category: FinanceTypeCategory): IoniconsName {
  return FINANCE_CATEGORY_ICONS[category];
}

export function getCategoryDescription(category: FinanceTypeCategory): string {
  return FINANCE_CATEGORY_DESCRIPTIONS[category];
}
