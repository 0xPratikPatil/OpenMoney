import { RateLimitError } from "@openmoney/provider-core";

const CFTC_BASE = "https://www.cftc.gov/dea/newcot";

/**
 * Fetch CFTC COT data as CSV text.
 * CFTC publishes public COT reports at fixed URLs with no auth.
 */
export async function cftcFetch<T>(path: string): Promise<T> {
  const url = `${CFTC_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "text/csv, text/plain, */*",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("CFTC rate limit exceeded");
    throw new Error(`CFTC API error: ${response.status} ${response.statusText}`);
  }

  return (await response.text()) as unknown as T;
}

/**
 * Parse CFTC CSV data into structured rows.
 * Columns vary by report type (legacy, financial, etc.).
 */
export interface CFTCReportRow {
  [key: string]: string;
}

export function parseCFTCReportCsv(csv: string): CFTCReportRow[] {
  const lines = csv.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Find the header line (usually first non-empty line, but CFTC sometimes has preamble)
  let headerIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i]!;
    if (line.includes("Market and Exchange Names") || line.includes("CFTC Code")) {
      headerIndex = i;
      break;
    }
  }

  const headerLine = lines[headerIndex];
  if (!headerLine) return [];

  const headers = parseCSVLine(headerLine);
  const rows: CFTCReportRow[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values = parseCSVLine(line);

    // Skip summary/total lines
    if (values.length === 0 || values[0]?.startsWith("TOTAL") ?? false || values.every((v) => v === "")) {
      continue;
    }

    if (values.length >= headers.length) {
      const row: CFTCReportRow = {};
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        if (header !== undefined) {
          row[header.trim()] = values[j]?.trim() ?? "";
        }
      }
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Simple CSV line parser (handles quoted fields).
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.replace(/^"|"$/g, ""));

  return result;
}
