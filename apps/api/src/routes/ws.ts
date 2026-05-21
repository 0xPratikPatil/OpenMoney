/**
 * WebSocket market-data handler.
 * 
 * In production, this would use Redis pub/sub to push real-time prices
 * to connected clients. For MVP, it's a minimal echo server that
 * confirms subscription and provides a health check.
 * 
 * Full WebSocket implementation requires the Bun `websocket` export:
 *   export default { port: 4000, fetch: app.fetch, websocket: wsHandler }
 */

import type { ServerWebSocket } from 'bun';

interface WSClient {
  socket: ServerWebSocket;
  subscriptions: Set<string>;
}

const clients = new Map<string, WSClient>();

export function handleWebSocketUpgrade(path: string): boolean {
  return path === '/ws/market-data' || path === '/ws/alerts';
}

export const wsHandler = {
  open(ws: ServerWebSocket) {
    const id = crypto.randomUUID();
    clients.set(id, { socket: ws, subscriptions: new Set() });
    (ws as unknown as { data: { id: string } }).data = { id };
    ws.send(JSON.stringify({ type: 'connected', clientId: id }));
    console.log(`[ws] Client connected: ${id}`);
  },

  message(ws: ServerWebSocket, message: string) {
    try {
      const data = JSON.parse(message);
      const wsData = (ws as unknown as { data: { id: string } }).data;
      const client = clients.get(wsData.id);
      if (!client) return;

      switch (data.type) {
        case 'subscribe':
          if (data.ticker) {
            client.subscriptions.add(data.ticker.toUpperCase());
            ws.send(JSON.stringify({ type: 'subscribed', ticker: data.ticker.toUpperCase() }));
          }
          break;
        case 'unsubscribe':
          if (data.ticker) {
            client.subscriptions.delete(data.ticker.toUpperCase());
            ws.send(JSON.stringify({ type: 'unsubscribed', ticker: data.ticker.toUpperCase() }));
          }
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
        default:
          ws.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${data.type}` }));
      }
    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
    }
  },

  close(ws: ServerWebSocket) {
    const wsData = (ws as unknown as { data: { id: string } }).data;
    clients.delete(wsData.id);
    console.log(`[ws] Client disconnected: ${wsData.id}`);
  },

  drain(ws: ServerWebSocket) {
    // Backpressure handling if needed
    const wsData = (ws as unknown as { data: { id: string } }).data;
    console.log(`[ws] Drain: ${wsData.id}`);
  },
};

/**
 * Broadcast a price update to all subscribed clients.
 * Called by the ingestion pipeline after storing new data.
 */
export function broadcastPriceUpdate(ticker: string, price: number, change: number, changePercent: number, timestamp: string) {
  const message = JSON.stringify({
    type: 'price_update',
    ticker: ticker.toUpperCase(),
    price,
    change,
    changePercent,
    timestamp,
  });

  for (const client of clients.values()) {
    if (client.subscriptions.has(ticker.toUpperCase())) {
      try {
        client.socket.send(message);
      } catch {
        // Client may have disconnected
      }
    }
  }
}

/**
 * Live quote poller — fetches quotes from yfinance every 30s
 * for all tickers with active subscribers. Runs as a background
 * interval until the ingestion pipeline replaces it.
 */
let pollerInterval: ReturnType<typeof setInterval> | null = null;

export function startLiveQuotePoller(): void {
  if (pollerInterval) return;

  pollerInterval = setInterval(async () => {
    const allTickers = new Set<string>();
    for (const client of clients.values()) {
      for (const t of client.subscriptions) {
        allTickers.add(t);
      }
    }
    if (allTickers.size === 0) return;

    const tickers = Array.from(allTickers);
    try {
      const { globalRegistry, QueryExecutor } = await import("@openmoney/provider-core");
      const executor = new QueryExecutor(globalRegistry);

      for (const ticker of tickers) {
        try {
          const result = await executor.execute<Array<Record<string, unknown>>>(
            "yfinance", "equity/quote", { symbol: ticker },
          );
          if (Array.isArray(result) && result.length > 0) {
            const quote = result[0]!;
            broadcastPriceUpdate(
              ticker,
              quote.price as number,
              (quote.change ?? 0) as number,
              (quote.changePercent ?? 0) as number,
              new Date().toISOString(),
            );
          }
        } catch {
          // Skip failed fetches silently
        }
        // Rate-limit: 1 quote per 200ms to avoid overwhelming yfinance
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch {
      // Provider system unavailable
    }
  }, 30_000);
}

export function stopLiveQuotePoller(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
  }
}
