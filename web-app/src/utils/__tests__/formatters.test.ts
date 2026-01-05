/**
 * Tests for formatter utilities
 */

import {
  formatCurrency,
  formatPercent,
  formatNumber,
  truncate,
} from '../formatters';

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235');
    expect(formatCurrency(1000000)).toBe('$1,000,000');
    expect(formatCurrency(0.99)).toBe('$1');
  });

  it('should format negative numbers correctly', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,235');
    expect(formatCurrency(-1000)).toBe('-$1,000');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('should handle very large numbers', () => {
    expect(formatCurrency(999999999)).toBe('$999,999,999');
    expect(formatCurrency(1000000000)).toBe('$1,000,000,000');
  });

  it('should round to nearest dollar', () => {
    expect(formatCurrency(1234.4)).toBe('$1,234');
    expect(formatCurrency(1234.5)).toBe('$1,235');
    expect(formatCurrency(1234.6)).toBe('$1,235');
  });
});

describe('formatPercent', () => {
  it('should format percentages correctly', () => {
    expect(formatPercent(12.34)).toBe('12.34%');
    expect(formatPercent(50)).toBe('50.00%');
    expect(formatPercent(100)).toBe('100.00%');
  });

  it('should handle negative percentages', () => {
    expect(formatPercent(-10)).toBe('-10.00%');
    expect(formatPercent(-5.34)).toBe('-5.34%');
  });

  it('should handle zero', () => {
    expect(formatPercent(0)).toBe('0.00%');
    expect(formatPercent(0, 0)).toBe('0%');
  });

  it('should handle custom decimal places', () => {
    expect(formatPercent(12.346, 3)).toBe('12.346%');
    expect(formatPercent(12.3, 1)).toBe('12.3%');
  });
});

describe('formatNumber', () => {
  it('should format numbers with commas', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(1000)).toBe('1,000');
  });

  it('should handle decimals', () => {
    expect(formatNumber(1234.56, 2)).toBe('1,234.56');
    expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber(-1234)).toBe('-1,234');
    expect(formatNumber(-1234.56, 2)).toBe('-1,234.56');
  });
});

describe('truncate', () => {
  it('should truncate long text', () => {
    const longText = 'This is a very long text that should be truncated';
    expect(truncate(longText, 20)).toBe('This is a very lo...');
  });

  it('should not truncate short text', () => {
    const shortText = 'Short text';
    expect(truncate(shortText, 20)).toBe('Short text');
  });

  it('should handle exact length', () => {
    const text = '12345678901234567890';
    expect(truncate(text, 20)).toBe('12345678901234567890');
  });

  it('should handle empty string', () => {
    expect(truncate('', 10)).toBe('');
  });
});

describe('Edge Cases', () => {
  it('should handle NaN', () => {
    expect(formatCurrency(NaN)).toBe('$0');
    expect(formatPercent(NaN)).toBe('0%');
    expect(formatNumber(NaN)).toBe('0');
  });

  it('should handle Infinity', () => {
    expect(formatCurrency(Infinity)).toBe('$0');
    expect(formatCurrency(-Infinity)).toBe('$0');
    expect(formatPercent(Infinity)).toBe('0%');
    expect(formatNumber(Infinity)).toBe('0');
  });

  it('should handle undefined', () => {
    expect(formatCurrency(undefined)).toBe('$0');
    expect(formatPercent(undefined)).toBe('0%');
    expect(formatNumber(undefined)).toBe('0');
  });

  it('should handle null', () => {
    expect(formatCurrency(null)).toBe('$0');
    expect(formatPercent(null)).toBe('0%');
    expect(formatNumber(null)).toBe('0');
  });
});

