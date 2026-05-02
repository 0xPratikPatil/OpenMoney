import { AbstractProvider } from "@openmoney/provider-core";
import { WSJMarketNewsFetcher } from "./models/market-news";
import { WSJMarketDataFetcher } from "./models/market-data";
import { WSJSectorPerformanceFetcher } from "./models/sector-performance";

/**
 * WSJ (Wall Street Journal) provider — market news, market data snapshots, and sector performance.
 * Registration of all supported fetchers via the fetcherMap.
 */
export const wsjProvider = new AbstractProvider({
  name: "wsj",
  description:
    "Wall Street Journal provides financial market news, market data, and sector performance information.",
  website: "https://www.wsj.com",
  credentials: [], // No API key required for public market data
  reprName: "Wall Street Journal",
  instructions:
    "No API key required. Data is fetched from public WSJ market data endpoints.",
  fetcherMap: {
    "news/market": new WSJMarketNewsFetcher(),
    "market-data/snapshot": new WSJMarketDataFetcher(),
    "market-data/sectors": new WSJSectorPerformanceFetcher(),
  },
});
