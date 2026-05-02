import { AbstractProvider } from "@openmoney/provider-core";
import { SAEarningsTranscriptsFetcher } from "./models/earnings-transcripts";
import { SAAnalystRatingsFetcher } from "./models/analyst-ratings";
import { SADividendHistoryFetcher } from "./models/dividend-history";
import { SAArticleNewsFetcher } from "./models/article-news";

/**
 * Seeking Alpha provider — earnings transcripts, analyst ratings, dividend history, and news.
 * Registration of all supported fetchers via the fetcherMap.
 */
export const seekingAlphaProvider = new AbstractProvider({
  name: "seeking_alpha",
  description:
    "Seeking Alpha provides crowdsourced investment research, earnings call transcripts, analyst ratings, dividend data, and financial news.",
  website: "https://seekingalpha.com",
  credentials: [], // No API key required — scrapes public pages
  reprName: "Seeking Alpha",
  instructions:
    "No API key required. Data is fetched from public Seeking Alpha pages and API endpoints.",
  fetcherMap: {
    "equity/earnings-transcripts": new SAEarningsTranscriptsFetcher(),
    "equity/analyst-ratings": new SAAnalystRatingsFetcher(),
    "equity/dividends": new SADividendHistoryFetcher(),
    "equity/news": new SAArticleNewsFetcher(),
  },
});
