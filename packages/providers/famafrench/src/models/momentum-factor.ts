import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import {
  fetchDataset,
  FamaFrenchDataset,
  parseFFValue,
} from "../utils/api";

// ── Data Schema ──────────────────────────────────────────
export const FamaFrenchMomentumData = z.object({
  date: z.string(),
  /** Momentum factor return in % (prior 2-12 month winners minus losers) */
  mom: z.number().nullish(),
  provider: z.literal("famafrench").default("famafrench"),
});

export type FamaFrenchMomentumData = z.infer<
  typeof FamaFrenchMomentumData
>;

// ── Query Params Schema ──────────────────────────────────
export const FamaFrenchMomentumQueryParams = z.object({
  /** Frequency: daily or monthly */
  frequency: z.enum(["daily", "monthly"]).default("daily"),
});

export type FamaFrenchMomentumQueryParams = z.infer<
  typeof FamaFrenchMomentumQueryParams
>;

// ── Fetcher ──────────────────────────────────────────────
/**
 * Fetcher for momentum factor data (MOM / prior 2-12 month returns).
 * Source: Fama-French Momentum Factor dataset.
 */
export class FamaFrenchMomentumFetcher extends AbstractFetcher<
  typeof FamaFrenchMomentumQueryParams,
  typeof FamaFrenchMomentumData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof FamaFrenchMomentumQueryParams>,
  ) {
    return {
      frequency: params.frequency ?? "daily",
    };
  }

  async extractData(
    query: z.infer<typeof FamaFrenchMomentumQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const dataset =
      query.frequency === "daily"
        ? FamaFrenchDataset.MOMENTUM_DAILY
        : FamaFrenchDataset.MOMENTUM_MONTHLY;

    return fetchDataset(dataset, query.frequency);
  }

  async transformData(
    raw: unknown,
  ) {
    const rows = raw as Array<Record<string, unknown>>;
    if (!rows || rows.length === 0) {
      throw new EmptyDataError(
        "No momentum factor data returned",
      );
    }

    return rows.map((row) =>
      FamaFrenchMomentumData.parse({
        date: row.date,
        mom: parseFFValue(row["Mom"] ?? row["MOM"] ?? row.mom),
      }),
    );
  }
}
