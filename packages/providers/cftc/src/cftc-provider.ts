import { AbstractProvider } from "@openmoney/provider-core";
import { CFTCotReportFetcher } from "./models/cot-report";
import { CFTCotLegacyFetcher } from "./models/cot-legacy";
import { CFTCotFinancialFetcher } from "./models/cot-financial";

/**
 * CFTC (Commodity Futures Trading Commission) provider.
 * Provides weekly Commitments of Traders (COT) reports showing
 * the aggregate positions of market participants in US futures markets.
 *
 * All data is publicly available with no API key required.
 *
 * Registered fetchers: 3 models.
 */
export const cftcProvider = new AbstractProvider({
  name: "cftc",
  description:
    "Commodity Futures Trading Commission provides weekly Commitments of Traders (COT) reports showing long, short, and spread positions of different trader categories in US futures and options markets.",
  website: "https://www.cftc.gov/dea/newcot/index.htm",
  credentials: [],
  reprName: "CFTC",
  instructions:
    "No API key required. Data is fetched from public CSV files published weekly by the CFTC. Updated every Friday at 3:30 PM ET.",
  fetcherMap: {
    "cot_report": new CFTCotReportFetcher(),
    "cot_legacy": new CFTCotLegacyFetcher(),
    "cot_financial": new CFTCotFinancialFetcher(),
  },
});
