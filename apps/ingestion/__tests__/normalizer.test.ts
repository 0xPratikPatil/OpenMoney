import { describe, it, expect } from 'bun:test';
import { Normalizer } from '../src/normalizer';
import type { OHLCV } from '../src/adapters/interfaces';

function makeRow(overrides: Partial<OHLCV> = {}): OHLCV {
  return {
    time: new Date('2026-05-31'),
    ticker: 'AAPL',
    open: 200,
    high: 205,
    low: 198,
    close: 203,
    volume: 50000000,
    vwap: null,
    interval: '1d',
    source: 'yfinance',
    ...overrides,
  };
}

describe('Normalizer', () => {
  const normalizer = new Normalizer();

  describe('normalize', () => {
    it('passes valid OHLCV data', () => {
      const { valid, reports } = normalizer.normalize([makeRow()]);
      expect(reports).toHaveLength(1);
      expect(reports[0]!.passed).toBe(true);
      expect(valid).toHaveLength(1);
    });

    it('rejects row with negative close', () => {
      const { reports } = normalizer.normalize([makeRow({ close: -5 })]);
      expect(reports[0]!.passed).toBe(false);
      expect(reports[0]!.issues).toContain('Invalid close');
    });

    it('rejects row with zero open', () => {
      const { reports } = normalizer.normalize([makeRow({ open: 0 })]);
      expect(reports[0]!.passed).toBe(false);
      expect(reports[0]!.issues).toContain('Invalid open');
    });

    it('rejects row where high < low', () => {
      const { reports } = normalizer.normalize([makeRow({ high: 190, low: 200 })]);
      expect(reports[0]!.passed).toBe(false);
      expect(reports[0]!.issues).toContain('High < Low');
    });

    it('rejects row where high is not the maximum', () => {
      const { reports } = normalizer.normalize([makeRow({ high: 200, low: 195, close: 210 })]);
      expect(reports[0]!.passed).toBe(false);
      expect(reports[0]!.issues).toContain('High not max');
    });

    it('rejects row where low is not the minimum', () => {
      const { reports } = normalizer.normalize([makeRow({ high: 210, low: 190, close: 185 })]);
      expect(reports[0]!.passed).toBe(false);
      expect(reports[0]!.issues).toContain('Low not min');
    });

    it('detects anomaly: >50% price move vs last valid row', () => {
      const prev = makeRow({ open: 100, high: 105, low: 98, close: 100 });
      const spike = makeRow({ open: 200, high: 205, low: 198, close: 200 });
      const { reports } = normalizer.normalize([prev, spike]);
      expect(reports[1]!.passed).toBe(false);
      expect(reports[1]!.issues.some((i) => i.startsWith('Anomaly'))).toBe(true);
    });

    it('accepts normal price moves (<50%)', () => {
      const prev = makeRow({ open: 100, high: 105, low: 98, close: 100 });
      const normal = makeRow({ open: 105, high: 110, low: 103, close: 105 });
      const { reports } = normalizer.normalize([prev, normal]);
      expect(reports[1]!.passed).toBe(true);
    });

    it('handles NaN values', () => {
      const { reports } = normalizer.normalize([makeRow({ close: NaN })]);
      expect(reports[0]!.passed).toBe(false);
      expect(reports[0]!.issues).toContain('Invalid close');
    });

    it('handles Infinity values', () => {
      const { reports } = normalizer.normalize([makeRow({ high: Infinity })]);
      expect(reports[0]!.passed).toBe(false);
      expect(reports[0]!.issues).toContain('Invalid high');
    });

    it('returns multiple rows when all valid', () => {
      const rows = [
        makeRow({ open: 200, high: 210, low: 198, close: 203 }),
        makeRow({ open: 203, high: 208, low: 201, close: 204 }),
        makeRow({ open: 204, high: 210, low: 202, close: 206 }),
      ];
      const { valid } = normalizer.normalize(rows);
      expect(valid).toHaveLength(3);
    });

    it('filters out invalid rows and keeps valid ones', () => {
      const rows = [
        makeRow({ open: 100, high: 105, low: 98, close: 100 }),
        makeRow({ open: 0, high: 0, low: 0, close: -10 }),
        makeRow({ open: 102, high: 107, low: 100, close: 102 }),
      ];
      const { valid, reports } = normalizer.normalize(rows);
      expect(valid).toHaveLength(2);
      expect(valid[0]!.close).toBe(100);
      expect(valid[1]!.close).toBe(102);
      expect(reports).toHaveLength(3);
      expect(reports[1]!.passed).toBe(false);
    });
  });

  describe('isStale', () => {
    it('returns false for recent data', () => {
      const row = makeRow({ time: new Date() });
      expect(normalizer.isStale(row, 48)).toBe(false);
    });

    it('returns true for old data', () => {
      const old = new Date();
      old.setDate(old.getDate() - 3);
      const row = makeRow({ time: old });
      expect(normalizer.isStale(row, 48)).toBe(true);
    });

    it('uses default maxAgeHours of 48', () => {
      const row = makeRow({ time: new Date(Date.now() - 47 * 60 * 60 * 1000) });
      expect(normalizer.isStale(row)).toBe(false);
    });
  });
});
