import { AbstractProvider } from "@openmoney/provider-core";
import { BenzingaCompanyNewsFetcher } from "./models/company-news";
import { BenzingaAnalystRatingsFetcher } from "./models/analyst-ratings";
import { BenzingaEarningsCalendarFetcher } from "./models/earnings-calendar";
import { BenzingaIposFetcher } from "./models/ipos";

/**
 * Benzinga provider — financial news, analyst ratings, earnings calendar, and IPO data.
 * Registration of all supported fetchers via the fetcherMap.
 */
export const benzingaProvider = new AbstractProvider({
  name: "benzinga",
  description:
    "Benzinga provides financial news, analyst ratings, earnings calendars, and IPO data for US equities.",
  website: "https://www.benzinga.com",
  credentials: ["benzinga_api_key"],
  reprName: "Benzinga",
  instructions:
    "Requires a Benzinga API key. Obtain one at https://www.benzinga.com/api.",
  fetcherMap: {
    "equity/news": new BenzingaCompanyNewsFetcher(),
    "equity/analyst-ratings": new BenzingaAnalystRatingsFetcher(),
    "equity/earnings-calendar": new BenzingaEarningsCalendarFetcher(),
    "equity/ipos": new BenzingaIposFetcher(),
  },
});
