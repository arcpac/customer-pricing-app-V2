import { describe, it, expect } from 'vitest';
import { computeAdjustedPrice } from '../utils/pricing.js';

describe('computeAdjustedPrice', () => {
  describe('fixed', () => {
    it('increases by fixed amount', () => {
      expect(computeAdjustedPrice(100, 'fixed', 'increase', 10)).toBe(111);
    });
    it('decreases by fixed amount', () => {
      expect(computeAdjustedPrice(100, 'fixed', 'decrease', 10)).toBe(90);
    });
    it('floors at 0', () => {
      expect(computeAdjustedPrice(5, 'fixed', 'decrease', 10)).toBe(0);
    });
  });

  describe('percentage', () => {
    it('increases by percentage', () => {
      expect(computeAdjustedPrice(200, 'percentage', 'increase', 10)).toBe(220);
    });
    it('decreases by percentage', () => {
      expect(computeAdjustedPrice(200, 'percentage', 'decrease', 10)).toBe(180);
    });
  });

  describe('custom_price', () => {
    it('returns value regardless of direction', () => {
      expect(computeAdjustedPrice(999, 'custom_price', 'increase', 42.5)).toBe(
        42.5,
      );
      expect(computeAdjustedPrice(999, 'custom_price', 'decrease', 42.5)).toBe(
        42.5,
      );
    });
    it('floors at 0', () => {
      expect(computeAdjustedPrice(999, 'custom_price', 'increase', -5)).toBe(0);
    });
  });

  describe('rounding', () => {
    it('rounds to 2 decimal places', () => {
      expect(computeAdjustedPrice(10, 'percentage', 'increase', 33.333)).toBe(
        13.33,
      );
    });
  });
});
