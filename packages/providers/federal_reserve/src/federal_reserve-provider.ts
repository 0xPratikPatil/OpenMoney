import { AbstractProvider } from "@openmoney/provider-core";
import { FRBH8DataFetcher } from "./models/h8-data";
import { FRBH15DataFetcher } from "./models/h15-data";
import { FRBH41DataFetcher } from "./models/h41-data";
import { FRBG17DataFetcher } from "./models/g17-data";

/**
 * Federal Reserve Board provider — US monetary and financial data.
 * Provides H.8 (bank assets/liabilities), H.15 (interest rates),
 * H.4.1 (reserve balances), and G.17 (industrial production) releases.
 *
 * All data is publicly available. No API key required.
 *
 * Registered fetchers: 4 models.
 */
export const federalReserveProvider = new AbstractProvider({
  name: "federal_reserve",
  description:
    "Federal Reserve Board provides US monetary and financial data including the H.8 (Assets and Liabilities of Commercial Banks), H.15 (Selected Interest Rates), H.4.1 (Factors Affecting Reserve Balances), and G.17 (Industrial Production and Capacity Utilization).",
  website: "https://www.federalreserve.gov/datadownload/",
  credentials: [],
  reprName: "Federal Reserve",
  instructions:
    "No API key required. Data is from the Federal Reserve Board's public Data Download API. Supports the H.8, H.15, H.4.1, and G.17 statistical releases.",
  fetcherMap: {
    "h8_data": new FRBH8DataFetcher(),
    "h15_data": new FRBH15DataFetcher(),
    "h41_data": new FRBH41DataFetcher(),
    "g17_data": new FRBG17DataFetcher(),
  },
});
