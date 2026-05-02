import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { congressFetch } from "../utils/api";

export const CongressNominationsQueryParams = z.object({
  congress: z.coerce.number().int().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(250).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const CongressNominationsData = z.object({
  nominationId: z.string().nullish(),
  number: z.string().nullish(),
  description: z.string().nullish(),
  nomineeName: z.string().nullish(),
  position: z.string().nullish(),
  agency: z.string().nullish(),
  committeeName: z.string().nullish(),
  latestActionDate: z.string().nullish(),
  latestActionText: z.string().nullish(),
  receivedDate: z.string().nullish(),
  status: z.string().nullish(),
  provider: z.literal("congress_gov").default("congress_gov"),
});

export type CongressNominationsData = z.infer<typeof CongressNominationsData>;

/**
 * Fetch presidential nominations from Congress.gov API.
 */
export class CongressNominationsFetcher extends AbstractFetcher<
  typeof CongressNominationsQueryParams,
  typeof CongressNominationsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof CongressNominationsQueryParams>) {
    return {
      congress: params.congress,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    };
  }

  async extractData(
    query: z.infer<typeof CongressNominationsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const congress = query.congress ?? "118";
    return congressFetch<unknown>(`/nomination/${congress}`, {
      limit: String(query.limit ?? 20),
      offset: String(query.offset ?? 0),
    });
  }

  async transformData(raw: unknown) {
    const data = raw as Record<string, unknown>;
    const nominations = (data as any)?.nominations ?? [];

    if (!Array.isArray(nominations) || nominations.length === 0) {
      throw new EmptyDataError("No nominations data available");
    }

    return nominations.map((n: Record<string, unknown>) => {
      const latestAction = (n.latestAction ?? {}) as Record<string, unknown> | undefined;
      const nominee = (n.nominees ?? [])?.[0] as Record<string, unknown> | undefined;

      return CongressNominationsData.parse({
        nominationId: (n.nominationId ?? n.number ?? null) as string | null,
        number: (n.number ?? null) as string | null,
        description: (n.description ?? null) as string | null,
        nomineeName: nominee?.fullName
          ? (nominee.fullName as string)
          : nominee
            ? `${nominee.firstName ?? ""} ${nominee.lastName ?? ""}`.trim() || null
            : null,
        position: (n.position ?? null) as string | null,
        agency: nominee?.agency ?? (n as any).agency ?? null,
        committeeName: (n.committeeName ?? n.committee?.name ?? null) as string | null,
        latestActionDate: latestAction?.actionDate
          ? (latestAction.actionDate as string)
          : null,
        latestActionText: latestAction?.text
          ? (latestAction.text as string)
          : null,
        receivedDate: (n.receivedDate ?? n. ReceivedDate ?? null) as string | null,
        status: latestAction?.text
          ? (latestAction.text as string).substring(0, 200)
          : null,
      });
    });
  }
}
