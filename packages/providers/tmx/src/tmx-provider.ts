import { AbstractProvider } from "@openmoney/provider-core";
import { TmxEquityQuoteFetcher } from "./models/equity-quote";
import { TmxEquityHistoricalFetcher } from "./models/equity-historical";
import { TmxEquityProfileFetcher } from "./models/equity-profile";
import { TmxEquitySearchFetcher } from "./models/equity-search";
import { TmxCompanyFilingsFetcher } from "./models/company-filings";
import { TmxCompanyNewsFetcher } from "./models/company-news";
import { TmxInsiderTradingFetcher } from "./models/insider-trading";
import { TmxHistoricalDividendsFetcher } from "./models/historical-dividends";
import { TmxPriceTargetConsensusFetcher } from "./models/price-target-consensus";
import { TmxAvailableIndicesFetcher } from "./models/available-indices";
import { TmxIndexConstituentsFetcher } from "./models/index-constituents";
import { TmxIndexSectorsFetcher } from "./models/index-sectors";
import { TmxIndexSnapshotsFetcher } from "./models/index-snapshots";
import { TmxEtfInfoFetcher } from "./models/etf-info";
import { TmxEtfHoldingsFetcher } from "./models/etf-holdings";
import { TmxEtfCountriesFetcher } from "./models/etf-countries";
import { TmxEtfSectorsFetcher } from "./models/etf-sectors";
import { TmxEtfSearchFetcher } from "./models/etf-search";
import { TmxCalendarEarningsFetcher } from "./models/calendar-earnings";
import { TmxOptionsChainsFetcher } from "./models/options-chains";
import { TmxBondPricesFetcher } from "./models/bond-prices";
import { TmxTreasuryPricesFetcher } from "./models/treasury-prices";
import { TmxGainersFetcher } from "./models/gainers";

/**
 * TMX (Toronto Stock Exchange) provider — free Canadian market data.
 * No API key required. Provides equities, ETFs, indices, options, bonds,
 * treasuries, and market data for TSX and TSXV exchanges.
 *
 * Registered fetchers: 23 models across equities, ETFs, indices, options,
 * fixed income, and market analytics.
 */
export const tmxProvider = new AbstractProvider({
  name: "tmx",
  description:
    "TMX Group provides free Canadian market data for equities, ETFs, indices, options, bonds, and treasuries listed on TSX, TSXV, and Montreal Exchange.",
  website: "https://www.tmx.com",
  credentials: [], // No API key needed — uses public endpoints
  reprName: "TMX Group",
  instructions:
    "No API key required. TMX data is fetched from public endpoints including app-money.tmx.com, tsx.com, and m-x.ca.",
  fetcherMap: {
    // ---- Equity ----
    "equity/quote": new TmxEquityQuoteFetcher(),
    "equity/historical": new TmxEquityHistoricalFetcher(),
    "equity/profile": new TmxEquityProfileFetcher(),
    "equity/search": new TmxEquitySearchFetcher(),
    "equity/filings": new TmxCompanyFilingsFetcher(),
    "equity/news": new TmxCompanyNewsFetcher(),
    "equity/insider-trading": new TmxInsiderTradingFetcher(),
    "equity/dividends": new TmxHistoricalDividendsFetcher(),
    "equity/price-target": new TmxPriceTargetConsensusFetcher(),
    // ---- ETF ----
    "etf/info": new TmxEtfInfoFetcher(),
    "etf/holdings": new TmxEtfHoldingsFetcher(),
    "etf/countries": new TmxEtfCountriesFetcher(),
    "etf/sectors": new TmxEtfSectorsFetcher(),
    "etf/search": new TmxEtfSearchFetcher(),
    // ---- Index ----
    "index/available": new TmxAvailableIndicesFetcher(),
    "index/constituents": new TmxIndexConstituentsFetcher(),
    "index/sectors": new TmxIndexSectorsFetcher(),
    "index/snapshots": new TmxIndexSnapshotsFetcher(),
    // ---- Calendar ----
    "calendar/earnings": new TmxCalendarEarningsFetcher(),
    // ---- Options ----
    "equity/options": new TmxOptionsChainsFetcher(),
    // ---- Fixed Income ----
    "bond/prices": new TmxBondPricesFetcher(),
    "treasury/prices": new TmxTreasuryPricesFetcher(),
    // ---- Market ----
    "equity/gainers": new TmxGainersFetcher(),
  },
});
