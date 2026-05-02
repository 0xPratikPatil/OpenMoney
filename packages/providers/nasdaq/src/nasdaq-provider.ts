import { AbstractProvider } from "@openmoney/provider-core";
import { NasdaqCalendarDividendFetcher } from "./models/calendar-dividend";
import { NasdaqCalendarEarningsFetcher } from "./models/calendar-earnings";
import { NasdaqCalendarIpoFetcher } from "./models/calendar-ipo";
import { NasdaqCompanyFilingsFetcher } from "./models/company-filings";
import { NasdaqEconomicCalendarFetcher } from "./models/economic-calendar";
import { NasdaqEquityScreenerFetcher } from "./models/equity-screener";
import { NasdaqEquitySearchFetcher } from "./models/equity-search";
import { NasdaqHistoricalDividendsFetcher } from "./models/historical-dividends";
import { NasdaqTopRetailFetcher } from "./models/top-retail";

/**
 * Nasdaq Data Link (Quandl) provider — market data, fundamentals, economics.
 * API key is optional for some endpoints. Set in credentials["nasdaq_api_key"].
 *
 * Registered fetchers: 9 models.
 */
export const nasdaqProvider = new AbstractProvider({
  name: "nasdaq",
  description:
    "Nasdaq Data Link (formerly Quandl) provides financial, economic, and alternatives data including dividend calendars, earnings calendars, IPOs, company filings, economic indicators, and retail trading activity.",
  website: "https://data.nasdaq.com",
  credentials: ["nasdaq_api_key"],
  reprName: "Nasdaq Data Link",
  instructions:
    "API key is optional for some public endpoints. Set nasdaq_api_key in credentials for full access.",
  fetcherMap: {
    "calendar_dividend": new NasdaqCalendarDividendFetcher(),
    "calendar_earnings": new NasdaqCalendarEarningsFetcher(),
    "calendar_ipo": new NasdaqCalendarIpoFetcher(),
    "company_filings": new NasdaqCompanyFilingsFetcher(),
    "economic_calendar": new NasdaqEconomicCalendarFetcher(),
    "equity_screener": new NasdaqEquityScreenerFetcher(),
    "equity_search": new NasdaqEquitySearchFetcher(),
    "historical_dividends": new NasdaqHistoricalDividendsFetcher(),
    "top_retail": new NasdaqTopRetailFetcher(),
  },
});
