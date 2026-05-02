import { AbstractProvider } from "@openmoney/provider-core";
import { TiingoEquityQuoteFetcher } from "./models/equity-quote";
import { TiingoEquityHistoricalFetcher } from "./models/equity-historical";
import { TiingoCryptoHistoricalFetcher } from "./models/crypto-historical";

/**
 * Tiingo provider — real-time IEX quotes and historical daily data
 * for equities and cryptocurrencies. Requires an API key.
 *
 * Registered fetchers: 3 models covering quotes and historical data.
 */
export const tiingoProvider = new AbstractProvider({
  name: "tiingo",
  description:
    "Tiingo provides real-time IEX stock quotes, historical daily prices, and cryptocurrency data.",
  website: "https://www.tiingo.com",
  credentials: ["tiingo_api_key"],
  reprName: "Tiingo",
  instructions:
    "Requires a Tiingo API key. Pass as tiingo_api_key in credentials.",
  fetcherMap: {
    "equity/quote": new TiingoEquityQuoteFetcher(),
    "equity/historical": new TiingoEquityHistoricalFetcher(),
    "crypto/historical": new TiingoCryptoHistoricalFetcher(),
  },
});
