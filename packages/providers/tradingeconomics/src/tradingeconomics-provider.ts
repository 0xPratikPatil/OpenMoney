import { AbstractProvider } from "@openmoney/provider-core";
import { TECountryIndicatorsFetcher } from "./models/country-indicators";
import { TECalendarFetcher } from "./models/calendar";
import { TEForecastFetcher } from "./models/forecast";
import { TEMarketsDataFetcher } from "./models/markets-data";

/**
 * Trading Economics provider — economic indicators, calendar, forecasts, and market data.
 * Registration of all supported fetchers via the fetcherMap.
 */
export const tradingeconomicsProvider = new AbstractProvider({
  name: "tradingeconomics",
  description: "Trading Economics provides economic indicators, forecasts, calendar events, and market data.",
  website: "https://tradingeconomics.com",
  credentials: ["tradingeconomics_api_key"],
  reprName: "Trading Economics",
  instructions:
    "Requires a Trading Economics API key. Set tradingeconomics_api_key in credentials.",
  fetcherMap: {
    "tradingeconomics/country-indicators": new TECountryIndicatorsFetcher(),
    "tradingeconomics/calendar": new TECalendarFetcher(),
    "tradingeconomics/forecast": new TEForecastFetcher(),
    "tradingeconomics/markets": new TEMarketsDataFetcher(),
  },
});
