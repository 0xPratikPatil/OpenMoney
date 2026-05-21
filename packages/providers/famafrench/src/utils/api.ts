import { RateLimitError, EmptyDataError } from "@openmoney/provider-core";

/**
 * Base URL for Ken French's Fama-French data library.
 * All data files are in CSV/TSV format.
 */
const FF_BASE_URL =
  "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp";

/**
 * Supported factor datasets.
 */
export enum FamaFrenchDataset {
  /** Fama-French 3 Factors (daily) */
  FACTORS_3_DAILY = "F-F_Research_Data_Factors_daily",
  /** Fama-French 3 Factors (monthly) */
  FACTORS_3_MONTHLY = "F-F_Research_Data_Factors",
  /** Fama-French 5 Factors (daily) */
  FACTORS_5_DAILY = "F-F_Research_Data_5_Factors_2x3_daily",
  /** Fama-French 5 Factors (monthly) */
  FACTORS_5_MONTHLY = "F-F_Research_Data_5_Factors_2x3",
  /** Momentum Factor (daily) */
  MOMENTUM_DAILY = "F-F_Momentum_Factor_daily",
  /** Momentum Factor (monthly) */
  MOMENTUM_MONTHLY = "F-F_Momentum_Factor",
  /** 10 Industry Portfolios (daily) */
  INDUSTRIES_10_DAILY = "10_Industry_Portfolios_daily",
  /** 10 Industry Portfolios (monthly) */
  INDUSTRIES_10_MONTHLY = "10_Industry_Portfolios",
  /** 12 Industry Portfolios (daily) */
  INDUSTRIES_12_DAILY = "12_Industry_Portfolios_daily",
  /** 12 Industry Portfolios (monthly) */
  INDUSTRIES_12_MONTHLY = "12_Industry_Portfolios",
  /** 17 Industry Portfolios (daily) */
  INDUSTRIES_17_DAILY = "17_Industry_Portfolios_daily",
  /** 17 Industry Portfolios (monthly) */
  INDUSTRIES_17_MONTHLY = "17_Industry_Portfolios",
  /** 30 Industry Portfolios (daily) */
  INDUSTRIES_30_DAILY = "30_Industry_Portfolios_daily",
  /** 30 Industry Portfolios (monthly) */
  INDUSTRIES_30_MONTHLY = "30_Industry_Portfolios",
  /** 49 Industry Portfolios (daily) */
  INDUSTRIES_49_DAILY = "49_Industry_Portfolios_daily",
  /** 49 Industry Portfolios (monthly) */
  INDUSTRIES_49_MONTHLY = "49_Industry_Portfolios",
}

/** Parsed factor row from FF data files. */
export interface FamaFrenchRow {
  date: string;
  [key: string]: number | string;
}

/**
 * Fetch and parse a Fama-French dataset file.
 * The files are CSV/TSV format with specific header structures.
 */
export async function fetchDataset(
  dataset: FamaFrenchDataset,
  frequency: "daily" | "monthly" = "daily",
): Promise<FamaFrenchRow[]> {
  const suffix = frequency === "daily" ? "_daily" : "";
  const datasetName = dataset + suffix;

  // FF data is published as zip files containing CSV files.
  // We attempt direct CSV download (some are available as .txt too)
  const csvUrl = `${FF_BASE_URL}/${datasetName}.csv`;

  const response = await fetch(csvUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    // Fallback: try .txt extension
    const txtUrl = `${FF_BASE_URL}/${datasetName}.txt`;
    const txtResponse = await fetch(txtUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!txtResponse.ok) {
      if (response.status === 429) {
        throw new RateLimitError("Fama-French rate limit exceeded");
      }
      throw new EmptyDataError(
        `No data available for dataset: ${datasetName}`,
      );
    }
    return parseFamaFrenchText(await txtResponse.text());
  }

  return parseFamaFrenchCsv(await response.text());
}

/**
 * Parse a Fama-French CSV file (comma-separated).
 */
function parseFamaFrenchCsv(content: string): FamaFrenchRow[] {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  return parseFamaFrenchLines(lines);
}

/**
 * Parse a Fama-French text file (typically space/tab-separated).
 */
function parseFamaFrenchText(content: string): FamaFrenchRow[] {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  return parseFamaFrenchLines(lines);
}

/**
 * Parse Fama-French formatted lines.
 * These files typically have header info, then a header row, then data rows.
 * Data format: YYYYMMDD followed by space/comma-separated values.
 */
function parseFamaFrenchLines(lines: string[]): FamaFrenchRow[] {
  // Skip copyright/description header lines (end with blank line or start of table)
  let dataStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i]!.trim();
    // Look for header row containing typical FF column names
    if (/^\s*\d{4}\s/.test(trimmed) || /^\s*\d{6}\s/.test(trimmed)) {
      dataStart = i;
      break;
    }
  }

  // If no obvious header, try to find where the column header is
  // FF files have description, blank line, then column headers, then data
  let headerIndex = -1;
  for (let i = 0; i < Math.min(dataStart, lines.length); i++) {
    const trimmed = lines[i]!.trim().toLowerCase();
    if (
      trimmed.includes("mkt-rf") ||
      trimmed.includes("smb") ||
      trimmed.includes("hml") ||
      (trimmed.includes("date") && trimmed.length < 80)
    ) {
      headerIndex = i;
      break;
    }
  }

  // If we found a header row, data starts after it
  const startRow = headerIndex >= 0 ? headerIndex + 1 : dataStart;

  // Parse header row
  const headerRow = headerIndex >= 0 ? lines[headerIndex]!.trim() : "";
  // CSV: comma-separated, Text: whitespace-separated
  const isCsv = headerRow.includes(",") || lines[startRow]?.includes(",");
  const separators = isCsv ? /,/ : /\s+/;

  const headers =
    headerRow.length > 0
      ? headerRow
          .split(separators)
          .map((h) => h.trim())
          .filter((h) => h.length > 0 && !/^-+$/.test(h))
      : [];

  // If we can't parse headers, generate placeholder column names
  const hasHeaders = headers.length > 0;

  const rows: FamaFrenchRow[] = [];

  for (let i = startRow; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (line.length === 0) continue;

    const parts = line
      .split(separators)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    // Skip footnote rows and non-data
    if (parts.length < 2) continue;
    const firstPart = parts[0]!;
    if (/^[a-z]/i.test(firstPart) && firstPart.length > 6) continue; // Skip text rows
    if (firstPart === "Date" || firstPart === "date") continue;
    if (/^-+$/.test(firstPart)) continue;

    const dateStr = firstPart;
    // Validate date format (YYYYMMDD or YYYYMM)
    if (!/^\d{4,6}$/.test(dateStr)) continue;

    const row: FamaFrenchRow = { date: formatFFDate(dateStr) };

    const valueKeys = hasHeaders ? headers.slice(1) : [];
    const values = parts.slice(1);

    for (let j = 0; j < values.length; j++) {
      const key = valueKeys[j] ?? `field_${j}`;
      const valStr = values[j]!;
      const val = parseFloat(valStr);
      row[key] = isNaN(val) ? valStr : val;
    }

    rows.push(row);
  }

  return rows;
}

/**
 * Convert Fama-French date format (YYYYMMDD or YYYYMM) to ISO date string.
 */
function formatFFDate(dateStr: string): string {
  if (dateStr.length === 8) {
    // YYYYMMDD
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${year}-${month}-${day}`;
  } else if (dateStr.length === 6) {
    // YYYYMM (monthly data)
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    return `${year}-${month}-01`;
  }
  return dateStr;
}

/**
 * Parse a Fama-French value as a percentage (returns decimal or percentage).
 */
export function parseFFValue(
  value: string | number | undefined | null,
): number | null {
  if (value == null) return null;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}
