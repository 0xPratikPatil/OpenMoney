import { AbstractProvider } from "@openmoney/provider-core";
import { BLSCpiFetcher } from "./models/cpi";
import { BLSEmploymentFetcher } from "./models/employment";
import { BLSppiFetcher } from "./models/ppi";
import { BLSUnemploymentFetcher } from "./models/unemployment";

/**
 * BLS (Bureau of Labor Statistics) provider — US economic indicators.
 * Provides CPI, employment/payroll, PPI, and unemployment rate data.
 *
 * API key (free) recommended for production use; daily limit applies without one.
 *
 * Registered fetchers: 4 models.
 */
export const blsProvider = new AbstractProvider({
  name: "bls",
  description:
    "Bureau of Labor Statistics provides US economic data including the Consumer Price Index (CPI), employment and payroll figures (CES), Producer Price Index (PPI), and unemployment rates (CPS/LNS).",
  website: "https://www.bls.gov/developers/",
  credentials: ["bls_api_key"],
  reprName: "BLS",
  instructions:
    "Free API key available at https://data.bls.gov/registration/. Without a key, daily limit is 25 queries. Each request can include up to 50 series IDs.",
  fetcherMap: {
    "cpi": new BLSCpiFetcher(),
    "employment": new BLSEmploymentFetcher(),
    "ppi": new BLSppiFetcher(),
    "unemployment": new BLSUnemploymentFetcher(),
  },
});
