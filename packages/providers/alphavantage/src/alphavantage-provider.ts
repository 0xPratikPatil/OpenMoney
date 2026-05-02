import { AbstractProvider } from "@openmoney/provider-core";
import { AVEquityQuoteFetcher } from "./models/equity-quote";
import { AVEquityHistoricalFetcher } from "./models/equity-historical";
import { AVEquityProfileFetcher } from "./models/equity-profile";
import { AVForexQuoteFetcher, AVForexHistoricalFetcher } from "./models/forex";
import { AVCryptoHistoricalFetcher } from "./models/crypto";
import { AVEconomicIndicatorsFetcher } from "./models/economic-indicators";
import { AVSectorPerformanceFetcher } from "./models/sector-performance";

export const alphavantageProvider = new AbstractProvider({
  name: "alphavantage",
  description:
    "Alpha Vantage provides free real-time and historical financial market data for equities, forex, crypto, and economic indicators.",
  website: "https://www.alphavantage.co",
  credentials: ["alphavantage_api_key"],
  reprName: "Alpha Vantage",
  instructions:
    "Requires a free API key from https://www.alphavantage.co/support/#api-key. Rate limited to 5 calls per minute on the free tier.",
  fetcherMap: {
    "equity/quote": new AVEquityQuoteFetcher(),
    "equity/historical": new AVEquityHistoricalFetcher(),
    "equity/profile": new AVEquityProfileFetcher(),
    "forex/quote": new AVForexQuoteFetcher(),
    "forex/historical": new AVForexHistoricalFetcher(),
    "crypto/historical": new AVCryptoHistoricalFetcher(),
    "economic/indicators": new AVEconomicIndicatorsFetcher(),
    "sector/performance": new AVSectorPerformanceFetcher(),
  },
});
