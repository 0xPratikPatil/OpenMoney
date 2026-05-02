import { AbstractProvider } from "@openmoney/provider-core";
import { DeribitFuturesInfoFetcher } from "./models/futures-info";
import { DeribitFuturesInstrumentsFetcher } from "./models/futures-instruments";
import { DeribitFuturesHistoricalFetcher } from "./models/futures-historical";
import { DeribitFuturesCurveFetcher } from "./models/futures-curve";
import { DeribitOptionsChainFetcher } from "./models/options-chains";

/**
 * Deribit provider — free crypto derivatives data.
 * No API key required for public endpoints. Covers futures and options on BTC, ETH, SOL, and USDC.
 */
export const deribitProvider = new AbstractProvider({
  name: "deribit",
  description:
    "Deribit provides free crypto derivatives data including futures and options " +
    "on BTC, ETH, SOL, and USDC. No API key required for public endpoints.",
  website: "https://www.deribit.com",
  credentials: [],
  reprName: "Deribit",
  instructions:
    "No API key required. Deribit public API provides crypto futures and options market data.",
  fetcherMap: {
    // ---- Futures ----
    "futures/info": new DeribitFuturesInfoFetcher(),
    "futures/instruments": new DeribitFuturesInstrumentsFetcher(),
    "futures/historical": new DeribitFuturesHistoricalFetcher(),
    "futures/curve": new DeribitFuturesCurveFetcher(),
    // ---- Options ----
    "futures/options": new DeribitOptionsChainFetcher(),
  },
});
