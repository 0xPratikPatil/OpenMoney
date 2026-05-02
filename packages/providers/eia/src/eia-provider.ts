import { AbstractProvider } from "@openmoney/provider-core";
import { EIAPetroleumDataFetcher } from "./models/petroleum-data";
import { EIANaturalGasDataFetcher } from "./models/natural-gas-data";
import { EIAElectricityDataFetcher } from "./models/electricity-data";
import { EIACoalDataFetcher } from "./models/coal-data";

/**
 * EIA (Energy Information Administration) provider — US energy data.
 * Registration of all supported fetchers via the fetcherMap.
 */
export const eiaProvider = new AbstractProvider({
  name: "eia",
  description: "U.S. Energy Information Administration provides official energy statistics.",
  website: "https://www.eia.gov",
  credentials: ["eia_api_key"],
  reprName: "EIA",
  instructions:
    "Requires a free EIA API key. Set eia_api_key in credentials.",
  fetcherMap: {
    "eia/petroleum": new EIAPetroleumDataFetcher(),
    "eia/natural-gas": new EIANaturalGasDataFetcher(),
    "eia/electricity": new EIAElectricityDataFetcher(),
    "eia/coal": new EIACoalDataFetcher(),
  },
});
