import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchEcbData, parseObservations } from "../utils/api";

export const EcbBalanceOfPaymentsData = z.object({
  date: z.string(),
  item: z.string(),
  value: z.number().nullish(),
  provider: z.literal("ecb").default("ecb"),
});

export type EcbBalanceOfPaymentsData = z.infer<typeof EcbBalanceOfPaymentsData>;

export const EcbBalanceOfPaymentsQueryParams = z.object({
  // No params — returns main BOP items
});

export type EcbBalanceOfPaymentsQueryParams = z.infer<typeof EcbBalanceOfPaymentsQueryParams>;

/**
 * Known BOP item descriptions based on ECB BP6 dataflow.
 */
const BOP_ITEMS: Record<string, string> = {
  "CA": "Current account",
  "CA_GOOD": "Goods",
  "CA_SERV": "Services",
  "CA_PRIM": "Primary income",
  "CA_SEC": "Secondary income",
  "CA_GOOD_CR": "Goods credit (exports)",
  "CA_GOOD_DB": "Goods debit (imports)",
  "CA_SERV_CR": "Services credit (exports)",
  "CA_SERV_DB": "Services debit (imports)",
  "FA": "Financial account",
  "FA_F": "Direct investment",
  "FA_P": "Portfolio investment",
  "FA_O": "Other investment",
  "FA_R": "Reserve assets",
};

/**
 * Fetcher for ECB balance of payments data.
 * Uses dataflow BP6 (BPM6 balance of payments).
 */
export class EcbBalanceOfPaymentsFetcher extends AbstractFetcher<
  typeof EcbBalanceOfPaymentsQueryParams,
  typeof EcbBalanceOfPaymentsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof EcbBalanceOfPaymentsQueryParams>,
  ) {
    return { ...params };
  }

  async extractData(
    _query: z.infer<typeof EcbBalanceOfPaymentsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    // Fetch euro area balance of payments — main items
    const dataflow = "BP6/M.N.I8.W1.S1.S1.T.N.FA.F._Z._Z._Z.XDC._Z.S.N";
    const json = await fetchEcbData(dataflow, {
      startPeriod: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    });
    return json;
  }

  async transformData(
    raw: unknown,
  ) {
    const parsed = parseObservations(raw as any);
    if (parsed.length === 0) throw new EmptyDataError("No balance of payments data returned");

    // Group by BOP item and get latest for each
    const byItem = new Map<string, Array<Record<string, string | number | null>>>();

    for (const record of parsed) {
      const itemCode = (record.BP6_ITEM ?? record.bp6_item ?? record.item ?? "") as string;
      if (!itemCode) continue;
      if (!byItem.has(itemCode)) {
        byItem.set(itemCode, []);
      }
      byItem.get(itemCode)!.push(record);
    }

    const results: EcbBalanceOfPaymentsData[] = [];

    for (const [itemCode, records] of byItem) {
      const latest = records[records.length - 1];
      if (!latest) continue;

      const itemName = BOP_ITEMS[itemCode] ?? itemCode;

      results.push(
        EcbBalanceOfPaymentsData.parse({
          date: (latest.TIME_PERIOD ?? latest.time_period ?? "") as string,
          item: itemName,
          value: latest.value as number | null,
        }),
      );
    }

    if (results.length === 0) throw new EmptyDataError("No balance of payments data could be parsed");
    return results;
  }
}
