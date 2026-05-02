import { AbstractProvider } from "@openmoney/provider-core";
import { IntrinioEquityQuoteFetcher } from "./models/equity-quote";
import { IntrinioEquityHistoricalFetcher } from "./models/equity-historical";
import { IntrinioEquityProfileFetcher } from "./models/equity-profile";
import { IntrinioEquityScreenerFetcher } from "./models/equity-screener";
import { IntrinioIncomeStatementFetcher } from "./models/income-statement";
import { IntrinioBalanceSheetFetcher } from "./models/balance-sheet";
import { IntrinioFinancialRatiosFetcher } from "./models/financial-ratios";

/**
 * Intrinio provider — financial data platform with real-time quotes, historical prices,
 * company fundamentals, and screening. Requires an API key.
 *
 * Registered fetchers: 7 models covering quotes, historical, fundamentals, and screening.
 */
export const intrinioProvider = new AbstractProvider({
  name: "intrinio",
  description:
    "Intrinio provides real-time equity quotes, historical prices, company profiles, financial statements, ratios, and security screening.",
  website: "https://intrinio.com",
  credentials: ["intrinio_api_key"],
  reprName: "Intrinio",
  instructions:
    "Requires an Intrinio API key. Pass as intrinio_api_key in credentials.",
  fetcherMap: {
    "equity/quote": new IntrinioEquityQuoteFetcher(),
    "equity/historical": new IntrinioEquityHistoricalFetcher(),
    "equity/profile": new IntrinioEquityProfileFetcher(),
    "equity/screener": new IntrinioEquityScreenerFetcher(),
    "equity/income-statement": new IntrinioIncomeStatementFetcher(),
    "equity/balance-sheet": new IntrinioBalanceSheetFetcher(),
    "equity/financial-ratios": new IntrinioFinancialRatiosFetcher(),
  },
});
