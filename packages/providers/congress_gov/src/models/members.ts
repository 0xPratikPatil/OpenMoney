import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { congressFetch } from "../utils/api";

export const CongressMembersQueryParams = z.object({
  chamber: z.enum(["house", "senate"]).optional(),
  congress: z.coerce.number().int().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(250).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const CongressMembersData = z.object({
  memberId: z.string().nullish(),
  fullName: z.string().nullish(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  party: z.string().nullish(),
  state: z.string().nullish(),
  district: z.number().nullish(),
  chamber: z.string().nullish(),
  chamberCode: z.string().nullish(),
  memberUrl: z.string().nullish(),
  provider: z.literal("congress_gov").default("congress_gov"),
});

export type CongressMembersData = z.infer<typeof CongressMembersData>;

/**
 * Fetch members of Congress from Congress.gov API.
 */
export class CongressMembersFetcher extends AbstractFetcher<
  typeof CongressMembersQueryParams,
  typeof CongressMembersData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof CongressMembersQueryParams>) {
    return {
      chamber: params.chamber,
      congress: params.congress,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    };
  }

  async extractData(
    query: z.infer<typeof CongressMembersQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const congress = query.congress ?? "118";
    const path = query.chamber
      ? `/member/${congress}/${query.chamber}`
      : `/member/${congress}`;

    return congressFetch<unknown>(path, {
      limit: String(query.limit ?? 20),
      offset: String(query.offset ?? 0),
    });
  }

  async transformData(raw: unknown): Promise<CongressMembersData[]> {
    const data = raw as Record<string, unknown>;
    const members = (data as any)?.members ?? [];

    if (!Array.isArray(members) || members.length === 0) {
      throw new EmptyDataError("No members data available");
    }

    return members.map((m: Record<string, unknown>) =>
      CongressMembersData.parse({
        memberId: (m.bioguideId ?? null) as string | null,
        fullName: (m.fullName ?? null) as string | null,
        firstName: (m.firstName ?? null) as string | null,
        lastName: (m.lastName ?? null) as string | null,
        party: (m.party ?? null) as string | null,
        state: (m.state ?? null) as string | null,
        district: (m.district ?? null) as number | null,
        chamber: (m.chamber ?? null) as string | null,
        chamberCode: null,
        memberUrl: m.bioguideId ? `https://bioguide.congress.gov/search/bio/${m.bioguideId}` : null,
      }),
    );
  }
}
