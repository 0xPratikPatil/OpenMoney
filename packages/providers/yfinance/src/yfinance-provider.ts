import { AbstractProvider } from "@openmoney/provider-core";
import { YFinanceEquityQuoteFetcher } from "./models/equity-quote";
import { YFinanceEquityHistoricalFetcher } from "./models/equity-historical";
import { YFinanceIncomeStatementFetcher } from "./models/income-statement";
import { YFinanceBalanceSheetFetcher } from "./models/balance-sheet";
import { YFinanceCashFlowFetcher } from "./models/cash-flow";
import { YFinanceCompanyNewsFetcher } from "./models/company-news";
import { YFinanceOptionsChainsFetcher } from "./models/options-chains";
import { YFinanceHistoricalDividendsFetcher } from "./models/historical-dividends";

/**
 * Yahoo Finance provider — free market data for equities, ETFs, forex, crypto.
 * Registration of all supported fetchers via the fetcherMap.
 * This is equivalent to OpenBB's provider registration in __init__.py.
 */
export const yfinanceProvider = new AbstractProvider({
  name: "yfinance",
  description:
    "Yahoo Finance provides free real-time and historical market data for equities, ETFs, forex, and cryptocurrencies.",
  website: "https://finance.yahoo.com",
  credentials: [], // No API key needed — uses public endpoints
  reprName: "Yahoo Finance",
  instructions:
    "No API key required. Yahoo Finance data is fetched from public endpoints.",
  fetcherMap: {
    "equity/quote": new YFinanceEquityQuoteFetcher(),
    "equity/historical": new YFinanceEquityHistoricalFetcher(),
    "equity/income-statement": new YFinanceIncomeStatementFetcher(),
    "equity/balance-sheet": new YFinanceBalanceSheetFetcher(),
    "equity/cash-flow": new YFinanceCashFlowFetcher(),
    "equity/news": new YFinanceCompanyNewsFetcher(),
    "equity/options": new YFinanceOptionsChainsFetcher(),
    "equity/dividends": new YFinanceHistoricalDividendsFetcher(),
    "etf/historical": new YFinanceEquityHistoricalFetcher(),
  },
});
