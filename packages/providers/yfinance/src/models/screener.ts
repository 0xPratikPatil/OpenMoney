import { z } from "zod";

/**
 * Base screener data model — used by all predefined screener fetchers.
 * Port of OpenBB's YFPredefinedScreenerData.
 */
export const YFScreenerData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  price: z.number().nullish(),
  change: z.number().nullish(),
  percentChange: z.number().nullish(),
  volume: z.number().nullish(),
  open: z.number().nullish(),
  high: z.number().nullish(),
  low: z.number().nullish(),
  previousClose: z.number().nullish(),
  ma50: z.number().nullish(),
  ma200: z.number().nullish(),
  yearHigh: z.number().nullish(),
  yearLow: z.number().nullish(),
  marketCap: z.number().nullish(),
  sharesOutstanding: z.number().nullish(),
  bookValue: z.number().nullish(),
  priceToBook: z.number().nullish(),
  epsTtm: z.number().nullish(),
  epsForward: z.number().nullish(),
  peForward: z.number().nullish(),
  dividendYield: z.number().nullish(),
  exchange: z.string().nullish(),
  exchangeTimezone: z.string().nullish(),
  earningsDate: z.string().nullish(),
  currency: z.string().nullish(),
});

export type YFScreenerData = z.infer<typeof YFScreenerData>;

/** Map a raw Yahoo screener quote to our canonical schema */
export function mapScreenerQuote(quote: Record<string, unknown>): Record<string, unknown> {
  return {
    symbol: quote.symbol,
    name: quote.shortName,
    price: quote.regularMarketPrice,
    change: quote.regularMarketChange,
    percentChange: quote.regularMarketChangePercent != null
      ? Number(quote.regularMarketChangePercent) / 100
      : null,
    volume: quote.regularMarketVolume,
    open: quote.regularMarketOpen,
    high: quote.regularMarketDayHigh,
    low: quote.regularMarketDayLow,
    previousClose: quote.regularMarketPreviousClose,
    ma50: quote.fiftyDayAverage,
    ma200: quote.twoHundredDayAverage,
    yearHigh: quote.fiftyTwoWeekHigh,
    yearLow: quote.fiftyTwoWeekLow,
    marketCap: quote.marketCap,
    sharesOutstanding: quote.sharesOutstanding,
    bookValue: quote.bookValue,
    priceToBook: quote.priceToBook,
    epsTtm: quote.epsTrailingTwelveMonths,
    epsForward: quote.epsForward,
    peForward: quote.forwardPE,
    dividendYield: quote.trailingAnnualDividendYield,
    exchange: quote.exchange,
    exchangeTimezone: quote.exchangeTimezoneName,
    earningsDate: quote.earnings_date ?? null,
    currency: quote.currency,
  };
}
