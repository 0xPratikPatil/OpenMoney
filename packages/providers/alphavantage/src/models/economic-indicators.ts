import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { avFetch, parseNumber, parseString } from "../utils/api";

export const AVEconomicIndicatorsData = z.object({
  date: z.string(),
  value: z.number().nullish(),
  indicator: z.string(),
  provider: z.literal("alphavantage").default("alphavantage"),
});

export type AVEconomicIndicatorsData = z.infer<typeof AVEconomicIndicatorsData>;

export const AVIndicatorEnum = z.enum([
  "REAL_GDP",
  "CPI",
  "UNEMPLOYMENT",
  "FEDERAL_FUNDS_RATE",
]);

export const AVEconomicIndicatorsQueryParams = z.object({
  indicator: AVIndicatorEnum,
});

export type AVEconomicIndicatorsQueryParams = z.infer<typeof AVEconomicIndicatorsQueryParams>;

export class AVEconomicIndicatorsFetcher extends AbstractFetcher<
  typeof AVEconomicIndicatorsQueryParams,
  typeof AVEconomicIndicatorsData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof AVEconomicIndicatorsQueryParams>,
  ): Promise<z.input<typeof AVEconomicIndicatorsQueryParams>> {
    return { indicator: params.indicator };
  }

  async extractData(
    query: z.infer<typeof AVEconomicIndicatorsQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials["alphavantage_api_key"] ?? "";
    return avFetch(query.indicator, apiKey);
  }

  async transformData(
    raw: unknown,
  ): Promise<AVEconomicIndicatorsData[]> {
    const data = raw as Record<string, unknown>;
    const rows = data.data as Array<Record<string, unknown>> | undefined;
    if (!rows || rows.length === 0) throw new EmptyDataError("No economic indicator data returned");

    const indicator = parseString(data.name) ?? "UNKNOWN";

    return rows.map((row) =>
      AVEconomicIndicatorsData.parse({
        date: row.date,
        value: parseNumber(row.value),
        indicator,
      }),
    );
  }
}
