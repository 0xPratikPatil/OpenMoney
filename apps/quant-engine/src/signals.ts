import { prisma } from '@openmoney/database';
import { QuantClient } from './client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Decimalish = any;

interface PositionLike {
  id: string;
  ticker: string;
  name: string | null;
  quantity: Decimalish;
  avgEntryPrice: Decimalish;
  currentPrice: Decimalish | null;
  costBasis: Decimalish;
  marketValue: Decimalish | null;
  unrealizedPnl: Decimalish | null;
  unrealizedPnlPercent: Decimalish | null;
  assetClass: string;
  isOpen: boolean;
}

interface PortfolioWithPositions {
  id: string;
  name: string;
  positions: PositionLike[];
}

interface SignalToCreate {
  ticker?: string;
  portfolioId: string;
  type: 'recommendation' | 'alert';
  action?: string;
  confidence: number;
  title: string;
  description: string;
  reasoning: string[];
}

export class SignalGenerator {
  constructor(
    private quantClient: QuantClient,
  ) {}

  async generateForPortfolio(portfolio: PortfolioWithPositions): Promise<SignalToCreate[]> {
    const signals: SignalToCreate[] = [];
    const openPositions = portfolio.positions.filter((p) => p.isOpen);

    if (openPositions.length === 0) return signals;

    // Get latest market data for technical indicators
    for (const pos of openPositions) {
      const prices = await prisma.$queryRaw<Array<{ time: Date; close: number; high: number; low: number; volume: number }>>`
        SELECT time, close, high, low, volume
        FROM market_data
        WHERE ticker = ${pos.ticker}
        ORDER BY time DESC LIMIT 200
      `;

      if (prices.length < 20) continue;

      const priceData = prices.map((p) => ({
        time: p.time.toISOString(),
        close: p.close,
        high: p.high,
        low: p.low,
        volume: p.volume,
      })).reverse();

      // Compute indicators via Python
      const indicatorsResp = await this.quantClient.compute('technical_indicators', {
        ticker: pos.ticker,
        prices: priceData,
      });

      if (!indicatorsResp.success) continue;
      const ind = indicatorsResp.data as Record<string, unknown>;

      // Evaluate rules and generate signals

      // Rule 1: RSI oversold (< 30) → consider add
      if (ind.rsi != null && (ind.rsi as number) < 30) {
        signals.push({
          ticker: pos.ticker,
          portfolioId: portfolio.id,
          type: 'recommendation',
          action: 'add',
          confidence: 0.6,
          title: `${pos.ticker} may be oversold`,
          description: `RSI(${ind.rsi}) is in oversold territory. Consider adding to position.`,
          reasoning: [`RSI at ${ind.rsi} (< 30 oversold threshold)`, `Current P&L: ${pos.unrealizedPnlPercent}%`],
        });
      }

      // Rule 2: RSI overbought (> 70) → consider reduce
      if (ind.rsi != null && (ind.rsi as number) > 70) {
        signals.push({
          ticker: pos.ticker,
          portfolioId: portfolio.id,
          type: 'recommendation',
          action: 'reduce',
          confidence: 0.5,
          title: `${pos.ticker} may be overbought`,
          description: `RSI(${ind.rsi}) is in overbought territory. Consider taking partial profits.`,
          reasoning: [`RSI at ${ind.rsi} (> 70 overbought threshold)`, `Current P&L: ${pos.unrealizedPnlPercent}%`],
        });
      }

      // Rule 3: Stop loss (P&L < -15%) → consider exit
      if (pos.unrealizedPnlPercent != null && Number(pos.unrealizedPnlPercent) < -15) {
        signals.push({
          ticker: pos.ticker,
          portfolioId: portfolio.id,
          type: 'recommendation',
          action: 'exit',
          confidence: 0.7,
          title: `${pos.ticker} stop loss triggered`,
          description: `Position is down ${Number(pos.unrealizedPnlPercent).toFixed(1)}%. Consider exiting to prevent further losses.`,
          reasoning: [`P&L at ${Number(pos.unrealizedPnlPercent).toFixed(1)}% (below -15% stop loss threshold)`],
        });
      }

      // Rule 4: Take profit (P&L > 25%) → consider reduce
      if (pos.unrealizedPnlPercent != null && Number(pos.unrealizedPnlPercent) > 25) {
        signals.push({
          ticker: pos.ticker,
          portfolioId: portfolio.id,
          type: 'recommendation',
          action: 'reduce',
          confidence: 0.5,
          title: `${pos.ticker} take profit opportunity`,
          description: `Position is up ${Number(pos.unrealizedPnlPercent).toFixed(1)}%. Consider taking profits.`,
          reasoning: [`P&L at ${Number(pos.unrealizedPnlPercent).toFixed(1)}% (> 25% take profit threshold)`],
        });
      }

      // Rule 5: Volume spike → alert
      if (ind.volumeSpike === true) {
        signals.push({
          ticker: pos.ticker,
          portfolioId: portfolio.id,
          type: 'alert',
          action: 'hold',
          confidence: 0.3,
          title: `Unusual volume detected for ${pos.ticker}`,
          description: `${pos.ticker} is experiencing higher than normal trading volume. Monitor for potential volatility.`,
          reasoning: ['Volume spike detected (> 2x 20-day average)'],
        });
      }
    }

    // Portfolio-level: concentration check
    const totalValue = openPositions.reduce((s, p) => s + Number(p.marketValue ?? 0), 0);
    for (const pos of openPositions) {
      const alloc = Number(pos.marketValue ?? 0) / totalValue;
      if (alloc > 0.25) {
        signals.push({
          ticker: pos.ticker,
          portfolioId: portfolio.id,
          type: 'alert',
          action: 'rebalance',
          confidence: 0.6,
          title: `High concentration: ${pos.ticker}`,
          description: `${pos.ticker} represents ${(alloc * 100).toFixed(0)}% of your portfolio. Consider reducing to manage risk.`,
          reasoning: [`Allocation: ${(alloc * 100).toFixed(0)}% (> 25% concentration limit)`],
        });
      }
    }

    // Persist signals to database
    for (const sig of signals) {
      await prisma.signal.create({
        data: {
          ticker: sig.ticker,
          portfolioId: sig.portfolioId,
          type: sig.type,
          action: sig.action,
          confidence: sig.confidence,
          title: sig.title,
          description: sig.description,
          reasoning: sig.reasoning,
        },
      });
    }

    return signals;
  }
}
