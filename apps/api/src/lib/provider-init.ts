import { globalRegistry, QueryExecutor } from "@openmoney/provider-core";
import { yfinanceProvider } from "@openmoney/provider-yfinance";
import { fmpProvider } from "@openmoney/provider-fmp";
import { alphavantageProvider } from "@openmoney/provider-alphavantage";
import { polygonProvider } from "@openmoney/provider-polygon";
import { secProvider } from "@openmoney/provider-sec";
import { tmxProvider } from "@openmoney/provider-tmx";
import { cboeProvider } from "@openmoney/provider-cboe";
import { deribitProvider } from "@openmoney/provider-deribit";
import { ecbProvider } from "@openmoney/provider-ecb";
import { finvizProvider } from "@openmoney/provider-finviz";
import { governmentUsProvider } from "@openmoney/provider-government_us";
import { nasdaqProvider } from "@openmoney/provider-nasdaq";
import { fredProvider } from "@openmoney/provider-fred";

/**
 * Initialize all registered providers.
 * This is called once at app startup.
 * Equivalent to OpenBB's RegistryLoader.from_extensions()
 */
export function initializeProviders(): void {
  // -- No API key needed --
  globalRegistry.register(yfinanceProvider);

  // -- Free tier available --
  globalRegistry.register(fmpProvider);
  globalRegistry.register(alphavantageProvider);
  globalRegistry.register(polygonProvider);
  globalRegistry.register(secProvider);
  globalRegistry.register(tmxProvider);
  globalRegistry.register(cboeProvider);
  globalRegistry.register(deribitProvider);
  globalRegistry.register(ecbProvider);
  globalRegistry.register(finvizProvider);
  globalRegistry.register(governmentUsProvider);
  globalRegistry.register(nasdaqProvider);
  globalRegistry.register(fredProvider);
}

/**
 * Create a QueryExecutor instance with the global registry.
 */
export function createQueryExecutor(): QueryExecutor {
  return new QueryExecutor(globalRegistry);
}
