import {
  AbstractFetcher,
  ProviderError,
  UnauthorizedError,
} from "./abstract/abstract-fetcher";
import type { AbstractProvider } from "./abstract/abstract-provider";
import { type ProviderRegistry } from "./registry";

/**
 * Query executor — resolves provider + model to fetcher, filters credentials, dispatches.
 * Equivalent to OpenBB's QueryExecutor class.
 */
export class QueryExecutor {
  constructor(private readonly registry: ProviderRegistry) {}

  getProvider(providerName: string): AbstractProvider {
    const provider = this.registry.get(providerName);
    if (!provider) {
      throw new ProviderError(
        `Provider '${providerName}' not found. Available: ${this.registry.availableProviders.join(", ")}`,
        "PROVIDER_NOT_FOUND",
      );
    }
    return provider;
  }

  getFetcher(provider: AbstractProvider, modelName: string): AbstractFetcher {
    const fetcher = provider.fetcherMap.get(modelName);
    if (!fetcher) {
      throw new ProviderError(
        `Fetcher not found for model '${modelName}' in provider '${provider.name}'. Available: ${Array.from(provider.fetcherMap.keys()).join(", ")}`,
        "FETCHER_NOT_FOUND",
      );
    }
    return fetcher;
  }

  filterCredentials(
    credentials: Record<string, string> | undefined,
    provider: AbstractProvider,
    requireCredentials: boolean,
  ): Record<string, string> {
    const filtered: Record<string, string> = {};
    if (provider.credentials.length === 0) return filtered;
    if (!credentials) {
      if (requireCredentials) {
        const website = provider.website ?? "";
        throw new UnauthorizedError(
          website
            ? `Missing credential(s) for '${provider.name}'. Check ${website} to get API keys.`
            : `Missing credential(s) for '${provider.name}'.`,
        );
      }
      return filtered;
    }
    for (const cred of provider.credentials) {
      const value = credentials[cred];
      if (!value) {
        if (requireCredentials) {
          const website = provider.website ?? "";
          throw new UnauthorizedError(
            website
              ? `Missing credential '${cred}'. Check ${website} to get it.`
              : `Missing credential '${cred}'.`,
          );
        }
      } else {
        filtered[cred] = value;
      }
    }
    return filtered;
  }

  async execute<T>(
    providerName: string,
    modelName: string,
    params: Record<string, unknown>,
    credentials?: Record<string, string>,
    options?: Record<string, unknown>,
  ): Promise<T> {
    const provider = this.getProvider(providerName);
    const fetcher = this.getFetcher(provider, modelName);
    const filteredCredentials = this.filterCredentials(
      credentials,
      provider,
      fetcher.requireCredentials,
    );
    return (await fetcher.fetchData(params, filteredCredentials, options)) as T;
  }
}
