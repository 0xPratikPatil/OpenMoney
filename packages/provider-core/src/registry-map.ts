import type { z } from "zod";
import type { AbstractFetcher } from "./abstract/abstract-fetcher";
import type { ProviderRegistry } from "./registry";

/**
 * Provider model info extracted from a fetcher.
 */
export interface FetcherModelInfo {
  /** The query params Zod schema type */
  queryParamsType: z.ZodTypeAny | undefined;
  /** The data (output) Zod schema type */
  dataType: z.ZodTypeAny | undefined;
  /** The outer return type Zod schema */
  returnType: z.ZodTypeAny | undefined;
}

/**
 * RegistryMap — extracts structured provider info from a ProviderRegistry.
 *
 * Direct port of OpenBB's RegistryMap class.
 * Provides quick access to which providers support which models,
 * their credential requirements, and schema field information.
 */
export class RegistryMap {
  private readonly _availableProviders: string[];
  private readonly _credentials: Record<string, string[]>;
  private readonly _models: string[];
  private readonly _providersByModel: Map<string, string[]>;
  private readonly _fetcherInfo: Map<string, Map<string, FetcherModelInfo>>;

  constructor(private readonly _registry: ProviderRegistry) {
    this._availableProviders = this._getAvailableProviders(_registry);
    this._credentials = this._getCredentials(_registry);
    this._providersByModel = this._getProvidersByModel(_registry);
    this._fetcherInfo = this._getFetcherInfo(_registry);
    this._models = Array.from(this._providersByModel.keys()).sort();
  }

  // ── Public properties ──────────────────────────────────────────────

  /** The underlying registry instance. */
  get registry(): ProviderRegistry {
    return this._registry;
  }

  /** Sorted list of available provider names. */
  get availableProviders(): string[] {
    return this._availableProviders;
  }

  /** Map of provider names to their credential keys. */
  get credentials(): Record<string, string[]> {
    return this._credentials;
  }

  /** Sorted list of all model names across all providers. */
  get models(): string[] {
    return this._models;
  }

  /** Map of model name → provider names that support it. */
  get providersByModel(): Map<string, string[]> {
    return new Map(this._providersByModel);
  }

  /**
   * Get providers that support a given model.
   * @param modelName — e.g. "equity/historical"
   * @returns Array of provider names
   */
  getProvidersForModel(modelName: string): string[] {
    return this._providersByModel.get(modelName) ?? [];
  }

  /**
   * Get fetcher metadata for a specific provider + model.
   * @returns FetcherModelInfo or undefined if not found
   */
  getFetcherInfo(providerName: string, modelName: string): FetcherModelInfo | undefined {
    return this._fetcherInfo.get(providerName)?.get(modelName);
  }

  /**
   * Check whether a provider supports a specific model.
   */
  hasProvider(providerName: string, modelName: string): boolean {
    const providers = this._providersByModel.get(modelName);
    return providers?.includes(providerName) ?? false;
  }

  // ── Private helpers ────────────────────────────────────────────────

  private _getAvailableProviders(registry: ProviderRegistry): string[] {
    return registry.availableProviders;
  }

  private _getCredentials(registry: ProviderRegistry): Record<string, string[]> {
    return registry.credentials;
  }

  private _getProvidersByModel(registry: ProviderRegistry): Map<string, string[]> {
    const byModel = new Map<string, string[]>();
    for (const provider of registry.getAll().values()) {
      for (const modelName of provider.fetcherMap.keys()) {
        const existing = byModel.get(modelName) ?? [];
        existing.push(provider.name);
        byModel.set(modelName, existing);
      }
    }
    return byModel;
  }

  private _getFetcherInfo(
    registry: ProviderRegistry,
  ): Map<string, Map<string, FetcherModelInfo>> {
    const info = new Map<string, Map<string, FetcherModelInfo>>();
    for (const [providerName, provider] of registry.getAll()) {
      const modelMap = new Map<string, FetcherModelInfo>();
      for (const [modelName, fetcher] of provider.fetcherMap) {
        modelMap.set(modelName, this._extractFetcherInfo(fetcher));
      }
      info.set(providerName, modelMap);
    }
    return info;
  }

  private _extractFetcherInfo(fetcher: AbstractFetcher): FetcherModelInfo {
    const cls = fetcher.constructor as typeof AbstractFetcher;
    return {
      queryParamsType: cls.queryParamsType,
      dataType: cls.dataType,
      returnType: cls.returnType,
    };
  }
}
