/** Redis pub/sub event types */

export interface MarketDataUpdateEvent {
  type: 'market_data.update';
  ticker: string;
  interval: string;
  timestamp: string;
}

export interface SignalEvent {
  type: 'signal.new';
  signalId: string;
  portfolioId?: string;
  ticker?: string;
  action?: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface PortfolioChangeEvent {
  type: 'portfolio.changed';
  portfolioId: string;
  userId: string;
  changeType: 'position_added' | 'position_closed' | 'position_updated' | 'portfolio_updated';
}

export type AppEvent = MarketDataUpdateEvent | SignalEvent | PortfolioChangeEvent;
