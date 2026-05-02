import { UnauthorizedError, RateLimitError } from "@openmoney/provider-core";

const SEC_BASE = "https://www.sec.gov";

/**
 * User-Agent is required by SEC. Use a format: CompanyName (contact@company.com).
 */
const USER_AGENT = "OpenMoney (contact@openmoney.dev)";

/**
 * Generic SEC fetch with required User-Agent header and error handling.
 */
export async function secFetch<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${SEC_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("SEC rate limit exceeded");
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError();
    throw new Error(`SEC API error: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  // Try JSON first, then XML fallback
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) {
    return JSON.parse(text) as T;
  }

  // Return raw text for XML/HTML responses
  return text as unknown as T;
}

/**
 * Fetch JSON data from SEC EDGAR API.
 */
export async function secJsonFetch<T>(
  path: string,
): Promise<T> {
  const url = `${SEC_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("SEC rate limit exceeded");
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError();
    throw new Error(`SEC API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

/**
 * Parse CIK from SEC's browse-edgar HTML/XML response.
 * CIK appears in the redirect URL or response body as CIK=0001234567.
 */
export function parseCIKFromResponse(text: string, _symbol: string): string | null {
  // Try to find CIK in format CIK= followed by digits
  const match = text.match(/CIK=(\d{10})/);
  if (match?.[1]) return match[1];

  // Try to find in XML: <cik>1234567890</cik>
  const xmlMatch = text.match(/<cik[^>]*>(\d+)<\/cik>/i);
  if (xmlMatch?.[1]) return xmlMatch[1].padStart(10, "0");

  return null;
}

/**
 * Fetch XML from SEC and parse basic fields.
 */
export async function secXmlFetch(
  path: string,
  params?: Record<string, string>,
): Promise<string> {
  const url = new URL(`${SEC_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("SEC rate limit exceeded");
    throw new Error(`SEC XML fetch error: ${response.status}`);
  }

  return response.text();
}

/**
 * Extract company info entries from SEC browse-edgar XML feed.
 */
export interface SECFeedEntry {
  title: string;
  link: string;
  summary: string;
  updated: string;
  category?: string;
}

export function parseFeedEntries(xml: string): SECFeedEntry[] {
  const entries: SECFeedEntry[] = [];

  // Simple regex-based feed parser (no XML deps)
  const entryRegex = /<entry>[\s\S]*?<\/entry>/g;
  let entryMatch: RegExpExecArray | null;

  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const entryXml = entryMatch[0];

    const getField = (tag: string): string => {
      const m = entryXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return m?.[1]?.trim() ?? "";
    };

    const getAttr = (tag: string, attr: string): string => {
      const m = entryXml.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']*)["']`, "i"));
      return m?.[1]?.trim() ?? "";
    };

    entries.push({
      title: getField("title"),
      link: getAttr("link", "href"),
      summary: getField("summary"),
      updated: getField("updated"),
      category: getAttr("category", "term"),
    });
  }

  return entries;
}
