import { AbstractProvider } from "@openmoney/provider-core";
import { CboeEquityQuoteFetcher } from "./models/equity-quote";
import { CboeEquityHistoricalFetcher } from "./models/equity-historical";
import { CboeEquitySearchFetcher } from "./models/equity-search";
import { CboeAvailableIndicesFetcher } from "./models/available-indices";
import { CboeIndexConstituentsFetcher } from "./models/index-constituents";
import { CboeIndexHistoricalFetcher } from "./models/index-historical";
import { CboeIndexSearchFetcher } from "./models/index-search";
import { CboeIndexSnapshotsFetcher } from "./models/index-snapshots";
import { CboeFuturesCurveFetcher } from "./models/futures-curve";
import { CboeOptionsChainFetcher } from "./models/options-chains";

/**
 * CBOE provider — free delayed market data for equities, indices, futures, and options.
 * No API key required. Data is delayed by approximately 15-20 minutes.
 */
export const cboeProvider = new AbstractProvider({
  name: "cboe",
  description:
    "CBOE provides free delayed market data for equities, indices, futures, and options. " +
    "Data is typically delayed by 15-20 minutes. No API key required.",
  website: "https://www.cboe.com",
  credentials: [],
  reprName: "CBOE",
  instructions:
    "No API key required. CBOE data is fetched from public delayed-quotes endpoints.",
  fetcherMap: {
    // ---- Equity ----
    "equity/quote": new CboeEquityQuoteFetcher(),
    "equity/historical": new CboeEquityHistoricalFetcher(),
    "equity/search": new CboeEquitySearchFetcher(),
    // ---- Index ----
    "index/available": new CboeAvailableIndicesFetcher(),
    "index/constituents": new CboeIndexConstituentsFetcher(),
    "index/historical": new CboeIndexHistoricalFetcher(),
    "index/search": new CboeIndexSearchFetcher(),
    "index/snapshots": new CboeIndexSnapshotsFetcher(),
    // ---- Futures ----
    "futures/curve": new CboeFuturesCurveFetcher(),
    // ---- Options ----
    "equity/options": new CboeOptionsChainFetcher(),
  },
});
