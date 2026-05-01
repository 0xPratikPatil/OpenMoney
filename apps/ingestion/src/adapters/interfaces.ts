export interface Quote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number | null;
  timestamp: Date;
  source: string;
}

export interface OHLCV {
  time: Date;
  ticker: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
  vwap: number | null;
  interval: string;
  source: string;
}

export interface DataAdapterConfig {
  rateLimitMs: number;
}

export interface DataAdapter {
  readonly name: string;
  /** Get real-time quote for a ticker */
  fetchQuote(ticker: string): Promise<Quote>;
  /** Get historical OHLCV data */
  fetchHistory(ticker: string, from: Date, to: Date, interval?: string): Promise<OHLCV[]>;
  /** Get daily EOD snapshot */
  fetchEOD(ticker: string): Promise<OHLCV>;
  /** Check adapter health */
  healthCheck(): Promise<boolean>;
}
