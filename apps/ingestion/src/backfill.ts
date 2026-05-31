import { prisma } from '@openmoney/database';
import { YFinanceAdapter } from './adapters/yfinance';
import { Normalizer } from './normalizer';
import type { OHLCV } from './adapters/interfaces';

const normalizer = new Normalizer();

/**
 * Backfill historical OHLCV data for a ticker and store in TimescaleDB.
 * Used for seeding data when risk/history endpoints need it.
 *
 * @param ticker - Symbol to backfill (e.g. "AAPL")
 * @param adapter - Data adapter to use
 * @param days - Number of days of history to fetch (default 365)
 * @returns Number of rows inserted
 */
export async function backfillTicker(
  ticker: string,
  adapter: YFinanceAdapter,
  days = 365,
): Promise<{ inserted: number; skipped: number; errors: number }> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  console.log(`[backfill] Fetching ${days} days of history for ${ticker}...`);

  let rows: OHLCV[];
  try {
    rows = await adapter.fetchHistory(ticker, from, to, '1d');
  } catch (err) {
    console.error(`[backfill] Failed to fetch history for ${ticker}:`, err);
    return { inserted: 0, skipped: 0, errors: 1 };
  }

  console.log(`[backfill] Fetched ${rows.length} rows for ${ticker}`);

  const { valid } = normalizer.normalize(rows);
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of valid) {
    try {
      await prisma.$executeRaw`
        INSERT INTO market_data (id, time, ticker, open, high, low, close, volume, vwap, interval, source)
        VALUES (gen_random_uuid(), ${row.time}, ${row.ticker}, ${row.open}, ${row.high}, ${row.low}, ${row.close}, ${row.volume ?? null}, ${row.vwap ?? null}, ${row.interval}, ${row.source})
        ON CONFLICT (time, ticker, interval) DO UPDATE SET
          open = EXCLUDED.open, high = EXCLUDED.high, low = EXCLUDED.low,
          close = EXCLUDED.close, volume = EXCLUDED.volume
      `;
      inserted++;
    } catch (err: any) {
      if (err?.code === '23505' || err?.message?.includes('duplicate')) {
        skipped++;
      } else {
        errors++;
        console.error(`[backfill] DB error for ${ticker} @ ${row.time}:`, err);
      }
    }
  }

  // Update position current prices
  const latestClose = valid.length > 0 ? valid[valid.length - 1]!.close : null;
  if (latestClose !== null) {
    await prisma.position.updateMany({
      where: { ticker, isOpen: true },
      data: { currentPrice: latestClose },
    });
  }

  console.log(`[backfill] ${ticker}: ${inserted} inserted, ${skipped} skipped, ${errors} errors`);
  return { inserted, skipped, errors };
}

/**
 * Backfill all tickers from active positions and watchlists.
 */
export async function backfillAllActive(): Promise<Record<string, { inserted: number; skipped: number; errors: number }>> {
  const yf = new YFinanceAdapter({ rateLimitMs: 2000 });

  const [positions, watchlistItems] = await Promise.all([
    prisma.position.findMany({ where: { isOpen: true }, select: { ticker: true }, distinct: ['ticker'] }),
    prisma.watchlistItem.findMany({ select: { ticker: true }, distinct: ['ticker'] }),
  ]);

  const tickers = new Set<string>();
  for (const p of positions) tickers.add(p.ticker);
  for (const w of watchlistItems) tickers.add(w.ticker);

  console.log(`[backfill] Found ${tickers.size} unique tickers to backfill`);

  const results: Record<string, { inserted: number; skipped: number; errors: number }> = {};
  for (const ticker of tickers) {
    results[ticker] = await backfillTicker(ticker, yf);
  }

  const totalInserted = Object.values(results).reduce((s, r) => s + r.inserted, 0);
  console.log(`[backfill] Complete: ${totalInserted} total rows across ${tickers.size} tickers`);

  return results;
}
