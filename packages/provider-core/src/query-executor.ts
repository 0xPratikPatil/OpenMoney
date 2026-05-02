import {
  AbstractFetcher,
  AnnotatedResult,
  ProviderError,
  UnauthorizedError,
} from "./abstract/abstract-fetcher";
import type { AbstractProvider } from "./abstract/abstract-provider";
import { OBBject } from "./obbject";
import { type ProviderRegistry } from "./registry";

/**
 * Query executor — resolves provider + model to fetcher, filters credentials, dispatches.
 *
 * Port of OpenBB's QueryExecutor class with additional OBBject and AnnotatedResult support.
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

  /**
   * Execute a query and return raw data.
   *
   * @typeParam T — Expected return type (typically the data array type)
   * @returns The raw results from the fetcher's fetchData
   */
  async execute<T = unknown>(
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

  /**
   * Execute a query and return an OBBject-wrapped result.
   * This is the preferred method for API route handlers.
   *
   * @typeParam T — The inner data type
   * @returns An OBBject wrapping the results with metadata
   */
  async executeWithOBBject<T = unknown>(
    providerName: string,
    modelName: string,
    params: Record<string, unknown>,
    credentials?: Record<string, string>,
    options?: Record<string, unknown>,
  ): Promise<OBBject<T>> {
    const startTime = performance.now();
    const provider = this.getProvider(providerName);
    const fetcher = this.getFetcher(provider, modelName);
    const filteredCredentials = this.filterCredentials(
      credentials,
      provider,
      fetcher.requireCredentials,
    );
    const results = (await fetcher.fetchData(
      params,
      filteredCredentials,
      options,
    )) as T[];
    const duration = Math.round(performance.now() - startTime);

    return OBBject.fromResults<T>(results, providerName, modelName, duration);
  }

  /**
   * Execute a query and return the result as a typed array.
   * Throws if the result is not an array.
   *
   * @typeParam T — The inner data type
   * @returns The results as a typed array
   */
  async executeToArray<T = unknown>(
    providerName: string,
    modelName: string,
    params: Record<string, unknown>,
    credentials?: Record<string, string>,
    options?: Record<string, unknown>,
  ): Promise<T[]> {
    const result = await this.execute<T[]>(
      providerName,
      modelName,
      params,
      credentials,
      options,
    );
    if (!Array.isArray(result)) {
      throw new ProviderError(
        `Expected array result from '${providerName}'/'${modelName}' but got ${typeof result}`,
        "NOT_ARRAY",
      );
    }
    return result;
  }

  /**
   * Execute a query that returns an AnnotatedResult.
   * AnnotatedResult contains both the data and metadata from the fetcher.
   *
   * @typeParam T — The inner data type
   */
  async executeWithAnnotation<T = unknown>(
    providerName: string,
    modelName: string,
    params: Record<string, unknown>,
    credentials?: Record<string, string>,
    options?: Record<string, unknown>,
  ): Promise<AnnotatedResult<T[]>> {
    const provider = this.getProvider(providerName);
    const fetcher = this.getFetcher(provider, modelName);
    const filteredCredentials = this.filterCredentials(
      credentials,
      provider,
      fetcher.requireCredentials,
    );
    const results = (await fetcher.fetchData(
      params,
      filteredCredentials,
      options,
    )) as T[];
    return {
      result: results,
      metadata: {
        provider: providerName,
        model: modelName,
      },
    };
  }
}
