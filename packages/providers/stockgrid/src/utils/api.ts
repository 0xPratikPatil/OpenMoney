import { RateLimitError, EmptyDataError } from "@openmoney/provider-core";

/**
 * Base URL for stockgrid.io.
 * Stockgrid provides dark pool and short volume data.
 */
const STOCKGRID_BASE_URL = "https://stockgrid.io";

/**
 * Stockgrid data endpoints.
 */
export enum StockgridEndpoint {
  DARK_POOL = "darkpool",
  SHORT_VOLUME = "shortvolume",
  ORDER_FLOW = "orderflow",
}

/** Parsed stockgrid data row. */
export interface StockgridDataRow {
  symbol: string;
  date: string;
  [key: string]: unknown;
}

/**
 * Fetch data from stockgrid.io.
 * Stockgrid provides tabular data on its pages. We fetch and parse
 * the structured tables from the page HTML.
 */
export async function fetchStockgridData(
  endpoint: StockgridEndpoint,
  symbol?: string,
): Promise<StockgridDataRow[]> {
  let path: string;

  switch (endpoint) {
    case StockgridEndpoint.DARK_POOL:
      path = symbol
        ? `/dark-pool/dark-pool/${symbol}`
        : "/dark-pool";
      break;
    case StockgridEndpoint.SHORT_VOLUME:
      path = symbol
        ? `/short-volume/short-volume/${symbol}`
        : "/short-volume";
      break;
    case StockgridEndpoint.ORDER_FLOW:
      path = symbol
        ? `/order-flow/order-flow/${symbol}`
        : "/order-flow";
      break;
  }

  const url = `${STOCKGRID_BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new RateLimitError("Stockgrid rate limit exceeded");
    }
    if (response.status === 404) {
      throw new EmptyDataError(
        `No data found for ${symbol ?? "this endpoint"}`,
      );
    }
    throw new EmptyDataError(
      `Failed to fetch data from stockgrid: ${response.status}`,
    );
  }

  const html = await response.text();

  // Try to find and parse JSON data embedded in the page
  // Stockgrid often provides data via inline JSON or data attributes
  const jsonData = extractJsonData(html);
  if (jsonData && jsonData.length > 0) {
    return jsonData;
  }

  // Fallback: parse HTML tables
  return parseStockgridTable(html);
}

/**
 * Attempt to extract JSON data from script tags in the page.
 */
function extractJsonData(html: string): StockgridDataRow[] | null {
  // Look for JSON embedded in script tags with specific patterns
  const scriptRegex =
    /<script[^>]*>[\s\S]*?var\s+(?:data|tableData|chartData)\s*=\s*(\[[\s\S]*?\])\s*;[\s\S]*?<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const raw = JSON.parse(match[1]) as Array<Record<string, unknown>>;
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((row) => ({
          symbol: String(row.symbol ?? row.ticker ?? ""),
          date: String(row.date ?? row.Date ?? ""),
          ...row,
        }));
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Parse HTML data tables from stockgrid.
 */
function parseStockgridTable(html: string): StockgridDataRow[] {
  const rows: StockgridDataRow[] = [];

  // Find all table rows
  const tableRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  let match;

  while ((match = tableRegex.exec(html)) !== null) {
    const rowHtml = match[0];
    const cells = rowHtml.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
    if (!cells || cells.length < 2) continue;

    const row: StockgridDataRow = {
      symbol: "",
      date: "",
    };

    const cellValues = cells.map((c) =>
      c.replace(/<[^>]+>/g, "").trim(),
    );

    // First cell is typically symbol or date
    if (cellValues.length >= 2) {
      row.symbol = cellValues[0];
      row.date = cellValues[1];

      // Add remaining cells as numeric fields
      for (let i = 2; i < cellValues.length; i++) {
        const val = parseFloat(cellValues[i].replace(/[$,%]/g, ""));
        row[`field_${i}`] = isNaN(val) ? cellValues[i] : val;
      }

      if (row.symbol && row.symbol.length <= 10) {
        rows.push(row);
      }
    }
  }

  if (rows.length === 0) {
    throw new EmptyDataError(
      "Could not parse stockgrid data from the page",
    );
  }

  return rows;
}
