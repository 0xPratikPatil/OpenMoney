import { AbstractProvider } from "@openmoney/provider-core";
import { FMPEquityQuoteFetcher } from "./models/equity-quote";
import { FMPEquityHistoricalFetcher } from "./models/equity-historical";
import { FMPEquityProfileFetcher } from "./models/equity-profile";
import { FMPIncomeStatementFetcher } from "./models/income-statement";
import { FMPBalanceSheetFetcher } from "./models/balance-sheet";
import { FMPCashFlowFetcher } from "./models/cash-flow";
import { FMPFinancialRatiosFetcher } from "./models/financial-ratios";
import { FMPKeyMetricsFetcher } from "./models/key-metrics";

export const fmpProvider = new AbstractProvider({
  name: "fmp",
  description:
    "Financial Modeling Prep provides real-time and historical market data, financial statements, and key metrics for equities.",
  website: "https://financialmodelingprep.com",
  credentials: ["api_key"],
  reprName: "Financial Modeling Prep",
  instructions:
    "Requires a valid FMP API key passed as the fmp_api_key credential.",
  fetcherMap: {
    "equity/quote": new FMPEquityQuoteFetcher(),
    "equity/historical": new FMPEquityHistoricalFetcher(),
    "equity/profile": new FMPEquityProfileFetcher(),
    "equity/income-statement": new FMPIncomeStatementFetcher(),
    "equity/balance-sheet": new FMPBalanceSheetFetcher(),
    "equity/cash-flow": new FMPCashFlowFetcher(),
    "equity/financial-ratios": new FMPFinancialRatiosFetcher(),
    "equity/key-metrics": new FMPKeyMetricsFetcher(),
  },
});
