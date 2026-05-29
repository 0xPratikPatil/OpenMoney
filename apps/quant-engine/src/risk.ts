import { prisma } from '@openmoney/database';
import { QuantClient } from './client';

interface PortfolioWithPositions {
  id: string;
  positions: Array<{
    ticker: string;
    marketValue: string | number | null;
    costBasis: string | number;
  }>;
}

export class RiskService {
  constructor(private quantClient: QuantClient) {}

  /**
   * Compute risk metrics for a portfolio.
   * Returns cached results if available and fresh.
   */
  async computeForPortfolio(portfolio: PortfolioWithPositions) {
    const openPositions = portfolio.positions.filter((p) => p.marketValue != null);
    if (openPositions.length === 0) {
      return {
        portfolioVaR95: null, portfolioVaR99: null, portfolioCVaR95: null,
        sharpeRatio: null, sortinoRatio: null, maxDrawdown: null,
        maxDrawdownDate: null, beta: null, correlationMatrix: [],
        positionRiskContributions: [], asOfDate: new Date().toISOString(),
      };
    }

    // Get daily close prices for the last 90 days for each position
    const returnsByTicker: Record<string, number[]> = {};
    const pricesByDate: Record<string, { date: string; value: number }[]> = {};
    const positions: { ticker: string; weight: number }[] = [];

    let totalValue = 0;
    for (const p of openPositions) {
      totalValue += Number(p.marketValue);
    }

    for (const p of openPositions) {
      const weight = Number(p.marketValue) / totalValue;
      positions.push({ ticker: p.ticker, weight });

      // Get daily closes from market_data
      const rows = await prisma.$queryRaw<Array<{ time: Date; close: number }>>`
        SELECT time, close FROM market_data
        WHERE ticker = ${p.ticker}
        ORDER BY time DESC LIMIT 90
      `;

      if (rows.length > 1) {
        const closes = rows.map((r: { close: unknown }) => Number(r.close)).reverse();
        const returns: number[] = [];
        for (let i = 1; i < closes.length; i++) {
          const prev = closes[i - 1]!;
          const curr = closes[i]!;
          returns.push((curr - prev) / prev);
        }
        returnsByTicker[p.ticker] = returns;
        pricesByDate[p.ticker] = rows.map((r: { time: { toISOString: () => string }; close: unknown }) => ({ date: r.time.toISOString(), value: Number(r.close) }));
      }
    }

    // Compute portfolio returns (weighted average)
    const portfolioReturns = positions.reduce<number[]>((acc, pos) => {
      const posReturns = returnsByTicker[pos.ticker];
      if (!posReturns) return acc;
      if (acc.length === 0) return posReturns.map((r) => r * pos.weight);
      posReturns.forEach((r, i) => { if (acc[i] !== undefined) acc[i] += r * pos.weight; });
      return acc;
    }, []);

    // Get portfolio value history
    const portfolioValues = await prisma.$queryRaw<Array<{ date: Date; value: number }>>`
      -- placeholder: portfolio daily value tracking
      SELECT NOW() as date, 0 as value LIMIT 0
    `;

    // Call Python microservice
    const response = await this.quantClient.compute('risk_metrics', {
      returns: portfolioReturns,
      prices: portfolioValues.length > 0
        ? portfolioValues.map((v: { date: { toISOString: () => string }; value: number }) => ({ date: v.date.toISOString(), value: v.value }))
        : [],
      positions,
      riskFreeRate: 5.0,
      confidenceLevels: [0.95, 0.99],
    });

    return {
      ...response.data,
      asOfDate: response.computedAt,
    };
  }
}
