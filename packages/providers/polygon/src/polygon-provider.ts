import { AbstractProvider } from "@openmoney/provider-core";
import { PolygonEquityQuoteFetcher } from "./models/equity-quote";
import { PolygonEquityHistoricalFetcher } from "./models/equity-historical";
import { PolygonForexHistoricalFetcher } from "./models/forex-historical";
import { PolygonCryptoHistoricalFetcher } from "./models/crypto-historical";
import { PolygonOptionsChainsFetcher } from "./models/options-chains";

/**
 * Polygon.io provider — real-time and historical market data for equities,
 * forex, crypto, and options. Requires an API key.
 *
 * Registered fetchers: 5 models covering quotes, OHLCV, options chains.
 */
export const polygonProvider = new AbstractProvider({
  name: "polygon",
  description:
    "Polygon.io provides real-time and historical market data for equities, forex, cryptocurrencies, and options.",
  website: "https://polygon.io",
  credentials: ["polygon_api_key"],
  reprName: "Polygon.io",
  instructions:
    "Requires a Polygon.io API key. Pass as polygon_api_key in credentials.",
  fetcherMap: {
    "equity/quote": new PolygonEquityQuoteFetcher(),
    "equity/historical": new PolygonEquityHistoricalFetcher(),
    "forex/historical": new PolygonForexHistoricalFetcher(),
    "crypto/historical": new PolygonCryptoHistoricalFetcher(),
    "equity/options": new PolygonOptionsChainsFetcher(),
  },
});
