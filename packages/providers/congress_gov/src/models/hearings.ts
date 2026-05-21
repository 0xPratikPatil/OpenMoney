import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { congressFetch } from "../utils/api";

export const CongressHearingsQueryParams = z.object({
  congress: z.coerce.number().int().min(1).max(120).optional(),
  chamber: z.enum(["house", "senate", "joint"]).optional(),
  limit: z.coerce.number().int().min(1).max(250).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const CongressHearingsData = z.object({
  hearingId: z.string().nullish(),
  title: z.string().nullish(),
  chamber: z.string().nullish(),
  committeeName: z.string().nullish(),
  date: z.string().nullish(),
  time: z.string().nullish(),
  location: z.string().nullish(),
  topic: z.string().nullish(),
  provider: z.literal("congress_gov").default("congress_gov"),
});

export type CongressHearingsData = z.infer<typeof CongressHearingsData>;

/**
 * Fetch committee hearings from Congress.gov API.
 */
export class CongressHearingsFetcher extends AbstractFetcher<
  typeof CongressHearingsQueryParams,
  typeof CongressHearingsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof CongressHearingsQueryParams>) {
    return {
      congress: params.congress,
      chamber: params.chamber,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    };
  }

  async extractData(
    query: z.infer<typeof CongressHearingsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const congress = query.congress ?? "118";
    const path = `/committee/${congress}${query.chamber ? `/${query.chamber}` : ""}/hearings`;

    return congressFetch<unknown>(path, {
      limit: String(query.limit ?? 20),
      offset: String(query.offset ?? 0),
    });
  }

  async transformData(raw: unknown) {
    const data = raw as Record<string, unknown>;
    const hearings = (data as any)?.hearings ?? [];

    if (!Array.isArray(hearings) || hearings.length === 0) {
      throw new EmptyDataError("No hearings data available");
    }

    return hearings.map((h: Record<string, unknown>) =>
      CongressHearingsData.parse({
        hearingId: (h.hearingNumber ?? null) as string | null,
        title: (h.title ?? null) as string | null,
        chamber: (h.chamber ?? null) as string | null,
        committeeName: (h.committeeName ?? (h.committee as Record<string, unknown>)?.name ?? null) as string | null,
        date: (h.date ?? h.hearingDate ?? null) as string | null,
        time: (h.time ?? null) as string | null,
        location: (h.location ?? null) as string | null,
        topic: (h.topic ?? null) as string | null,
      }),
    );
  }
}
