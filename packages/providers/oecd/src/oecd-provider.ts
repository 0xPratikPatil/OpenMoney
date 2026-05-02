import { AbstractProvider } from "@openmoney/provider-core";
import { OECDEconomicOutlookFetcher } from "./models/economic-outlook";
import { OECDGdpDataFetcher } from "./models/gdp-data";
import { OECDEmploymentDataFetcher } from "./models/employment-data";
import { OECDInflationDataFetcher } from "./models/inflation-data";

/**
 * OECD (Organisation for Economic Co-operation and Development) provider.
 * Registration of all supported fetchers via the fetcherMap.
 */
export const oecdProvider = new AbstractProvider({
  name: "oecd",
  description: "OECD provides economic data and statistics for member countries.",
  website: "https://www.oecd.org",
  credentials: [],
  reprName: "OECD",
  instructions:
    "No API key required. OECD data is publicly accessible via SDMX REST API.",
  fetcherMap: {
    "oecd/economic-outlook": new OECDEconomicOutlookFetcher(),
    "oecd/gdp": new OECDGdpDataFetcher(),
    "oecd/employment": new OECDEmploymentDataFetcher(),
    "oecd/inflation": new OECDInflationDataFetcher(),
  },
});
