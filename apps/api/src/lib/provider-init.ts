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
import { benzingaProvider } from "@openmoney/provider-benzinga";
import { biztocProvider } from "@openmoney/provider-biztoc";
import { blsProvider } from "@openmoney/provider-bls";
import { cftcProvider } from "@openmoney/provider-cftc";
import { congressGovProvider } from "@openmoney/provider-congress_gov";
import { econdbProvider } from "@openmoney/provider-econdb";
import { eiaProvider } from "@openmoney/provider-eia";
import { famafrenchProvider } from "@openmoney/provider-famafrench";
import { federalReserveProvider } from "@openmoney/provider-federal_reserve";
import { finraProvider } from "@openmoney/provider-finra";
import { imfProvider } from "@openmoney/provider-imf";
import { intrinioProvider } from "@openmoney/provider-intrinio";
import { multplProvider } from "@openmoney/provider-multpl";
import { oecdProvider } from "@openmoney/provider-oecd";
import { seekingAlphaProvider } from "@openmoney/provider-seeking_alpha";
import { stockgridProvider } from "@openmoney/provider-stockgrid";
import { tiingoProvider } from "@openmoney/provider-tiingo";
import { tradierProvider } from "@openmoney/provider-tradier";
import { tradingeconomicsProvider } from "@openmoney/provider-tradingeconomics";
import { wsjProvider } from "@openmoney/provider-wsj";

/**
 * Initialize all registered providers (33 total).
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

  // -- Additional providers --
  globalRegistry.register(benzingaProvider);
  globalRegistry.register(biztocProvider);
  globalRegistry.register(blsProvider);
  globalRegistry.register(cftcProvider);
  globalRegistry.register(congressGovProvider);
  globalRegistry.register(econdbProvider);
  globalRegistry.register(eiaProvider);
  globalRegistry.register(famafrenchProvider);
  globalRegistry.register(federalReserveProvider);
  globalRegistry.register(finraProvider);
  globalRegistry.register(imfProvider);
  globalRegistry.register(intrinioProvider);
  globalRegistry.register(multplProvider);
  globalRegistry.register(oecdProvider);
  globalRegistry.register(seekingAlphaProvider);
  globalRegistry.register(stockgridProvider);
  globalRegistry.register(tiingoProvider);
  globalRegistry.register(tradierProvider);
  globalRegistry.register(tradingeconomicsProvider);
  globalRegistry.register(wsjProvider);
}

/**
 * Create a QueryExecutor instance with the global registry.
 */
export function createQueryExecutor(): QueryExecutor {
  return new QueryExecutor(globalRegistry);
}
