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
  ): Promise<unknown> {
    const officers = await apiFetchKeyExecutives(query.symbol);
    if (officers.length === 0) throw new EmptyDataError("No executive data found");
    // Remove maxAge field
    for (const o of officers) {
      delete o.maxAge;
    }
    return officers;
  }

  async transformData(raw: unknown): Promise<YFinanceKeyExecutivesData[]> {
    const officers = raw as Array<Record<string, unknown>>;
    return officers.map((o) =>
      YFinanceKeyExecutivesData.parse({
        title: o.title,
        name: o.name,
        pay: o.totalPay,
        exercisedValue: o.exercisedValue,
        unexercisedValue: o.unexercisedValue,
        fiscalYear: o.fiscalYear,
        yearBorn: o.yearBorn,
      }),
    );
  }
}
