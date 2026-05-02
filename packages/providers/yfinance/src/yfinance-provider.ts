import { AbstractProvider } from "@openmoney/provider-core";
import { YFinanceEquityQuoteFetcher } from "./models/equity-quote";
import { YFinanceEquityHistoricalFetcher } from "./models/equity-historical";
import { YFinanceEquityProfileFetcher } from "./models/equity-profile";
import { YFinanceKeyMetricsFetcher } from "./models/key-metrics";
import { YFinanceIncomeStatementFetcher } from "./models/income-statement";
import { YFinanceBalanceSheetFetcher } from "./models/balance-sheet";
import { YFinanceCashFlowFetcher } from "./models/cash-flow";
import { YFinanceCompanyNewsFetcher } from "./models/company-news";
import { YFinanceOptionsChainsFetcher } from "./models/options-chains";
import { YFinanceHistoricalDividendsFetcher } from "./models/historical-dividends";
import { YFActiveFetcher } from "./models/active";
import { YFAggressiveSmallCapsFetcher } from "./models/aggressive-small-caps";
import { YFinanceAvailableIndicesFetcher } from "./models/available-indices";
import { YFinanceEquityScreenerFetcher } from "./models/equity-screener";
import { YFinanceEtfInfoFetcher } from "./models/etf-info";
import { YFinanceFuturesCurveFetcher } from "./models/futures-curve";
import { YFinanceFuturesHistoricalFetcher } from "./models/futures-historical";
import { YFGainersFetcher } from "./models/gainers";
import { YFGrowthTechEquitiesFetcher } from "./models/growth-tech-equities";
import { YFinanceIndexHistoricalFetcher } from "./models/index-historical";
import { YFinanceKeyExecutivesFetcher } from "./models/key-executives";
import { YFLosersFetcher } from "./models/losers";
import { YFinancePriceTargetConsensusFetcher } from "./models/price-target-consensus";
import { YFinanceShareStatisticsFetcher } from "./models/share-statistics";
import { YFUndervaluedGrowthEquitiesFetcher } from "./models/undervalued-growth-equities";
import { YFUndervaluedLargeCapsFetcher } from "./models/undervalued-large-caps";
import { YFinanceCryptoHistoricalFetcher } from "./models/crypto-historical";
import { YFinanceCurrencyHistoricalFetcher } from "./models/currency-historical";

/**
 * Yahoo Finance provider — free market data for equities, ETFs, forex, crypto.
 * Registration of all supported fetchers via the fetcherMap.
 * This is equivalent to OpenBB's provider registration in __init__.py.
 *
 * Registered fetchers: 29 models across equities, ETFs, indices, futures, forex, and crypto.
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
    // ---- Equity ----
    "equity/quote": new YFinanceEquityQuoteFetcher(),
    "equity/historical": new YFinanceEquityHistoricalFetcher(),
    "equity/profile": new YFinanceEquityProfileFetcher(),
    "equity/key-metrics": new YFinanceKeyMetricsFetcher(),
    "equity/income-statement": new YFinanceIncomeStatementFetcher(),
    "equity/balance-sheet": new YFinanceBalanceSheetFetcher(),
    "equity/cash-flow": new YFinanceCashFlowFetcher(),
    "equity/news": new YFinanceCompanyNewsFetcher(),
    "equity/options": new YFinanceOptionsChainsFetcher(),
    "equity/dividends": new YFinanceHistoricalDividendsFetcher(),
    "equity/screener": new YFinanceEquityScreenerFetcher(),
    // Predefined screeners
    "equity/active": new YFActiveFetcher(),
    "equity/gainers": new YFGainersFetcher(),
    "equity/losers": new YFLosersFetcher(),
    "equity/aggressive-small-caps": new YFAggressiveSmallCapsFetcher(),
    "equity/growth-tech": new YFGrowthTechEquitiesFetcher(),
    "equity/undervalued-growth": new YFUndervaluedGrowthEquitiesFetcher(),
    "equity/undervalued-large-caps": new YFUndervaluedLargeCapsFetcher(),
    // Analyst data
    "equity/price-target": new YFinancePriceTargetConsensusFetcher(),
    "equity/share-statistics": new YFinanceShareStatisticsFetcher(),
    "equity/key-executives": new YFinanceKeyExecutivesFetcher(),
    // ---- ETF ----
    "etf/historical": new YFinanceEquityHistoricalFetcher(),
    "etf/info": new YFinanceEtfInfoFetcher(),
    // ---- Index ----
    "index/historical": new YFinanceIndexHistoricalFetcher(),
    "index/available": new YFinanceAvailableIndicesFetcher(),
    // ---- Futures ----
    "futures/historical": new YFinanceFuturesHistoricalFetcher(),
    "futures/curve": new YFinanceFuturesCurveFetcher(),
    // ---- Forex / Crypto ----
    "forex/historical": new YFinanceCurrencyHistoricalFetcher(),
    "crypto/historical": new YFinanceCryptoHistoricalFetcher(),
  },
});
