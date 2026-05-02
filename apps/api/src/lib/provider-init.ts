import { globalRegistry, QueryExecutor } from "@openmoney/provider-core";
import { yfinanceProvider } from "@openmoney/provider-yfinance";

/**
 * Initialize all registered providers.
 * This is called once at app startup.
 * Equivalent to OpenBB's RegistryLoader.from_extensions()
 */
export function initializeProviders(): void {
  // Register yfinance (free, no API key needed)
  globalRegistry.register(yfinanceProvider);

  // Future: register polygon, fmp, alphavantage, etc.
  // globalRegistry.register(polygonProvider);
  // globalRegistry.register(fmpProvider);
  // globalRegistry.register(alphavantageProvider);
}

/**
 * Create a QueryExecutor instance with the global registry.
 */
export function createQueryExecutor(): QueryExecutor {
  return new QueryExecutor(globalRegistry);
}
