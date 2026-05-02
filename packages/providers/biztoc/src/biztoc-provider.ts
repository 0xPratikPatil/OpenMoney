import { AbstractProvider } from "@openmoney/provider-core";
import { BizTocNewsSearchFetcher } from "./models/news-search";
import { BizTocNewsLatestFetcher } from "./models/news-latest";
import { BizTocNewsTickerFetcher } from "./models/news-ticker";

/**
 * BizToc provider — business news search, latest headlines, and ticker-specific news.
 * Registration of all supported fetchers via the fetcherMap.
 */
export const biztocProvider = new AbstractProvider({
  name: "biztoc",
  description:
    "BizToc provides AI-curated business news search and discovery across thousands of sources.",
  website: "https://biztoc.com",
  credentials: [], // No API key required
  reprName: "BizToc",
  instructions:
    "No API key required. BizToc data is fetched from public AI endpoints.",
  fetcherMap: {
    "news/search": new BizTocNewsSearchFetcher(),
    "news/latest": new BizTocNewsLatestFetcher(),
    "news/ticker": new BizTocNewsTickerFetcher(),
  },
});
