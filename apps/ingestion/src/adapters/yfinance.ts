import type { DataAdapter, DataAdapterConfig, Quote, OHLCV } from './interfaces';

export class YFinanceAdapter implements DataAdapter {
  readonly name = 'yfinance';
  private lastCallTime = 0;
  private readonly rateLimitMs: number;

  constructor(config: DataAdapterConfig) {
    this.rateLimitMs = config.rateLimitMs;
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastCallTime;
    if (elapsed < this.rateLimitMs) {
      await new Promise((r) => setTimeout(r, this.rateLimitMs - elapsed));
    }
    this.lastCallTime = Date.now();
  }

  async fetchQuote(ticker: string): Promise<Quote> {
    await this.throttle();
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) throw new Error(`YFinance fetchQuote failed for ${ticker}: ${res.status}`);
    const json = await res.json() as Record<string, unknown>;
    const result = (json as any)?.chart?.result?.[0];
    if (!result) throw new Error(`YFinance: no data for ${ticker}`);

    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    return {
      ticker,
      price: meta.regularMarketPrice ?? meta.previousClose,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      volume: quote?.volume?.[0] ?? null,
      timestamp: new Date(meta.regularMarketTime * 1000),
      source: 'yfinance',
    };
  }

  async fetchHistory(ticker: string, from: Date, to: Date, interval = '1d'): Promise<OHLCV[]> {
    await this.throttle();
    const fromUnix = Math.floor(from.getTime() / 1000);
    const toUnix = Math.floor(to.getTime() / 1000);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${fromUnix}&period2=${toUnix}&interval=${interval}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`YFinance fetchHistory failed for ${ticker}: ${res.status}`);
    const json = await res.json() as Record<string, unknown>;
    const result = (json as any)?.chart?.result?.[0];
    if (!result) return [];

    const timestamps: number[] = result.timestamp ?? [];
    const quote = result.indicators?.quote?.[0] ?? {};

    return timestamps.map((t, i) => ({
      time: new Date(t * 1000),
      ticker,
      open: quote.open?.[i] ?? 0,
      high: quote.high?.[i] ?? 0,
      low: quote.low?.[i] ?? 0,
      close: quote.close?.[i] ?? 0,
      volume: quote.volume?.[i] ?? null,
      vwap: null,
      interval,
      source: 'yfinance',
    })).filter((o) => o.close > 0);
  }

  async fetchEOD(ticker: string): Promise<OHLCV> {
    const quote = await this.fetchQuote(ticker);
    return {
      time: quote.timestamp,
      ticker,
      open: quote.price,
      high: quote.price,
      low: quote.price,
      close: quote.price,
      volume: quote.volume,
      vwap: null,
      interval: '1d',
      source: 'yfinance',
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.fetchQuote('SPY');
      return true;
    } catch {
      return false;
    }
  }
}
