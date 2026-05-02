import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { congressFetch } from "../utils/api";

export const CongressBillsQueryParams = z.object({
  congress: z.coerce.number().int().min(1).max(120).optional(),
  billType: z.enum(["hr", "s", "hjres", "sjres", "hconres", "sconres", "hres", "sres"]).optional(),
  limit: z.coerce.number().int().min(1).max(250).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const CongressBillsData = z.object({
  billId: z.string().nullish(),
  billNumber: z.string().nullish(),
  billType: z.string().nullish(),
  congress: z.number().nullish(),
  title: z.string().nullish(),
  originChamber: z.string().nullish(),
  latestActionDate: z.string().nullish(),
  latestActionText: z.string().nullish(),
  introducedDate: z.string().nullish(),
  sponsor: z.string().nullish(),
  url: z.string().nullish(),
  provider: z.literal("congress_gov").default("congress_gov"),
});

export type CongressBillsData = z.infer<typeof CongressBillsData>;

/**
 * Fetch congressional bills from Congress.gov API.
 */
export class CongressBillsFetcher extends AbstractFetcher<
  typeof CongressBillsQueryParams,
  typeof CongressBillsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof CongressBillsQueryParams>) {
    return {
      congress: params.congress,
      billType: params.billType,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    };
  }

  async extractData(
    query: z.infer<typeof CongressBillsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const path = query.billType
      ? `/bill/${query.congress ?? "118"}/${query.billType}`
      : `/bill/${query.congress ?? "118"}`;

    return congressFetch<unknown>(path, {
      limit: String(query.limit ?? 20),
      offset: String(query.offset ?? 0),
    });
  }

  async transformData(raw: unknown) {
    const data = raw as Record<string, unknown>;
    const bills = (data as any)?.bills ?? [];

    if (!Array.isArray(bills) || bills.length === 0) {
      throw new EmptyDataError("No bills data available");
    }

    return bills.map((b: Record<string, unknown>) => {
      const latestAction = (b.latestAction ?? {}) as Record<string, unknown> | undefined;
      return CongressBillsData.parse({
        billId: (b.number ?? null) as string | null,
        billNumber: (b.number ?? null) as string | null,
        billType: (b.type ?? null) as string | null,
        congress: (b.congress ?? null) as number | null,
        title: (b.title ?? b.shortTitle ?? null) as string | null,
        originChamber: (b.originChamber ?? null) as string | null,
        latestActionDate: latestAction?.actionDate
          ? (latestAction.actionDate as string)
          : null,
        latestActionText: latestAction?.text
          ? (latestAction.text as string)
          : null,
        introducedDate: (b.introducedDate ?? null) as string | null,
        sponsor: (b.sponsor?.fullName ?? b.sponsor?.firstName && `${b.sponsor.firstName} ${b.sponsor.lastName}` ?? null) as string | null,
        url: b.url ? (`https://api.congress.gov/v3${b.url}`) : null,
      });
    });
  }
}
