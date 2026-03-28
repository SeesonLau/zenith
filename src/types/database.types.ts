// src/types/database.types.ts
// 🎯 Import all category types from centralized location
import type {
  HabitCategory,
  HabitActivity,
  TransactionType,
  FinanceTypeCategory,
  CurrencyCode,
  MoodType,
  LeisureType,
} from '@/src/constants/categories';

// Re-export category types for convenience
export type {
  HabitCategory,
  TransactionType,
  FinanceTypeCategory,
  CurrencyCode,
  MoodType,
  LeisureType,
};

// Re-export activity type
export type { HabitActivity } from '@/src/constants/categories';

// ==========================================
// HABIT TRACKER DATA TYPES
// ==========================================
export type HabitLogData = {
  id: string;
  category: HabitCategory;
  activity: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  notes?: string;
  isSynced: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ==========================================
// FINANCE TRACKER DATA TYPES
// ==========================================
export type FinanceLogData = {
  id: string;
  transactionType: TransactionType;
  location?: string;
  item: string;
  quantity: number;
  cost: number;
  totalCost: number;
  currency: CurrencyCode;
  typeCategory: FinanceTypeCategory;
  transactionDate: Date;
  notes?: string;
  isSynced: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ==========================================
// DIARY DATA TYPES
// ==========================================
export type DiaryEntryData = {
  id: string;
  title?: string;
  content: string;
  entryDate: Date;
  mood?: MoodType;
  isSynced: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DiaryImageData = {
  id: string;
  diaryEntryId: string;
  localUri: string;
  remoteUrl?: string;
  uploadStatus: 'pending' | 'uploaded' | 'failed';
  fileSize?: number;
  mimeType?: string;
  isSynced: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ==========================================
// LEISURE TRACKER DATA TYPES
// ==========================================
export type LeisureLogData = {
  id: string;
  type: LeisureType;
  title?: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  notes?: string;
  isSynced: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ==========================================
// FORM INPUT TYPES
// ==========================================
export interface CreateHabitLogInput {
  category: HabitCategory;
  activity: string;
  notes?: string;
}

export interface CreateFinanceLogInput {
  transactionType: TransactionType;
  item: string;
  quantity: number;
  cost: number;
  currency?: CurrencyCode;
  typeCategory: FinanceTypeCategory;
  location?: string;
  notes?: string;
}

export interface CreateDiaryEntryInput {
  title?: string;
  content: string;
  mood?: MoodType;
}

export interface CreateLeisureLogInput {
  type: LeisureType;
  title?: string;
  notes?: string;
}

// ==========================================
// ANALYTICS TYPES
// ==========================================
export interface HabitAnalytics {
  totalDuration: number; // in seconds
  byCategory: Record<HabitCategory, number>;
  byActivity: Record<string, number>;
  averageSessionDuration: number;
  mostFrequentActivity: string;
  totalSessions: number;
}

export interface FinanceAnalytics {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  byCategory: Record<FinanceTypeCategory, number>;
  byCurrency: Record<CurrencyCode, { income: number; expenses: number }>;
  averageTransactionSize: number;
  largestTransaction: FinanceLogData;
}

export interface LeisureAnalytics {
  totalDuration: number;
  byType: Record<LeisureType, number>;
  averageSessionDuration: number;
  mostConsumedType: LeisureType;
  totalSessions: number;
}

// ==========================================
// SYNC TYPES
// ==========================================
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt?: Date;
  pendingChanges: number;
  syncError?: string;
}

export interface SyncChange {
  table: string;
  created: any[];
  updated: any[];
  deleted: string[];
}

export interface PullChangesResponse {
  changes: Record<string, SyncChange>;
  timestamp: number;
}

export interface PushChangesPayload {
  changes: Record<string, SyncChange>;
  lastPulledAt: number | null;
}

// ==========================================
// UI STATE TYPES
// ==========================================
export interface TimerState {
  id: string;
  category: string;
  activity: string;
  startedAt: Date;
  elapsedTime: number; // in seconds
}

export interface FilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  searchQuery?: string;
}

// ==========================================
// NAVIGATION TYPES
// ==========================================
export type RootStackParamList = {
  '(tabs)': undefined;
  'habit/[id]': { id: string };
  'habit/start': undefined;
  'finance/[id]': { id: string };
  'finance/add': undefined;
  'diary/[id]': { id: string };
  'diary/new': undefined;
  'leisure/[id]': { id: string };
  'leisure/start': undefined;
  'settings/index': undefined;
};

// ==========================================
// UTILITY TYPES
// ==========================================
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// ==========================================
// ERROR TYPES
// ==========================================
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// ==========================================
// VALIDATION TYPES
// ==========================================
export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: ValidationRule<any>;
}