import { RateLimitError, EmptyDataError } from "@openmoney/provider-core";

/**
 * Base URL for multpl.com.
 * Multpl provides historical market valuation data as HTML tables.
 */
const MULT_BASE_URL = "https://www.multpl.com";

/**
 * Multpl data endpoints.
 */
export enum MultplEndpoint {
  SHILLER_PE = "shiller-pe",
  MARKET_CAP_TO_GDP = "market-cap-to-gdp",
  S_P_DIVIDEND_YIELD = "s-p-500-dividend-yield",
  S_P_EARNINGS = "s-p-500-earnings",
  TEN_YEAR_TREASURY_RATE = "10-year-treasury-rate",
  THIRTY_YEAR_TREASURY_RATE = "30-year-treasury-rate",
}

/** Parsed multpl data row. */
export interface MultplDataRow {
  date: string;
  value: number;
}

/**
 * Fetch data from multpl.com.
 * The site embeds time-series data in a table with class "datatable".
 * This function fetches the HTML and parses the embedded JSON data table.
 * Multpl also provides a JSON endpoint at /page/<endpoint>.js
 */
export async function fetchMultplData(
  endpoint: MultplEndpoint,
): Promise<MultplDataRow[]> {
  // Multpl provides JSON data via a script tag
  const url = `${MULT_BASE_URL}/${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new RateLimitError("Multpl rate limit exceeded");
    }
    throw new EmptyDataError(
      `Failed to fetch data from multpl: ${response.status}`,
    );
  }

  const html = await response.text();

  // Try to extract JSON data from the page's embedded data source
  // Multpl embeds data in a JSON array within a <script> tag
  // Pattern: data = [[timestamp_ms, value], ...]
  const dataMatch = html.match(
    /var\s+data\s*=\s*(\[[\s\S]*?\])\s*;/i,
  );

  if (dataMatch && dataMatch[1]) {
    try {
      const rawData = JSON.parse(dataMatch[1]) as Array<[number, number]>;
      return rawData
        .filter(([ts, val]) => ts != null && val != null)
        .map(([ts, val]) => ({
          date: new Date(ts).toISOString().split("T")[0] ?? "",
          value: val,
        }))
        .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
    } catch {
      // Fall through to table parsing
    }
  }

  // Fallback: parse HTML table with class "datatable"
  return parseMultplTable(html);
}

/**
 * Fallback parser for multpl HTML data tables.
 */
function parseMultplTable(html: string): MultplDataRow[] {
  const rows: MultplDataRow[] = [];

  // Try to find table data rows with td elements
  const tableRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  let match;

  while ((match = tableRegex.exec(html)) !== null) {
    const rowHtml = match[0];
    const cells = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);

    if (!cells || cells.length < 2) continue;

    const dateText = cells[0]!.replace(/<[^>]+>/g, "").trim();
    const valueText = cells[1]!.replace(/<[^>]+>/g, "").trim();

    // Validate date format
    const parsedDate = new Date(dateText);
    if (isNaN(parsedDate.getTime())) continue;

    const value = parseFloat(valueText.replace(/[$,%]/g, ""));
    if (isNaN(value)) continue;

    rows.push({
      date: parsedDate.toISOString().split("T")[0]!,
      value,
    });
  }

  if (rows.length === 0) {
    throw new EmptyDataError(
      "Could not parse multpl data from the page",
    );
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fetch table data via multpl's JSON endpoint.
 * Some pages provide /<endpoint>/table.csv or embedded JSON.
 */
export async function fetchMultplTableCsv(
  endpoint: MultplEndpoint,
): Promise<MultplDataRow[]> {
  const url = `${MULT_BASE_URL}/${endpoint}/table.csv`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    return fetchMultplData(endpoint);
  }

  const csv = await response.text();
  const lines = csv.split("\n").filter((l) => l.trim().length > 0);
  const rows: MultplDataRow[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!;
    const parts = line.split(",");
    if (parts.length < 2) continue;
    const dateStr = parts[0]!.trim();
    const value = parseFloat(parts[1]!.trim());
    if (isNaN(value)) continue;

    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) continue;

    rows.push({
      date: parsedDate.toISOString().split("T")[0]!,
      value,
    });
  }

  if (rows.length === 0) {
    throw new EmptyDataError(
      "No data found in multpl CSV table",
    );
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}
