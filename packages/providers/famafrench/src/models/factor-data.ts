import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import {
  fetchDataset,
  FamaFrenchDataset,
  parseFFValue,
} from "../utils/api";

// ── Data Schema ──────────────────────────────────────────
export const FamaFrenchFactorData = z.object({
  date: z.string(),
  /** Market excess return (Mkt-RF) in % */
  mktMinusRf: z.number().nullish(),
  /** Small Minus Big factor in % */
  smb: z.number().nullish(),
  /** High Minus Low factor in % */
  hml: z.number().nullish(),
  /** Risk-free rate in % */
  rf: z.number().nullish(),
  provider: z.literal("famafrench").default("famafrench"),
});

export type FamaFrenchFactorData = z.infer<typeof FamaFrenchFactorData>;

// ── Query Params Schema ──────────────────────────────────
export const FamaFrenchFactorQueryParams = z.object({
  /** Frequency: daily or monthly */
  frequency: z.enum(["daily", "monthly"]).default("daily"),
});

export type FamaFrenchFactorQueryParams = z.infer<
  typeof FamaFrenchFactorQueryParams
>;

// ── Fetcher ──────────────────────────────────────────────
/**
 * Fetcher for Fama-French 3-factor model data.
 * Returns Mkt-RF, SMB, HML, and RF for the requested frequency.
 */
export class FamaFrenchFactorFetcher extends AbstractFetcher<
  typeof FamaFrenchFactorQueryParams,
  typeof FamaFrenchFactorData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof FamaFrenchFactorQueryParams>,
  ) {
    return {
      frequency: params.frequency ?? "daily",
    };
  }

  async extractData(
    query: z.infer<typeof FamaFrenchFactorQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const dataset =
      query.frequency === "daily"
        ? FamaFrenchDataset.FACTORS_3_DAILY
        : FamaFrenchDataset.FACTORS_3_MONTHLY;

    return fetchDataset(dataset, query.frequency);
  }

  async transformData(
    raw: unknown,
  ) {
    const rows = raw as Array<Record<string, unknown>>;
    if (!rows || rows.length === 0) {
      throw new EmptyDataError("No Fama-French factor data returned");
    }

    return rows.map((row) =>
      FamaFrenchFactorData.parse({
        date: row.date,
        mktMinusRf: parseFFValue(row["Mkt-RF"] ?? row.mktrf),
        smb: parseFFValue(row["SMB"] ?? row.smb),
        hml: parseFFValue(row["HML"] ?? row.hml),
        rf: parseFFValue(row["RF"] ?? row.rf),
      }),
    );
  }
}
