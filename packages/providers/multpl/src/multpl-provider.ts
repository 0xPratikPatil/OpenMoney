import { AbstractProvider } from "@openmoney/provider-core";
import { MultplShillerPeFetcher } from "./models/shiller-pe";
import { MultplMarketCapToGdpFetcher } from "./models/market-cap-to-gdp";
import { MultplDividendYieldFetcher } from "./models/s-p-dividend-yield";
import { MultplEarningsFetcher } from "./models/s-p-earnings";
import { MultplTreasuryRateFetcher } from "./models/treasury-rates";

/**
 * Multpl provider — US market valuation and economic data from multpl.com.
 * Provides Shiller P/E, Buffett Indicator, S&P 500 dividend yield,
 * S&P 500 earnings, and Treasury rates.
 * No API key required — data is publicly available.
 */
export const multplProvider = new AbstractProvider({
  name: "multpl",
  description:
    "Multpl provides US stock market valuation metrics including Shiller P/E (CAPE), total market cap to GDP (Buffett Indicator), S&P 500 dividend yield, S&P 500 earnings, and Treasury rates.",
  website: "https://www.multpl.com",
  credentials: [],
  reprName: "Multpl",
  instructions:
    "No API key required. Data is fetched from public multpl.com tables.",
  fetcherMap: {
    "market/shiller-pe": new MultplShillerPeFetcher(),
    "market/market-cap-to-gdp": new MultplMarketCapToGdpFetcher(),
    "market/s-p-dividend-yield": new MultplDividendYieldFetcher(),
    "market/s-p-earnings": new MultplEarningsFetcher(),
    "market/treasury-rates": new MultplTreasuryRateFetcher(),
  },
});
