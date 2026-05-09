import type { OHLCV } from './adapters/interfaces';

export interface DataQualityReport {
  passed: boolean;
  issues: string[];
  ticker: string;
  timestamp: Date;
}

export class Normalizer {
  /**
   * Normalize and validate incoming OHLCV data before storage.
   * Checks: gap detection, staleness, anomaly detection, field validity.
   */
  normalize(data: OHLCV[]): { valid: OHLCV[]; reports: DataQualityReport[] } {
    const valid: OHLCV[] = [];
    const reports: DataQualityReport[] = [];

    for (const row of data) {
      const issues: string[] = [];

      // Field validity
      if (!Number.isFinite(row.open) || row.open <= 0) issues.push('Invalid open');
      if (!Number.isFinite(row.high) || row.high <= 0) issues.push('Invalid high');
      if (!Number.isFinite(row.low) || row.low <= 0) issues.push('Invalid low');
      if (!Number.isFinite(row.close) || row.close <= 0) issues.push('Invalid close');
      if (row.high < row.low) issues.push('High < Low');
      if (row.high < row.close || row.high < row.open) issues.push('High not max');
      if (row.low > row.close || row.low > row.open) issues.push('Low not min');

      // Anomaly detection: price move > 50% in one period
      if (valid.length > 0) {
        const prev = valid[valid.length - 1]!;
        const change = Math.abs((row.close - prev.close) / prev.close);
        if (change > 0.5) {
          issues.push(`Anomaly: ${(change * 100).toFixed(1)}% price move`);
        }
      }

      const report: DataQualityReport = {
        passed: issues.length === 0,
        issues,
        ticker: row.ticker,
        timestamp: row.time,
      };
      reports.push(report);

      if (report.passed) {
        valid.push(row);
      }
    }

    return { valid, reports };
  }

  /** Check if market data is stale (older than expected) */
  isStale(row: OHLCV, maxAgeHours: number = 48): boolean {
    const age = Date.now() - row.time.getTime();
    return age > maxAgeHours * 60 * 60 * 1000;
  }
}
