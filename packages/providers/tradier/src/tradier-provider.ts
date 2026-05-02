import { AbstractProvider } from "@openmoney/provider-core";
import { TradierEquityQuoteFetcher } from "./models/equity-quote";
import { TradierEquityHistoricalFetcher } from "./models/equity-historical";
import { TradierOptionsChainsFetcher } from "./models/options-chains";

/**
 * Tradier provider — real-time market data, historical prices, and options chains.
 * Requires an API key passed as Bearer token.
 *
 * Registered fetchers: 3 models covering quotes, historical, and options.
 */
export const tradierProvider = new AbstractProvider({
  name: "tradier",
  description:
    "Tradier provides real-time equity quotes, historical data, and options chains via its REST API.",
  website: "https://documentation.tradier.com",
  credentials: ["tradier_api_key"],
  reprName: "Tradier",
  instructions:
    "Requires a Tradier API key. Pass as tradier_api_key in credentials. Uses Bearer token authentication.",
  fetcherMap: {
    "equity/quote": new TradierEquityQuoteFetcher(),
    "equity/historical": new TradierEquityHistoricalFetcher(),
    "equity/options": new TradierOptionsChainsFetcher(),
  },
});
