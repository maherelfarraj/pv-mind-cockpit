import {
  safeNumber,
  safeDivide,
  safeProduct,
  safeSum,
  safePercent,
  allPositive,
  formatValue,
  NEEDS_INPUT,
} from '../utils/safe-math';

describe('safe-math', () => {
  describe('safeNumber', () => {
    it('returns number for valid finite values', () => {
      expect(safeNumber(42)).toBe(42);
      expect(safeNumber(0)).toBe(0);
      expect(safeNumber(-5.5)).toBe(-5.5);
    });
    it('returns null for NaN', () => {
      expect(safeNumber(NaN)).toBeNull();
    });
    it('returns null for Infinity', () => {
      expect(safeNumber(Infinity)).toBeNull();
      expect(safeNumber(-Infinity)).toBeNull();
    });
    it('returns null for null/undefined', () => {
      expect(safeNumber(null)).toBeNull();
      expect(safeNumber(undefined)).toBeNull();
    });
  });

  describe('safeDivide', () => {
    it('divides correctly', () => {
      expect(safeDivide(10, 2)).toBe(5);
    });
    it('returns null for zero denominator', () => {
      expect(safeDivide(10, 0)).toBeNull();
    });
    it('returns null for NaN inputs', () => {
      expect(safeDivide(NaN, 2)).toBeNull();
    });
  });

  describe('safeProduct', () => {
    it('multiplies all operands', () => {
      expect(safeProduct(2, 3, 4)).toBe(24);
    });
    it('returns null if any operand is invalid', () => {
      expect(safeProduct(2, NaN, 4)).toBeNull();
    });
    it('returns null for empty input', () => {
      expect(safeProduct()).toBeNull();
    });
  });

  describe('safeSum', () => {
    it('sums all operands', () => {
      expect(safeSum(1, 2, 3)).toBe(6);
    });
    it('returns null if any operand is invalid', () => {
      expect(safeSum(1, Infinity, 3)).toBeNull();
    });
  });

  describe('safePercent', () => {
    it('returns percentage', () => {
      expect(safePercent(50, 200)).toBe(25);
    });
    it('returns null for zero total', () => {
      expect(safePercent(10, 0)).toBeNull();
    });
  });

  describe('allPositive', () => {
    it('returns true when all values are positive', () => {
      expect(allPositive(1, 2, 3)).toBe(true);
    });
    it('returns false if any value is zero or negative', () => {
      expect(allPositive(1, 0, 3)).toBe(false);
      expect(allPositive(1, -1, 3)).toBe(false);
    });
    it('returns false for null/undefined', () => {
      expect(allPositive(1, null, 3)).toBe(false);
    });
  });

  describe('formatValue', () => {
    it('formats a valid number with unit', () => {
      expect(formatValue(100.5, 'kWh')).toBe('100.50 kWh');
    });
    it('returns NEEDS_INPUT for null', () => {
      expect(formatValue(null)).toBe(NEEDS_INPUT);
    });
    it('formats without unit', () => {
      expect(formatValue(3.14159, '', 3)).toBe('3.142');
    });
  });
});
