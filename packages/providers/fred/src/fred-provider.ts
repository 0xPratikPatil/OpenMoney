import { AbstractProvider } from "@openmoney/provider-core";
import { FredSeriesFetcher } from "./models/fred-series";
import { FredSearchFetcher } from "./models/fred-search";
import { FredTreasuryRatesFetcher } from "./models/treasury-rates";
import { FredYieldCurveFetcher } from "./models/yield-curve";
import { FredEconomicDataFetcher } from "./models/economic-data";

/**
 * FRED (Federal Reserve Economic Data) provider — free macroeconomic and
 * financial data from the Federal Reserve Bank of St. Louis.
 * Registration of all supported fetchers via the fetcherMap.
 */
export const fredProvider = new AbstractProvider({
  name: "fred",
  description: "Federal Reserve Economic Data",
  website: "https://fred.stlouisfed.org/",
  credentials: ["fred_api_key"],
  reprName: "FRED",
  instructions:
    "Requires a FRED API key (free). Set fred_api_key in credentials.",
  fetcherMap: {
    "fred/series": new FredSeriesFetcher(),
    "fred/search": new FredSearchFetcher(),
    "fred/treasury-rates": new FredTreasuryRatesFetcher(),
    "fred/yield-curve": new FredYieldCurveFetcher(),
    "fred/economic-data": new FredEconomicDataFetcher(),
  },
});
