/**
 * Provider Status & Health Tracking — OpenMoney
 *
 * Tracks the runtime health of every provider. Used by the router to
 * skip failed providers and by the frontend to show connection status.
 *
 * States:
 *   ACTIVE    → Provider is working, data flows (free) or API key valid (paid)
 *   ERROR     → Provider recently failed (skipped in fallback chain for 5 min)
 *   DISABLED  → Paid provider with no API key configured (shown in UI, not used)
 *   UNKNOWN   → Not yet checked (default for all providers at startup)
 *
 * Health is validated lazily: a provider transitions to ACTIVE on first
 * successful query, and to ERROR on any failure. ERROR state auto-clears
 * after COOLDOWN_MS.
 */

import { logger } from "../logging";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ProviderStatus = "ACTIVE" | "ERROR" | "DISABLED" | "UNKNOWN";

export interface ProviderHealthEntry {
  name: string;
  status: ProviderStatus;
  free: boolean;
  modelCount: number;
  models: string[];
  lastChecked?: string;
  lastError?: string;
  /** Seconds until this provider is retried (only for ERROR state) */
  cooldownRemaining?: number;
}

export interface ProviderHealthSnapshot {
  providers: ProviderHealthEntry[];
  summary: {
    total: number;
    active: number;
    error: number;
    disabled: number;
    unknown: number;
    freeActive: number;
    paidActive: number;
    modelsWithFreeCoverage: number;
    modelsWithOnlyPaid: number;
  };
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

/** How long to skip a provider after a failure (ms) */
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/** Free providers that don't need API keys */
const FREE_PROVIDERS = new Set([
  "yfinance", "finviz", "nasdaq", "ecb", "cboe", "sec", "tmx",
  "fred", "econdb", "government_us", "federal_reserve", "finra",
  "bls", "cftc", "congress_gov", "eia", "imf", "oecd",
  "multpl", "stockgrid", "wsj",
]);

/** Providers with free tiers (treated as free when no key, paid when key set) */
const FREEMIUM_PROVIDERS = new Set([
  "alphavantage", "fmp", "polygon", "tiingo", "tradier",
]);

/* -------------------------------------------------------------------------- */
/*  ProviderHealthTracker                                                      */
/* -------------------------------------------------------------------------- */

class ProviderHealthTracker {
  private state: Map<string, { status: ProviderStatus; lastError?: string; errorAt?: number }> = new Map();
  /** Tracks which paid providers have credentials configured */
  private paidConfigured: Set<string> = new Set();

  /** Mark a provider as active (successful query) */
  markActive(name: string): void {
    this.state.set(name, { status: "ACTIVE" });
  }

  /** Mark a provider as errored (failed query) */
  markError(name: string, error: string): void {
    const wasActive = this.state.get(name)?.status === "ACTIVE";
    this.state.set(name, { status: "ERROR", lastError: error, errorAt: Date.now() });

    if (wasActive) {
      logger.warn(`Provider ${name} transitioned ACTIVE → ERROR`, {
        provider: name,
        error: error.slice(0, 200),
      });
    }
  }

  /** Register that a paid provider has credentials configured */
  markCredentialsConfigured(name: string): void {
    this.paidConfigured.add(name);
    // Reset to UNKNOWN so it gets re-checked on next query
    this.state.set(name, { status: "UNKNOWN" });
  }

  /** Check if a paid provider has credentials */
  hasCredentials(name: string): boolean {
    return this.paidConfigured.has(name);
  }

  /** Get current status of a provider */
  getStatus(name: string): ProviderStatus {
    const entry = this.state.get(name);
    if (!entry) return "UNKNOWN";

    // Auto-clear ERROR after cooldown
    if (entry.status === "ERROR" && entry.errorAt) {
      if (Date.now() - entry.errorAt > COOLDOWN_MS) {
        this.state.set(name, { status: "UNKNOWN" });
        return "UNKNOWN";
      }
    }

    return entry.status;
  }

  /** Check if a provider is eligible for query (not in ERROR cooldown) */
  isEligible(name: string): boolean {
    const status = this.getStatus(name);
    return status !== "ERROR";
  }

  /** Get cooldown remaining in seconds (for ERROR state) */
  getCooldownRemaining(name: string): number | undefined {
    const entry = this.state.get(name);
    if (entry?.status === "ERROR" && entry.errorAt) {
      const remaining = COOLDOWN_MS - (Date.now() - entry.errorAt);
      return Math.max(0, Math.ceil(remaining / 1000));
    }
    return undefined;
  }

  /** Determine if a provider is free */
  isFree(name: string): boolean {
    if (FREE_PROVIDERS.has(name)) return true;
    if (FREEMIUM_PROVIDERS.has(name)) {
      // Freemium: free if no credentials configured, paid otherwise
      return !this.paidConfigured.has(name);
    }
    return false;
  }

  /** Determine the display status for a provider */
  getDisplayStatus(name: string): ProviderStatus {
    const status = this.getStatus(name);
    const isFree = this.isFree(name);

    // Free providers: just show ACTIVE or ERROR
    if (isFree) return status === "ERROR" ? "ERROR" : "ACTIVE";

    // Paid providers: distinguish DISABLED (no key) from ACTIVE/ERROR
    if (!this.paidConfigured.has(name)) return "DISABLED";
    return status === "ERROR" ? "ERROR" : status;
  }

  /**
   * Build a full health snapshot for API responses.
   */
  buildSnapshot(
    providerNames: string[],
    providerModels: Map<string, string[]>,
  ): ProviderHealthSnapshot {
    const entries: ProviderHealthEntry[] = [];
    const allModels = new Set<string>();

    for (const name of providerNames) {
      const models = providerModels.get(name) ?? [];
      for (const m of models) allModels.add(m);

      const status = this.getDisplayStatus(name);
      const cooldown = this.getCooldownRemaining(name);
      const entry = this.state.get(name);

      entries.push({
        name,
        status,
        free: this.isFree(name),
        modelCount: models.length,
        models,
        lastChecked: entry?.errorAt ? new Date(entry.errorAt).toISOString() : undefined,
        lastError: entry?.lastError,
        cooldownRemaining: cooldown,
      });
    }

    // Compute coverage metrics
    const freeProviders = entries.filter((e) => e.free);
    const activeFree = freeProviders.filter((e) => e.status === "ACTIVE");
    const activePaid = entries.filter((e) => !e.free && e.status === "ACTIVE");

    // Per-model: how many have free coverage, how many are paid-only
    let modelsWithFreeCoverage = 0;
    let modelsWithOnlyPaid = 0;

    for (const model of allModels) {
      const hasFree = freeProviders.some(
        (p) => p.models.includes(model) && p.status !== "ERROR" && p.status !== "DISABLED",
      );
      const hasPaid = entries.some(
        (p) => !p.free && p.models.includes(model),
      );
      if (hasFree) modelsWithFreeCoverage++;
      else if (hasPaid) modelsWithOnlyPaid++;
    }

    return {
      providers: entries,
      summary: {
        total: entries.length,
        active: entries.filter((e) => e.status === "ACTIVE").length,
        error: entries.filter((e) => e.status === "ERROR").length,
        disabled: entries.filter((e) => e.status === "DISABLED").length,
        unknown: entries.filter((e) => e.status === "UNKNOWN").length,
        freeActive: activeFree.length,
        paidActive: activePaid.length,
        modelsWithFreeCoverage,
        modelsWithOnlyPaid,
      },
    };
  }
}

/** Singleton instance */
export const providerHealth = new ProviderHealthTracker();
