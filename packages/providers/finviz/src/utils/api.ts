import { RateLimitError } from "@openmoney/provider-core";

const FINVIZ_BASE = "https://finviz.com";

/**
 * Fetch HTML content from FinViz quote page.
 */
export async function fetchQuotePage(symbol: string): Promise<string> {
  const url = `${FINVIZ_BASE}/quote.ashx?t=${encodeURIComponent(symbol)}&ty=c`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("FinViz rate limit exceeded");
    throw new Error(`FinViz error: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

/**
 * Fetch screener data from FinViz.
 * Uses the export API to get CSV-formatted screener results.
 */
export async function fetchScreenerCsv(params: Record<string, string>): Promise<string> {
  const queryString = new URLSearchParams(params).toString();
  const url = `${FINVIZ_BASE}/api/screener.ashx?v=111&${queryString}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/csv,text/html",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("FinViz rate limit exceeded");
    throw new Error(`FinViz screener error: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

/**
 * Parse a simple HTML table from FinViz quote page into key-value pairs.
 * FinViz quote page has a specific table structure with rows like:
 * <tr><td class="snapshot-td2-cp">Index</td><td class="snapshot-td2">S&P 500</td></tr>
 */
export function parseQuoteTable(html: string): Record<string, string> {
  const result: Record<string, string> = {};

  // Extract all rows from the quote table
  const rowRegex = /<tr[^>]*>.*?<td[^>]*class="snapshot-td2-cp"[^>]*>(.*?)<\/td>.*?<td[^>]*class="snapshot-td2"[^>]*>(.*?)<\/td>.*?<\/tr>/gs;
  let match: RegExpExecArray | null;

  while ((match = rowRegex.exec(html)) !== null) {
    const key = stripHtml(match[1]!).trim();
    const value = stripHtml(match[2]!).trim();
    result[key] = value;
  }

  return result;
}

/**
 * Strip HTML tags from a string.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Parse CSV text into an array of records.
 */
export function parseCsv(csvText: string): Array<Record<string, string>> {
  const lines = csvText.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]!);
  const records: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]!);
    if (fields.length >= 2) {
      const record: Record<string, string> = {};
      for (let j = 0; j < header.length && j < fields.length; j++) {
        record[header[j]!] = fields[j]!;
      }
      records.push(record);
    }
  }

  return records;
}

/**
 * Parse a single CSV line.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Safely parse a numeric value from FinViz strings.
 */
export function parseNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[$,%B\s]/g, "").replace(/,/g, "");
  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}
