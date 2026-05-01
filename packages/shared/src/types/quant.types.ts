export type QuantTaskType = 'risk_metrics' | 'forecast' | 'optimize' | 'technical_indicators';

export interface QuantRequest {
  type: QuantTaskType;
  payload: Record<string, unknown>;
}

export interface QuantResponse {
  success: boolean;
  data: Record<string, unknown>;
  error?: string;
  computedAt: string;
}

export interface TechnicalIndicatorsInput {
  ticker: string;
  prices: { time: string; close: number; high: number; low: number; volume?: number }[];
}

export interface TechnicalIndicatorsOutput {
  ticker: string;
  rsi: number | null;
  macd: { macd: number; signal: number; histogram: number } | null;
  sma50: number | null;
  sma200: number | null;
  bollingerBands: { upper: number; middle: number; lower: number } | null;
  volumeSpike: boolean;
}

export interface RiskMetricsInput {
  returns: number[];
  prices: { date: string; value: number }[];
  positions: { ticker: string; weight: number }[];
  riskFreeRate: number;
  confidenceLevels: number[];
}

export interface ForecastInput {
  prices: number[];
  days: number;
  model: 'arima' | 'garch' | 'monte_carlo';
  simulations?: number;
}

export interface OptimizeInput {
  returns: Record<string, number[]>;
  objective: 'min_volatility' | 'max_sharpe' | 'risk_parity';
  constraints?: Record<string, unknown>;
}
