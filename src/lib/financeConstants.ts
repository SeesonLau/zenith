// src/lib/financeConstants.ts
import type { FinanceTypeCategory, TransactionType } from '@/src/types/database.types';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export const FINANCE_CATEGORY_COLORS: Record<FinanceTypeCategory, string> = {
  'Load/Data':   '#3b82f6',
  'Transport':   '#06b6d4',
  'School':      '#6366f1',
  'Health':      '#f43f5e',
  'Digital':     '#a855f7',
  'Social':      '#eab308',
  'Corrupt':     '#ef4444',
  'Food':        '#f97316',
  'Give':        '#22c55e',
  'Shopping':    '#ec4899',
  'Allowance':   '#10b981',
  'Salary':      '#059669',
  'Freelance':   '#84cc16',
  'Gift':        '#0ea5e9',
  'Repayment':   '#14b8a6',
  'Investments': '#8b5cf6',
};

export const FINANCE_CATEGORY_ICONS: Record<FinanceTypeCategory, IoniconsName> = {
  'Load/Data':   'phone-portrait-outline',
  'Transport':   'car-outline',
  'School':      'school-outline',
  'Health':      'medkit-outline',
  'Digital':     'apps-outline',
  'Social':      'hand-left-outline',
  'Corrupt':     'warning-outline',
  'Food':        'restaurant-outline',
  'Give':        'gift-outline',
  'Shopping':    'shirt-outline',
  'Allowance':   'wallet-outline',
  'Salary':      'cash-outline',
  'Freelance':   'laptop-outline',
  'Gift':        'gift-outline',
  'Repayment':   'return-down-back-outline',
  'Investments': 'trending-up-outline',
};

export const FINANCE_CATEGORY_DESCRIPTIONS: Record<FinanceTypeCategory, string> = {
  'Load/Data':   'Mobile load and data credits',
  'Transport':   'Transportation and fare costs',
  'School':      'Education and school expenses',
  'Health':      'Medical and health expenses',
  'Digital':     'Apps, subscriptions, digital content',
  'Social':      'Social and interpersonal expenses',
  'Corrupt':     'Unauthorized or fraudulent charges',
  'Food':        'Food and beverages',
  'Give':        'Gifts and donations given',
  'Shopping':    'Physical items, clothing, gadgets',
  'Allowance':   'Regular allowance received',
  'Salary':      'Employment salary or wages',
  'Freelance':   'Freelance and contract income',
  'Gift':        'Gifts and money received',
  'Repayment':   'Money returned or repaid to you',
  'Investments': 'Investment returns and dividends',
};

export interface TransactionTypeConfig {
  color: string;
  icon: IoniconsName;
  label: string;
}

export const TRANSACTION_TYPE_CONFIG: Record<TransactionType, TransactionTypeConfig> = {
  income: {
    color: '#22c55e',
    icon: 'arrow-down',
    label: 'Income',
  },
  expense: {
    color: '#ef4444',
    icon: 'arrow-up',
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
