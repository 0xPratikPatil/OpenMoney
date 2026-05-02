import { AbstractProvider } from "@openmoney/provider-core";
import { IMFDotDataFetcher } from "./models/dot-data";
import { IMFIfsDataFetcher } from "./models/ifs-data";
import { IMFFiscalDataFetcher } from "./models/fiscal-data";
import { IMFWeoDataFetcher } from "./models/weo-data";

/**
 * IMF (International Monetary Fund) provider — public financial statistics.
 * Registration of all supported fetchers via the fetcherMap.
 */
export const imfProvider = new AbstractProvider({
  name: "imf",
  description: "International Monetary Fund provides global financial statistics and economic data.",
  website: "https://www.imf.org",
  credentials: [],
  reprName: "IMF",
  instructions:
    "No API key required. IMF data is publicly accessible via SDMX REST endpoints.",
  fetcherMap: {
    "imf/dot": new IMFDotDataFetcher(),
    "imf/ifs": new IMFIfsDataFetcher(),
    "imf/fiscal": new IMFFiscalDataFetcher(),
    "imf/weo": new IMFWeoDataFetcher(),
  },
});
