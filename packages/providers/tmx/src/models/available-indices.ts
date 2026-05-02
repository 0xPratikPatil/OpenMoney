import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";

/**
 * Static list of TMX and major Canadian indices.
 * Port of the INDICES dictionary pattern from yfinance/available-indices.
 */
const TMX_INDICES: Record<string, { name: string; symbol: string }> = {
  tsx_comp: { name: "S&P/TSX Composite Index", symbol: "^GSPTSE" },
  tsx_60: { name: "S&P/TSX 60 Index", symbol: "^TX60" },
  tsx_tsx60: { name: "S&P/TSX 60 CAD", symbol: "TXCX" },
  tsx_vent: { name: "S&P/TSX Venture Composite Index", symbol: "^JX" },
  tsx_small: { name: "S&P/TSX SmallCap Index", symbol: "^TXX" },
  tsx_mid: { name: "S&P/TSX MidCap Index", symbol: "^TXM" },
  tsx_div: { name: "S&P/TSX Dividend Aristocrats Index", symbol: "^TSX" },
  tsx_reit: { name: "S&P/TSX Capped REIT Index", symbol: "^TTRE" },
  tsx_gold: { name: "S&P/TSX Global Gold Index", symbol: "^TXGD" },
  tsx_energy: { name: "S&P/TSX Capped Energy Index", symbol: "^TTEN" },
  tsx_fin: { name: "S&P/TSX Capped Financials Index", symbol: "^TTFS" },
  tsx_tech: { name: "S&P/TSX Capped Information Technology Index", symbol: "^TTTK" },
  tsx_hlth: { name: "S&P/TSX Capped Health Care Index", symbol: "^TTHC" },
  tsx_ind: { name: "S&P/TSX Capped Industrials Index", symbol: "^TTIN" },
  tsx_mats: { name: "S&P/TSX Capped Materials Index", symbol: "^TTMT" },
  tsx_util: { name: "S&P/TSX Capped Utilities Index", symbol: "^TTUT" },
  tsx_comm: { name: "S&P/TSX Capped Communication Services Index", symbol: "^TTCM" },
  tsx_cg: { name: "S&P/TSX Consumer Staples Index", symbol: "^TTCS" },
  tsx_cd: { name: "S&P/TSX Consumer Discretionary Index", symbol: "^TTCD" },
  tsx_pref: { name: "S&P/TSX Preferred Share Index", symbol: "^TXPR" },
  tsx_60_hedge: { name: "S&P/TSX 60 Hedged Index", symbol: "^TXHE" },
  tsx_eg: { name: "S&P/TSX Equity Growth Index", symbol: "^TXEG" },
  tsx_inc: { name: "S&P/TSX Equity Income Index", symbol: "^TXIN" },
  tsx_cap: { name: "S&P/TSX Capped Composite Index", symbol: "^TXCA" },
  tsx_60_equal: { name: "S&P/TSX 60 Equal Weight Index", symbol: "^TXEW" },
  tsx_60_etf: { name: "iShares S&P/TSX 60 Index ETF", symbol: "XIU" },
  tsx_comp_etf: { name: "iShares S&P/TSX Composite Index ETF", symbol: "XIC" },
  tsx_vent_etf: { name: "iShares S&P/TSX Venture Index ETF", symbol: "XVL" },
  tsx_div_etf: { name: "iShares S&P/TSX Dividend Aristocrats Index ETF", symbol: "CDZ" },
  tsx_60_mid_etf: { name: "BMO S&P/TSX Mid Cap Index ETF", symbol: "ZMID" },
  tsx_small_etf: { name: "BMO S&P/TSX Small Cap Index ETF", symbol: "ZMS" },
  tsx_reit_etf: { name: "BMO S&P/TSX Capped REIT Index ETF", symbol: "ZRE" },
  tsx_gold_etf: { name: "iShares S&P/TSX Global Gold Index ETF", symbol: "XGD" },
  tsx_energy_etf: { name: "iShares S&P/TSX Capped Energy Index ETF", symbol: "XEG" },
  tsx_fin_etf: { name: "iShares S&P/TSX Capped Financials Index ETF", symbol: "XFN" },
  tsx_tech_etf: { name: "iShares S&P/TSX Capped Information Technology Index ETF", symbol: "XIT" },
};

export const TmxAvailableIndicesQueryParams = z.object({
  // No query params needed — static data
});

export const TmxAvailableIndicesData = z.object({
  code: z.string(),
  symbol: z.string(),
  name: z.string(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxAvailableIndicesData = z.infer<typeof TmxAvailableIndicesData>;

export class TmxAvailableIndicesFetcher extends AbstractFetcher<
  typeof TmxAvailableIndicesQueryParams,
  typeof TmxAvailableIndicesData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof TmxAvailableIndicesQueryParams>) {
    return { ...params };
  }

  async extractData() {
    return Object.entries(TMX_INDICES).map(([code, info]) => ({
      code,
      symbol: info.symbol,
      name: info.name,
    }));
  }

  async transformData(raw: unknown) {
    const indices = raw as Array<Record<string, string>>;
    return indices.map((i) =>
      TmxAvailableIndicesData.parse({
        code: i.code,
        symbol: i.symbol,
        name: i.name,
      }),
    );
  }
}
