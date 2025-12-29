import type { CurrencyCode } from '@/src/types/database.types';

/**
 * Format currency with proper symbol and formatting
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'PHP'): string {
  const symbols: Record<CurrencyCode, string> = {
    PHP: '₱',
    USD: '$',
    EUR: '€',
    JPY: '¥',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
    CNY: 'CN¥',
    KRW: '₩',
  };

  const symbol = symbols[currency] || currency;
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formatted}`;
}

/**
 * Format duration in seconds to HH:MM:SS
 */
export function formatDurationHMS(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((v) => v.toString().padStart(2, '0'))
    .join(':');
}

/**
 * Format duration in seconds to readable format (e.g., "2h 30m")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format time from Date object (e.g., "2:30 PM")
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

