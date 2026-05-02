import { AbstractProvider } from "@openmoney/provider-core";
import { FINRAShortInterestFetcher } from "./models/short-interest";
import { FINRATradeReportingFetcher } from "./models/trade-reporting";
import { FINRAOtcDataFetcher } from "./models/otc-data";

/**
 * FINRA (Financial Industry Regulatory Authority) provider.
 * Provides short interest data, trade reporting facility (TRF) data,
 * and OTC transparency data for equity securities.
 *
 * All data is publicly available. No API key required.
 *
 * Registered fetchers: 3 models.
 */
export const finraProvider = new AbstractProvider({
  name: "finra",
  description:
    "FINRA provides market transparency data including short sale volume, trade reporting facility (TRF) data, and over-the-counter (OTC) equity trading statistics.",
  website: "https://www.finra.org/finra-data",
  credentials: [],
  reprName: "FINRA",
  instructions:
    "No API key required. FINRA publishes daily market data including short volume, OTC trade volumes, and trade reporting statistics.",
  fetcherMap: {
    "short_interest": new FINRAShortInterestFetcher(),
    "trade_reporting": new FINRATradeReportingFetcher(),
    "otc_data": new FINRAOtcDataFetcher(),
  },
});
