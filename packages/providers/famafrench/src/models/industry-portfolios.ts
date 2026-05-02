import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import {
  fetchDataset,
  FamaFrenchDataset,
  parseFFValue,
} from "../utils/api";

// ── Data Schema ──────────────────────────────────────────
export const FamaFrenchIndustryPortfolioData = z.object({
  date: z.string(),
  /** Returns by industry. Key is industry name, value is return in %. */
  industries: z.record(z.number()).nullish(),
  /** Number of industries in this dataset */
  industryCount: z.number().nullish(),
  provider: z.literal("famafrench").default("famafrench"),
});

export type FamaFrenchIndustryPortfolioData = z.infer<
  typeof FamaFrenchIndustryPortfolioData
>;

// ── Query Params Schema ──────────────────────────────────
export const FamaFrenchIndustryPortfolioQueryParams = z.object({
  /** Number of industry portfolios (10, 12, 17, 30, or 49) */
  count: z
    .union([z.literal(10), z.literal(12), z.literal(17), z.literal(30), z.literal(49)])
    .default(10),
  /** Frequency: daily or monthly */
  frequency: z.enum(["daily", "monthly"]).default("daily"),
});

export type FamaFrenchIndustryPortfolioQueryParams = z.infer<
  typeof FamaFrenchIndustryPortfolioQueryParams
>;

/** Map industry count to FamaFrenchDataset enum */
function datasetForIndustry(
  count: 10 | 12 | 17 | 30 | 49,
  frequency: "daily" | "monthly",
): FamaFrenchDataset {
  const map: Record<number, Record<string, FamaFrenchDataset>> = {
    10: {
      daily: FamaFrenchDataset.INDUSTRIES_10_DAILY,
      monthly: FamaFrenchDataset.INDUSTRIES_10_MONTHLY,
    },
    12: {
      daily: FamaFrenchDataset.INDUSTRIES_12_DAILY,
      monthly: FamaFrenchDataset.INDUSTRIES_12_MONTHLY,
    },
    17: {
      daily: FamaFrenchDataset.INDUSTRIES_17_DAILY,
      monthly: FamaFrenchDataset.INDUSTRIES_17_MONTHLY,
    },
    30: {
      daily: FamaFrenchDataset.INDUSTRIES_30_DAILY,
      monthly: FamaFrenchDataset.INDUSTRIES_30_MONTHLY,
    },
    49: {
      daily: FamaFrenchDataset.INDUSTRIES_49_DAILY,
      monthly: FamaFrenchDataset.INDUSTRIES_49_MONTHLY,
    },
  };
  return map[count][frequency];
}

// ── Fetcher ──────────────────────────────────────────────
/**
 * Fetcher for Fama-French industry portfolio returns.
 * Supports 10, 12, 17, 30, and 49 industry classifications.
 */
export class FamaFrenchIndustryPortfolioFetcher extends AbstractFetcher<
  typeof FamaFrenchIndustryPortfolioQueryParams,
  typeof FamaFrenchIndustryPortfolioData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof FamaFrenchIndustryPortfolioQueryParams>,
  ): Promise<z.input<typeof FamaFrenchIndustryPortfolioQueryParams>> {
    return {
      count: params.count ?? 10,
      frequency: params.frequency ?? "daily",
    };
  }

  async extractData(
    query: z.infer<typeof FamaFrenchIndustryPortfolioQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const dataset = datasetForIndustry(query.count as any, query.frequency);
    return fetchDataset(dataset, query.frequency);
  }

  async transformData(
    raw: unknown,
  ): Promise<FamaFrenchIndustryPortfolioData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    if (!rows || rows.length === 0) {
      throw new EmptyDataError(
        "No industry portfolio data returned",
      );
    }

    return rows.map((row) => {
      const industries: Record<string, number> = {};
      let industryCount = 0;

      for (const [key, value] of Object.entries(row)) {
        if (key === "date") continue;
        const parsed = parseFFValue(value);
        if (parsed !== null) {
          industries[key] = parsed;
          industryCount++;
        }
      }

      return FamaFrenchIndustryPortfolioData.parse({
        date: row.date,
        industries: Object.keys(industries).length > 0 ? industries : null,
        industryCount: industryCount > 0 ? industryCount : null,
      });
    });
  }
}
