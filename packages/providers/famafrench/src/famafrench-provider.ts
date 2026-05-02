import { AbstractProvider } from "@openmoney/provider-core";
import { FamaFrenchFactorFetcher } from "./models/factor-data";
import { FamaFrenchFiveFactorFetcher } from "./models/five-factor";
import { FamaFrenchMomentumFetcher } from "./models/momentum-factor";
import { FamaFrenchIndustryPortfolioFetcher } from "./models/industry-portfolios";

/**
 * Fama-French provider — factor model data from Ken French's data library.
 * Provides 3-factor, 5-factor, momentum, and industry portfolio returns.
 * No API key required — data is publicly available.
 */
export const famafrenchProvider = new AbstractProvider({
  name: "famafrench",
  description:
    "Fama-French factor model data including 3-factor, 5-factor, momentum, and industry portfolio returns from Ken French's data library.",
  website: "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html",
  credentials: [],
  reprName: "Fama-French",
  instructions:
    "No API key required. Data is fetched from Ken French's public data library at Dartmouth.",
  fetcherMap: {
    "equity/fama-french-3": new FamaFrenchFactorFetcher(),
    "equity/fama-french-5": new FamaFrenchFiveFactorFetcher(),
    "equity/momentum": new FamaFrenchMomentumFetcher(),
    "equity/industry-portfolios": new FamaFrenchIndustryPortfolioFetcher(),
  },
});
