/**
 * Yahoo Finance Cookie + Crumb Authentication
 *
 * Implements the yfinance library's auth flow with strategy toggling:
 *   BASIC strategy:
 *     1. GET https://fc.yahoo.com → acquire initial session cookies (A3, etc.)
 *     2. GET https://query2.finance.yahoo.com/v1/test/getcrumb → crumb string
 *   CSRF strategy (fallback):
 *     1. GET https://guce.yahoo.com/consent → auto-redirects through consent
 *        (sets A1, A3, GUC session cookies via redirect chain + Set-Cookie)
 *     2. GET https://query2.finance.yahoo.com/v1/test/getcrumb with cookies
 *
 * The crumb is sent as a URL QUERY PARAMETER on every API request
 * (matching yfinance's _make_request() behavior).
 *
 * Strategy toggles between 'basic' and 'csrf' on auth failure,
 * matching yfinance's _set_cookie_strategy() pattern.
 *
 * Cache TTL: 25 minutes. Invalidated on 401 with automatic retry.
 *
 * @module cookie-crumb
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Strategy = "basic" | "csrf";

interface CookieAndCrumb {
  cookie: string;
  crumb: string;
  expiresAt: number;
}

// ---------------------------------------------------------------------------
// Module-level cache
// ---------------------------------------------------------------------------

let cached: CookieAndCrumb | null = null;
let fetchPromise: Promise<CookieAndCrumb> | null = null;
let currentStrategy: Strategy = "basic";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_TTL_MS = 25 * 60 * 1000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const CONSENT_URL = "https://guce.yahoo.com/consent";
const FC_YAHOO_URL = "https://fc.yahoo.com";
const CRUMB_URL = "https://query2.finance.yahoo.com/v1/test/getcrumb";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getCookieAndCrumb(): Promise<CookieAndCrumb> {
  if (cached && Date.now() < cached.expiresAt) {
    return cached;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = doFetchWithToggle().finally(() => {
    fetchPromise = null;
  });

  return fetchPromise;
}

export function invalidateCookieCache(): void {
  cached = null;
}

// ---------------------------------------------------------------------------
// Internal: fetch logic with strategy toggle
// ---------------------------------------------------------------------------

async function doFetchWithToggle(): Promise<CookieAndCrumb> {
  try {
    return await doFetch(currentStrategy);
  } catch (err) {
    // Toggle strategy and retry once (mimics yfinance's _set_cookie_strategy)
    const prevStrategy = currentStrategy;
    currentStrategy = currentStrategy === "basic" ? "csrf" : "basic";
    console.warn(
      `[yfinance] Cookie strategy '${prevStrategy}' failed, toggling to '${currentStrategy}'`
    );
    return doFetch(currentStrategy);
  }
}

async function doFetch(strategy: Strategy): Promise<CookieAndCrumb> {
  let cookieStr: string;

  if (strategy === "basic") {
    // Step 1: Visit fc.yahoo.com to acquire session cookies
    const fcResp = await fetch(FC_YAHOO_URL, {
      headers: { "User-Agent": UA },
      redirect: "follow",
    });
    cookieStr = buildCookieString(fcResp);
  } else {
    // CSRF strategy: Visit guce.yahoo.com/consent
    const consentResp = await fetch(CONSENT_URL, {
      headers: { "User-Agent": UA },
      redirect: "follow",
    });
    cookieStr = buildCookieString(consentResp);
  }

  // Step 2: Get crumb using the session cookies
  const crumbResp = await fetch(CRUMB_URL, {
    headers: { "User-Agent": UA, Cookie: cookieStr },
    redirect: "follow",
  });

  if (!crumbResp.ok) {
    throw new Error(`Yahoo crumb endpoint returned HTTP ${crumbResp.status}`);
  }

  cookieStr = mergeCookieStrings(cookieStr, buildCookieString(crumbResp));
  const crumb = (await crumbResp.text()).trim();

  if (!crumb) {
    throw new Error("Yahoo Finance returned an empty crumb");
  }

  cached = {
    cookie: cookieStr,
    crumb,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  return cached;
}

// ---------------------------------------------------------------------------
// Internal: cookie parsing
// ---------------------------------------------------------------------------

function buildCookieString(resp: Response): string {
  const cookies = extractCookies(resp);
  if (Object.keys(cookies).length === 0) return "";
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

function mergeCookieStrings(existing: string, incoming: string): string {
  if (!incoming) return existing;
  if (!existing) return incoming;

  const map: Record<string, string> = {};
  for (const part of existing.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq > 0) map[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  for (const part of incoming.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq > 0) map[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return Object.entries(map)
    .map(([n, v]) => `${n}=${v}`)
    .join("; ");
}

function extractCookies(resp: Response): Record<string, string> {
  const cookies: Record<string, string> = {};
  const setCookie = resp.headers.getSetCookie?.() ?? [];

  for (const raw of setCookie) {
    const eq = raw.indexOf("=");
    const semi = raw.indexOf(";", eq + 1);
    if (eq === -1) continue;
    const name = raw.slice(0, eq).trim();
    const value =
      semi === -1 ? raw.slice(eq + 1).trim() : raw.slice(eq + 1, semi).trim();
    if (value) cookies[name] = value;
  }

  return cookies;
}
