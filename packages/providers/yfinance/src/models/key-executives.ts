import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchKeyExecutives as apiFetchKeyExecutives } from "../utils/api";

/**
 * Key Executives fetcher.
 * Port of OpenBB's YFinanceKeyExecutivesFetcher.
 */
export const YFinanceKeyExecutivesQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export const YFinanceKeyExecutivesData = z.object({
  title: z.string().nullish(),
  name: z.string().nullish(),
  pay: z.number().nullish(),
  exercisedValue: z.number().nullish(),
  unexercisedValue: z.number().nullish(),
  fiscalYear: z.number().nullish(),
  yearBorn: z.number().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceKeyExecutivesData = z.infer<typeof YFinanceKeyExecutivesData>;

export class YFinanceKeyExecutivesFetcher extends AbstractFetcher<
  typeof YFinanceKeyExecutivesQueryParams,
  typeof YFinanceKeyExecutivesData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceKeyExecutivesQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof YFinanceKeyExecutivesQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const officers = await apiFetchKeyExecutives(query.symbol);
    if (officers.length === 0) throw new EmptyDataError("No executive data found");
    // Remove maxAge field
    for (const o of officers) {
      delete o.maxAge;
    }
    return officers;
  }

  async transformData(raw: unknown) {
    const officers = raw as Array<Record<string, unknown>>;
    return officers.map((o) =>
      YFinanceKeyExecutivesData.parse({
        title: o.title,
        name: o.name,
        pay: extractRawNumber(o.totalPay),
        exercisedValue: extractRawNumber(o.exercisedValue),
        unexercisedValue: extractRawNumber(o.unexercisedValue),
        fiscalYear: o.fiscalYear,
        yearBorn: o.yearBorn,
      }),
    );
  }
}

/**
 * Yahoo returns some numeric fields as objects: { raw: number, fmt: string, longFmt: string }.
 * Extract the `raw` value if present, otherwise return the value as-is.
 */
function extractRawNumber(value: unknown): number | null | undefined {
  if (value === null || value === undefined) return value as null | undefined;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "raw" in value) {
    return (value as Record<string, unknown>).raw as number;
  }
  return null;
}
