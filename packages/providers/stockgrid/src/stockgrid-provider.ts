import { AbstractProvider } from "@openmoney/provider-core";
import { StockgridDarkPoolFetcher } from "./models/dark-pool-data";
import { StockgridShortVolumeFetcher } from "./models/short-volume";
import { StockgridOrderFlowFetcher } from "./models/order-flow";

/**
 * Stockgrid provider — dark pool, short volume, and order flow data.
 * Provides insight into institutional and non-exchange trading activity.
 * No API key required — data is publicly available on stockgrid.io.
 */
export const stockgridProvider = new AbstractProvider({
  name: "stockgrid",
  description:
    "Stockgrid provides dark pool trading data, short volume statistics, and order flow analysis for US equities.",
  website: "https://stockgrid.io",
  credentials: [],
  reprName: "Stockgrid",
  instructions:
    "No API key required. Data is fetched from public stockgrid.io pages.",
  fetcherMap: {
    "equity/dark-pool": new StockgridDarkPoolFetcher(),
    "equity/short-volume": new StockgridShortVolumeFetcher(),
    "equity/order-flow": new StockgridOrderFlowFetcher(),
  },
});
