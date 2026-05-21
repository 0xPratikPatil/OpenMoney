'use client';

import * as React from 'react';

interface QuoteUpdate {
  type: 'price_update';
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface LiveQuote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:4000/ws/market-data';

/**
 * Hook that subscribes to real-time price updates via WebSocket.
 *
 * ```tsx
 * const { quotes, subscribed, subscribe, unsubscribe } = useMarketStream(['AAPL', 'MSFT']);
 * ```
 */
export function useMarketStream(initialSymbols: string[] = []) {
  const [quotes, setQuotes] = React.useState<Map<string, LiveQuote>>(new Map());
  const [connected, setConnected] = React.useState(false);
  const wsRef = React.useRef<WebSocket | null>(null);
  const subscribedRef = React.useRef<Set<string>>(new Set());

  const subscribe = React.useCallback((symbol: string) => {
    if (subscribedRef.current.has(symbol)) return;
    subscribedRef.current.add(symbol);
    wsRef.current?.send(JSON.stringify({ type: 'subscribe', ticker: symbol.toUpperCase() }));
  }, []);

  const unsubscribe = React.useCallback((symbol: string) => {
    subscribedRef.current.delete(symbol);
    wsRef.current?.send(JSON.stringify({ type: 'unsubscribe', ticker: symbol.toUpperCase() }));
  }, []);

  React.useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let reconnectDelay = 1000;

    function connect() {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setConnected(true);
        reconnectDelay = 1000;

        // Re-subscribe all previously subscribed symbols
        for (const s of subscribedRef.current) {
          ws!.send(JSON.stringify({ type: 'subscribe', ticker: s }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as QuoteUpdate | { type: string };
          if (msg.type === 'price_update') {
            const update = msg as QuoteUpdate;
            setQuotes((prev) => {
              const next = new Map(prev);
              next.set(update.ticker, {
                ticker: update.ticker,
                price: update.price,
                change: update.change,
                changePercent: update.changePercent,
                lastUpdated: update.timestamp,
              });
              return next;
            });
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        setConnected(false);
        ws = null;
        reconnectTimer = setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    // Initial subscriptions
    for (const symbol of initialSymbols) {
      subscribedRef.current.add(symbol.toUpperCase());
    }
    connect();

    return () => {
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [initialSymbols.join(',')]);

  return { quotes, connected, subscribe, unsubscribe };
}
