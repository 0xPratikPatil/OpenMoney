import { AbstractProvider } from "@openmoney/provider-core";
import { EconDBCountryDataFetcher } from "./models/country-data";
import { EconDBCountryListFetcher } from "./models/country-list";
import { EconDBTimeSeriesFetcher } from "./models/time-series";
import { EconDBIndicatorSearchFetcher } from "./models/indicator-search";

/**
 * EconDB provider — economic data API for country indicators and time-series data.
 * Registration of all supported fetchers via the fetcherMap.
 */
export const econdbProvider = new AbstractProvider({
  name: "econdb",
  description: "EconDB provides economic data and indicators for countries worldwide.",
  website: "https://www.econdb.com",
  credentials: ["econdb_api_key"],
  reprName: "EconDB",
  instructions:
    "Requires an EconDB API key. Set econdb_api_key in credentials.",
  fetcherMap: {
    "econdb/country-data": new EconDBCountryDataFetcher(),
    "econdb/country-list": new EconDBCountryListFetcher(),
    "econdb/time-series": new EconDBTimeSeriesFetcher(),
    "econdb/indicator-search": new EconDBIndicatorSearchFetcher(),
  },
});
