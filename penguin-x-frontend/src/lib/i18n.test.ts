import { describe, it, expect, beforeEach } from 'vitest'
import { formatCurrency, formatNumber, formatDate, formatPercent } from './i18n'

describe('i18n formatters', () => {
  beforeEach(() => {
    // Reset any locale-specific settings
  })

  describe('formatCurrency', () => {
    it('formats USD currency correctly', () => {
      const result = formatCurrency(1234.56, 'en')
      expect(result).toBe('$1,234.56')
    })

    it('formats VND currency correctly', () => {
      const result = formatCurrency(1234567, 'vi')
      // Check that it contains the expected parts rather than exact string match
      expect(result).toContain('1.234.567')
      expect(result).toContain('₫')
    })

    it('handles zero amount', () => {
      const resultEn = formatCurrency(0, 'en')
      const resultVi = formatCurrency(0, 'vi')
      
      expect(resultEn).toBe('$0.00')
      // Check that it contains the expected parts
      expect(resultVi).toContain('0')
      expect(resultVi).toContain('₫')
    })

    it('handles negative amounts', () => {
      const result = formatCurrency(-500, 'en')
      expect(result).toBe('-$500.00')
    })

    it('falls back to English for unknown locale', () => {
      const result = formatCurrency(100, 'unknown')
      expect(result).toBe('$100.00')
    })

    it('uses default locale when not specified', () => {
      const result = formatCurrency(100)
      expect(result).toBe('$100.00')
    })
  })

  describe('formatNumber', () => {
    it('formats numbers with proper thousand separators', () => {
      expect(formatNumber(1234567, 'en')).toBe('1,234,567')
      expect(formatNumber(1234567, 'vi')).toBe('1.234.567')
    })

    it('handles decimal numbers', () => {
      expect(formatNumber(1234.56, 'en')).toBe('1,234.56')
    })

    it('handles zero', () => {
      expect(formatNumber(0, 'en')).toBe('0')
    })

    it('handles negative numbers', () => {
      expect(formatNumber(-1234, 'en')).toBe('-1,234')
    })
  })

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T10:30:00Z')

    it('formats short date in English', () => {
      const result = formatDate(testDate, 'en', 'short')
      expect(result).toContain('Jan')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('formats short date in Vietnamese', () => {
      const result = formatDate(testDate, 'vi', 'short')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('formats long date with weekday', () => {
      const result = formatDate(testDate, 'en', 'long')
      expect(result).toContain('Monday') // or the actual weekday
      expect(result).toContain('January')
    })

    it('formats time correctly', () => {
      const result = formatDate(testDate, 'en', 'time')
      // Note: This will depend on timezone, so we just check format
      expect(result).toMatch(/\d{1,2}:\d{2}/)
    })

    it('uses 24-hour format for Vietnamese time', () => {
      const result = formatDate(testDate, 'vi', 'time')
      expect(result).toMatch(/\d{1,2}:\d{2}/)
      expect(result).not.toContain('AM')
      expect(result).not.toContain('PM')
    })

    it('falls back to English for unknown locale', () => {
      const result = formatDate(testDate, 'unknown', 'short')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('formatPercent', () => {
    it('formats percentage correctly', () => {
      expect(formatPercent(25, 'en')).toBe('25.0%')
      expect(formatPercent(25, 'vi')).toBe('25,0%')
    })

    it('handles decimal percentages', () => {
      expect(formatPercent(25.67, 'en')).toBe('25.67%')
    })

    it('handles zero percent', () => {
      expect(formatPercent(0, 'en')).toBe('0.0%')
    })

    it('handles negative percentages', () => {
      expect(formatPercent(-5.5, 'en')).toBe('-5.5%')
    })

    it('handles values over 100%', () => {
      expect(formatPercent(150.25, 'en')).toBe('150.25%')
    })
  })

  describe('edge cases', () => {
    it('handles very large numbers', () => {
      const largeNumber = 999999999999
      expect(() => formatNumber(largeNumber, 'en')).not.toThrow()
      expect(() => formatCurrency(largeNumber, 'en')).not.toThrow()
    })

    it('handles very small numbers', () => {
      const smallNumber = 0.001
      expect(() => formatNumber(smallNumber, 'en')).not.toThrow()
      expect(() => formatCurrency(smallNumber, 'en')).not.toThrow()
    })

    it('handles invalid dates gracefully', () => {
      const invalidDate = new Date('invalid')
      expect(() => formatDate(invalidDate, 'en', 'short')).toThrow()
    })
  })
})
