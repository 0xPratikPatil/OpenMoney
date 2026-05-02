import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { parseNumber } from "../utils/api";

export const FinvizCompareGroupsData = z.object({
  group: z.string(),
  performance: z.number().nullish(),
  weekPerformance: z.number().nullish(),
  monthPerformance: z.number().nullish(),
  provider: z.literal("finviz").default("finviz"),
});

export type FinvizCompareGroupsData = z.infer<typeof FinvizCompareGroupsData>;

export const FinvizCompareGroupsQueryParams = z.object({
  groupBy: z.enum(["sector", "industry", "exchange"]).default("sector"),
});

export type FinvizCompareGroupsQueryParams = z.infer<typeof FinvizCompareGroupsQueryParams>;

/**
 * Fetcher for group/sector comparison from FinViz.
 * Uses screener data grouped by sector/industry.
 */
export class FinvizCompareGroupsFetcher extends AbstractFetcher<
  typeof FinvizCompareGroupsQueryParams,
  typeof FinvizCompareGroupsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof FinvizCompareGroupsQueryParams>,
  ) {
    return { groupBy: params.groupBy ?? "sector" };
  }

  async extractData(
    _query: z.infer<typeof FinvizCompareGroupsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    // Use the groups page for sector performance
    const url = "https://finviz.com/groups.ashx?g=sector&v=210&o=name";
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) throw new Error(`FinViz groups error: ${response.status}`);

    const html = await response.text();
    return html;
  }

  async transformData(
    raw: unknown,
  ) {
    const html = raw as string;

    // Parse the groups table
    const rows: FinvizCompareGroupsData[] = [];

    // Extract table rows from the groups page
    const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
    let rowMatch: RegExpExecArray | null;

    while ((rowMatch = rowRegex.exec(html)) !== null) {
      const rowHtml = rowMatch[1]!;

      // Extract cells
      const cells: string[] = [];
      const cellRegex = /<td[^>]*>(.*?)<\/td>/gs;
      let cellMatch: RegExpExecArray | null;

      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        cells.push(stripHtml(cellMatch[1]!));
      }

      if (cells.length >= 2) {
        const name = cells[0]!;
        const perfStr = cells[1]!;
        const perf = parseNumber(perfStr);

        if (name && name !== "Name") {
          rows.push(
            FinvizCompareGroupsData.parse({
              group: name,
              performance: perf,
              weekPerformance: null,
              monthPerformance: null,
            }),
          );
        }
      }
    }

    if (rows.length === 0) throw new EmptyDataError("No group comparison data found");
    return rows;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
