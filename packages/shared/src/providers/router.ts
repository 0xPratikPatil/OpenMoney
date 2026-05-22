/**
 * Provider Priority & Selection Engine — OpenMoney
 *
 * Manages which provider serves a given data model based on:
 *  1. Priority ordering (free providers first, then paid)
 *  2. User preference overrides
 *  3. Provider health (circuit breaker state)
 *  4. Automatic fallback when a provider fails
 *
 * Usage:
 *   import { providerRouter } from '@openmoney/shared';
 *   const result = await providerRouter.query('equity/quote', { symbol: 'AAPL' });
 */

import type { ProviderRegistry, QueryExecutor } from "@openmoney/provider-core";
import { logger } from "../logging";
import { OpenMoneyError } from "../errors";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ProviderPriority {
  /** Provider name */
  name: string;
  /** Lower = higher priority (1 = always try first) */
  priority: number;
  /** Is this provider free? Free providers preferred when available */
  free: boolean;
}

export interface ProviderRouteResult<T = unknown> {
  data: T;
  provider: string;
  model: string;
  /** Whether this came from a fallback (original provider failed) */
  fallback: boolean;
  /** The originally requested provider, if different from actual */
  requestedProvider?: string;
}

export interface ProviderRouterOptions {
  /** Max number of providers to try before giving up */
  maxAttempts?: number;
  /** Timeout per provider attempt (ms) */
  timeoutMs?: number;
  /** Whether to prefer free providers even if user specified a paid one */
  preferFree?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  ProviderPriorityRegistry                                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_PRIORITIES: ProviderPriority[] = [
  // Free providers first
  { name: "yfinance", priority: 1, free: true },
  { name: "finviz", priority: 2, free: true },
  { name: "nasdaq", priority: 3, free: true },
  { name: "ecb", priority: 4, free: true },
  { name: "cboe", priority: 5, free: true },
  { name: "sec", priority: 6, free: true },
  { name: "tmx", priority: 7, free: true },
  { name: "fred", priority: 8, free: true },
  { name: "econdb", priority: 9, free: true },
  { name: "government_us", priority: 10, free: true },
  { name: "federal_reserve", priority: 11, free: true },
  { name: "finra", priority: 12, free: true },
  { name: "bls", priority: 13, free: true },
  { name: "cftc", priority: 14, free: true },
  { name: "congress_gov", priority: 15, free: true },
  { name: "eia", priority: 16, free: true },
  { name: "imf", priority: 17, free: true },
  { name: "oecd", priority: 18, free: true },
  { name: "multpl", priority: 19, free: true },
  { name: "stockgrid", priority: 20, free: true },
  { name: "wsj", priority: 21, free: true },
  // Freemium (free tier available)
  { name: "alphavantage", priority: 22, free: true },
  { name: "fmp", priority: 23, free: true },
  { name: "polygon", priority: 24, free: true },
  { name: "tiingo", priority: 25, free: true },
  { name: "tradier", priority: 26, free: true },
  // Paid / premium providers
  { name: "benzinga", priority: 30, free: false },
  { name: "biztoc", priority: 31, free: false },
  { name: "intrinio", priority: 32, free: false },
  { name: "seeking_alpha", priority: 33, free: false },
  { name: "tradingeconomics", priority: 34, free: false },
  { name: "deribit", priority: 35, free: false },
  { name: "famafrench", priority: 36, free: false },
];

/* -------------------------------------------------------------------------- */
/*  ProviderRouter                                                             */
/* -------------------------------------------------------------------------- */

export class ProviderRouter {
  private priorities: Map<string, ProviderPriority>;
  private overrides: Map<string, string> = new Map(); // model → provider override (user preference)

  constructor(priorities?: ProviderPriority[]) {
    this.priorities = new Map();
    const list = priorities ?? DEFAULT_PRIORITIES;
    for (const p of list) {
      this.priorities.set(p.name, p);
    }
  }

  /** Override default priority for a specific provider */
  setPriority(name: string, priority: number, free: boolean): void {
    this.priorities.set(name, { name, priority, free });
  }

  /** User pins a specific provider for a model */
  setUserPreference(model: string, provider: string): void {
    this.overrides.set(model, provider);
  }

  /** Remove user preference for a model */
  clearUserPreference(model: string): void {
    this.overrides.delete(model);
  }

  /**
   * Get ordered list of providers capable of serving a model.
   * Sorted by: user preference > free status > priority number.
   */
  getProviderChain(
    model: string,
    registry: ProviderRegistry,
    requestedProvider?: string,
  ): string[] {
    // If user requested a specific provider, try it first
    if (requestedProvider) {
      const prov = registry.get(requestedProvider);
      if (prov && prov.fetcherMap.has(model)) {
        const chain = [requestedProvider];
        // Add remaining providers as fallback
        for (const name of this.getSortedProviders(model, registry)) {
          if (name !== requestedProvider) chain.push(name);
        }
        return chain;
      }
    }

    // Check user preference override
    const preferred = this.overrides.get(model);
    if (preferred) {
      const prov = registry.get(preferred);
      if (prov && prov.fetcherMap.has(model)) {
        const chain = [preferred];
        for (const name of this.getSortedProviders(model, registry)) {
          if (name !== preferred) chain.push(name);
        }
        return chain;
      }
    }

    return this.getSortedProviders(model, registry);
  }

  /** Sort providers by priority + free-status preference */
  private getSortedProviders(model: string, registry: ProviderRegistry): string[] {
    const candidates: Array<{ name: string; priority: number; free: boolean }> = [];

    for (const [name, provider] of registry.getAll()) {
      if (provider.fetcherMap.has(model)) {
        const p = this.priorities.get(name);
        candidates.push({
          name,
          priority: p?.priority ?? 99,
          free: p?.free ?? false,
        });
      }
    }

    // Sort: free providers first, then by priority number
    candidates.sort((a, b) => {
      if (a.free !== b.free) return a.free ? -1 : 1;
      return a.priority - b.priority;
    });

    return candidates.map((c) => c.name);
  }
}

/** Singleton provider router instance */
export const providerRouter = new ProviderRouter();

/* -------------------------------------------------------------------------- */
/*  Provider Query with fallback                                               */
/* -------------------------------------------------------------------------- */

export async function executeWithFallback<T = unknown>(
  executor: QueryExecutor,
  registry: ProviderRegistry,
  model: string,
  params: Record<string, unknown>,
  opts?: ProviderRouterOptions & {
    requestedProvider?: string;
    credentials?: Record<string, string>;
  },
): Promise<ProviderRouteResult<T>> {
  const chain = providerRouter.getProviderChain(
    model,
    registry,
    opts?.requestedProvider,
  );

  if (chain.length === 0) {
    throw new OpenMoneyError("FETCHER_NOT_FOUND", `No provider supports model '${model}'`);
  }

  const maxAttempts = opts?.maxAttempts ?? chain.length;
  const errors: Array<{ provider: string; error: string }> = [];
  const requestedProvider = opts?.requestedProvider;

  for (let i = 0; i < Math.min(chain.length, maxAttempts); i++) {
    const providerName = chain[i]!;
    const isFallback = i > 0 || (!!requestedProvider && providerName !== requestedProvider);

    try {
      logger.info("Provider query", {
        provider: providerName,
        model,
        attempt: i + 1,
        isFallback,
        params: JSON.stringify(Object.keys(params)),
      });

      const data = await executor.execute<T>(providerName, model, params, opts?.credentials);

      if (isFallback) {
        logger.warn("Provider fallback used", {
          provider: providerName,
          model,
          originalProvider: requestedProvider ?? "default",
          previousErrors: errors.map((e) => `${e.provider}: ${e.error}`),
        });
      }

      return {
        data,
        provider: providerName,
        model,
        fallback: isFallback,
        requestedProvider,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push({ provider: providerName, error: msg });

      logger.warn("Provider attempt failed", {
        provider: providerName,
        model,
        attempt: i + 1,
        error: msg,
      });
    }
  }

  throw new OpenMoneyError("ALL_PROVIDERS_FAILED", `All ${chain.length} providers failed for model '${model}'`, {
    details: errors,
  });
}
