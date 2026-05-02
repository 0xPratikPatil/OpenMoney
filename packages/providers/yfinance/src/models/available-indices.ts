import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";

/**
 * Available Indices — returns the static INDICES dictionary.
 * Port of OpenBB's YFinanceAvailableIndicesFetcher.
 */

// Port of the INDICES dictionary from OpenBB reference
const INDICES: Record<string, { name: string; ticker: string }> = {
  sp500: { name: "S&P 500 Index", ticker: "^GSPC" },
  spx: { name: "S&P 500 Index", ticker: "^SPX" },
  nasdaq: { name: "Nasdaq Composite Index", ticker: "^IXIC" },
  nasdaq100: { name: "NASDAQ 100", ticker: "^NDX" },
  dow_dji: { name: "Dow Jones Industrial Average Index", ticker: "^DJI" },
  nyse: { name: "NYSE Composite Index", ticker: "^NYA" },
  amex: { name: "NYSE-AMEX Composite Index", ticker: "^XAX" },
  russell1000: { name: "Russell 1000 Index", ticker: "^RUI" },
  russell2000: { name: "Russell 2000 Index", ticker: "^RUT" },
  russell3000: { name: "Russell 3000 Index", ticker: "^RUA" },
  w5000: { name: "Wilshire 5000", ticker: "^W5000" },
  cboe_vix: { name: "CBOE S&P 500 Volatility Index", ticker: "^VIX" },
  ftse100: { name: "FTSE Global 100 Index (GBP)", ticker: "^FTSE" },
  de_dax40: { name: "DAX Performance Index (EUR)", ticker: "^GDAXI" },
  fr_cac40: { name: "CAC 40 PR Index (EUR)", ticker: "^FCHI" },
  jp_n225: { name: "Nikkei 255 Index (JPY)", ticker: "^N225" },
  hk_hsi: { name: "Hang Seng Index (HKD)", ticker: "^HSI" },
  cn_csi300: { name: "China CSI 300 Index (CNY)", ticker: "000300.SS" },
  in_bse: { name: "S&P Bombay SENSEX (INR)", ticker: "^BSESN" },
  in_nse50: { name: "NSE Nifty 50 Index (INR)", ticker: "^NSEI" },
  br_bvsp: { name: "IBOVESPA Sao Paulo Brazil Index (BRL)", ticker: "^BVSP" },
  kr_kospi: { name: "KOSPI Composite Index (KRW)", ticker: "^KS11" },
  tw_twii: { name: "TSEC Weighted Index (TWD)", ticker: "^TWII" },
  au_asx200: { name: "S&P/ASX 200 Index (AUD)", ticker: "^AXJO" },
  ca_tsx: { name: "TSX Composite Index (CAD)", ticker: "^GSPTSE" },
  mx_ipc: { name: "IPC Mexico Index (MXN)", ticker: "^MXX" },
  dxy: { name: "US Dollar Index", ticker: "DX-Y.NYB" },
};

export const YFinanceAvailableIndicesQueryParams = z.object({
  // No query params needed — static data
});

export const YFinanceAvailableIndicesData = z.object({
  code: z.string(),
  symbol: z.string(),
  name: z.string(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceAvailableIndicesData = z.infer<typeof YFinanceAvailableIndicesData>;

export class YFinanceAvailableIndicesFetcher extends AbstractFetcher<
  typeof YFinanceAvailableIndicesQueryParams,
  typeof YFinanceAvailableIndicesData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceAvailableIndicesQueryParams>) {
    return { ...params };
  }

  async extractData(): Promise<unknown> {
    return Object.entries(INDICES).map(([code, info]) => ({
      code,
      symbol: info.ticker,
      name: info.name,
    }));
  }

  async transformData(raw: unknown): Promise<YFinanceAvailableIndicesData[]> {
    const indices = raw as Array<Record<string, string>>;
    return indices.map((i) =>
      YFinanceAvailableIndicesData.parse({
        code: i.code,
        symbol: i.symbol,
        name: i.name,
      }),
    );
  }
}
