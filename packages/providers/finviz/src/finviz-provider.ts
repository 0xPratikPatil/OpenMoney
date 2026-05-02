import { AbstractProvider } from "@openmoney/provider-core";
import { FinvizEquityProfileFetcher } from "./models/equity-profile";
import { FinvizEquityScreenerFetcher } from "./models/equity-screener";
import { FinvizCompareGroupsFetcher } from "./models/compare-groups";
import { FinvizKeyMetricsFetcher } from "./models/key-metrics";
import { FinvizPricePerformanceFetcher } from "./models/price-performance";
import { FinvizPriceTargetFetcher } from "./models/price-target";

/**
 * FinViz provider — free stock data via web scraping.
 * No API key required. Data includes fundamentals, screener, and price targets.
 */
export const finvizProvider = new AbstractProvider({
  name: "finviz",
  description:
    "FinViz provides free stock data including company profiles, financial metrics, " +
    "screener results, price targets, and performance data via web scraping.",
  website: "https://finviz.com",
  credentials: [],
  reprName: "FinViz",
  instructions:
    "No API key required. FinViz data is obtained by scraping public HTML pages.",
  fetcherMap: {
    "equity/profile": new FinvizEquityProfileFetcher(),
    "equity/screener": new FinvizEquityScreenerFetcher(),
    "equity/key-metrics": new FinvizKeyMetricsFetcher(),
    "equity/price-performance": new FinvizPricePerformanceFetcher(),
    "equity/price-target": new FinvizPriceTargetFetcher(),
    "equity/compare-groups": new FinvizCompareGroupsFetcher(),
  },
});
