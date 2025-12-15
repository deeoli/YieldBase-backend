/**
 * Formatting utility functions
 */

/**
 * Format price as currency
 */
export function formatPrice(price: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format currency with custom options
 */
export function formatCurrency(
  amount: number,
  currency: string = 'GBP',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

