import { prisma } from '@openmoney/database';
import { Normalizer } from './normalizer';
import type { DataAdapter, OHLCV } from './adapters/interfaces';

/**
 * Ingestion pipeline: adapter → normalizer → TimescaleDB → Redis pub/sub
 *
 * MVP uses direct DB writes (no Redis Streams) for simplicity.
 * Redis Streams can be added for backpressure when scaling to many tickers.
 */
export class Pipeline {
  private adapters: Map<string, DataAdapter> = new Map();
  private normalizer = new Normalizer();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private trackedTickers: Set<string> = new Set();

  registerAdapter(name: string, adapter: DataAdapter): void {
    this.adapters.set(name, adapter);
  }

  /** Add tickers to track */
  addTickers(tickers: string[]): void {
    for (const t of tickers) this.trackedTickers.add(t.toUpperCase());
  }

  /** Start periodic polling */
  async start(): Promise<void> {
    // Poll every 60 seconds for active tickers
    this.intervalId = setInterval(() => this.pollAll(), 60_000);

    // Initial poll
    await this.pollAll();
    console.log('[pipeline] Started. Polling every 60s.');
  }

  stop(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private async pollAll(): Promise<void> {
    // Collect tickers from all user positions and watchlists
    try {
      const [positions, watchlistItems] = await Promise.all([
        prisma.position.findMany({ where: { isOpen: true }, select: { ticker: true }, distinct: ['ticker'] }),
        prisma.watchlistItem.findMany({ select: { ticker: true }, distinct: ['ticker'] }),
      ]);

      for (const p of positions) this.trackedTickers.add(p.ticker);
      for (const w of watchlistItems) this.trackedTickers.add(w.ticker);

      if (this.trackedTickers.size === 0) return;

      console.log(`[pipeline] Polling ${this.trackedTickers.size} tickers...`);

      // Use first available adapter
      const adapter = this.adapters.values().next().value;
      if (!adapter) {
        console.warn('[pipeline] No adapters registered');
        return;
      }

      for (const ticker of this.trackedTickers) {
        try {
          const quote = await adapter.fetchQuote(ticker);
          await this.processOHLCV({
            time: quote.timestamp,
            ticker: quote.ticker,
            open: quote.price,
            high: quote.price,
            low: quote.price,
            close: quote.price,
            volume: quote.volume,
            vwap: null,
            interval: '1d',
            source: quote.source,
          });
        } catch (err) {
          console.error(`[pipeline] Error polling ${ticker}:`, err);
        }
      }
    } catch (err) {
      console.error('[pipeline] Error in poll cycle:', err);
    }
  }

  /** Process a single OHLCV row: normalize → store → publish */
  async processOHLCV(row: OHLCV): Promise<void> {
    const { valid, reports } = this.normalizer.normalize([row]);

    if (reports[0] && !reports[0].passed) {
      console.warn(`[pipeline] Data quality issue for ${row.ticker}:`, reports[0].issues.join(', '));
    }

    if (valid.length === 0) return;

    const data = valid[0];
    try {
      // Insert into TimescaleDB
      await prisma.$executeRaw`
        INSERT INTO market_data (time, ticker, open, high, low, close, volume, vwap, interval, source)
        VALUES (${data.time}, ${data.ticker}, ${data.open}, ${data.high}, ${data.low}, ${data.close}, ${data.volume}, ${data.vwap}, ${data.interval}, ${data.source})
        ON CONFLICT DO NOTHING
      `;

      // Update position current prices
      await prisma.position.updateMany({
        where: { ticker: data.ticker, isOpen: true },
        data: {
          currentPrice: data.close,
          marketValue: prisma.position.fields.quantity.mul(data.close),
          unrealizedPnl: prisma.position.fields.marketValue.sub(prisma.position.fields.costBasis),
          unrealizedPnlPercent: prisma.position.fields.costBasis.gt(0)
            ? prisma.position.fields.marketValue.sub(prisma.position.fields.costBasis).div(prisma.position.fields.costBasis).mul(100)
            : 0,
        },
      });

      // Publish update event (Redis pub/sub — stub for now)
      console.log(`[pipeline] Updated ${data.ticker}: $${data.close}`);
    } catch (err) {
      console.error(`[pipeline] Error storing ${data.ticker}:`, err);
    }
  }
}
