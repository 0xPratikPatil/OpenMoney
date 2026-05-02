import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import {
  fetchDataset,
  FamaFrenchDataset,
  parseFFValue,
} from "../utils/api";

// ── Data Schema ──────────────────────────────────────────
export const FamaFrenchFiveFactorData = z.object({
  date: z.string(),
  /** Market excess return (Mkt-RF) in % */
  mktMinusRf: z.number().nullish(),
  /** Small Minus Big factor in % */
  smb: z.number().nullish(),
  /** High Minus Low factor in % */
  hml: z.number().nullish(),
  /** Robust Minus Weak (profitability) factor in % */
  rmw: z.number().nullish(),
  /** Conservative Minus Aggressive (investment) factor in % */
  cma: z.number().nullish(),
  /** Risk-free rate in % */
  rf: z.number().nullish(),
  provider: z.literal("famafrench").default("famafrench"),
});

export type FamaFrenchFiveFactorData = z.infer<
  typeof FamaFrenchFiveFactorData
>;

// ── Query Params Schema ──────────────────────────────────
export const FamaFrenchFiveFactorQueryParams = z.object({
  /** Frequency: daily or monthly */
  frequency: z.enum(["daily", "monthly"]).default("daily"),
});

export type FamaFrenchFiveFactorQueryParams = z.infer<
  typeof FamaFrenchFiveFactorQueryParams
>;

// ── Fetcher ──────────────────────────────────────────────
/**
 * Fetcher for Fama-French 5-factor model data.
 * Returns Mkt-RF, SMB, HML, RMW, CMA, and RF factors.
 */
export class FamaFrenchFiveFactorFetcher extends AbstractFetcher<
  typeof FamaFrenchFiveFactorQueryParams,
  typeof FamaFrenchFiveFactorData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof FamaFrenchFiveFactorQueryParams>,
  ) {
    return {
      frequency: params.frequency ?? "daily",
    };
  }

  async extractData(
    query: z.infer<typeof FamaFrenchFiveFactorQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const dataset =
      query.frequency === "daily"
        ? FamaFrenchDataset.FACTORS_5_DAILY
        : FamaFrenchDataset.FACTORS_5_MONTHLY;

    return fetchDataset(dataset, query.frequency);
  }

  async transformData(
    raw: unknown,
  ) {
    const rows = raw as Array<Record<string, unknown>>;
    if (!rows || rows.length === 0) {
      throw new EmptyDataError(
        "No Fama-French 5-factor data returned",
      );
    }

    return rows.map((row) =>
      FamaFrenchFiveFactorData.parse({
        date: row.date,
        mktMinusRf: parseFFValue(row["Mkt-RF"] ?? row.mktrf),
        smb: parseFFValue(row["SMB"] ?? row.smb),
        hml: parseFFValue(row["HML"] ?? row.hml),
        rmw: parseFFValue(row["RMW"] ?? row.rmw),
        cma: parseFFValue(row["CMA"] ?? row.cma),
        rf: parseFFValue(row["RF"] ?? row.rf),
      }),
    );
  }
}
