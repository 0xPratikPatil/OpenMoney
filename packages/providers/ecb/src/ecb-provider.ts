import { AbstractProvider } from "@openmoney/provider-core";
import { EcbCurrencyReferenceRatesFetcher } from "./models/currency-reference-rates";
import { EcbYieldCurveFetcher } from "./models/yield-curve";
import { EcbBalanceOfPaymentsFetcher } from "./models/balance-of-payments";

/**
 * ECB (European Central Bank) provider — free euro area economic data.
 * No API key required. Data includes exchange rates, yield curves, and balance of payments.
 */
export const ecbProvider = new AbstractProvider({
  name: "ecb",
  description:
    "ECB provides free euro area economic and financial data including exchange rates, " +
    "yield curves, and balance of payments statistics. No API key required.",
  website: "https://www.ecb.europa.eu/stats",
  credentials: [],
  reprName: "ECB",
  instructions:
    "No API key required. ECB data is fetched from the SDMX JSON API at data-api.ecb.europa.eu.",
  fetcherMap: {
    "forex/rates": new EcbCurrencyReferenceRatesFetcher(),
    "yield/curve": new EcbYieldCurveFetcher(),
    "economy/balance-of-payments": new EcbBalanceOfPaymentsFetcher(),
  },
});
