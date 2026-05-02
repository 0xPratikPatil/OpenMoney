import { AbstractProvider } from "./abstract/abstract-provider";

/**
 * Provider registry — stores all registered providers.
 * Equivalent to OpenBB's Registry class.
 */
export class ProviderRegistry {
  private providers = new Map<string, AbstractProvider>();

  register(provider: AbstractProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): AbstractProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }

  getAll(): Map<string, AbstractProvider> {
    return new Map(this.providers);
  }

  getProvidersForModel(modelName: string): Map<string, AbstractProvider> {
    const result = new Map<string, AbstractProvider>();
    for (const [name, provider] of this.providers) {
      if (provider.fetcherMap.has(modelName)) {
        result.set(name, provider);
      }
    }
    return result;
  }

  get availableProviders(): string[] {
    return Array.from(this.providers.keys()).sort();
  }

  get credentials(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const [name, provider] of this.providers) {
      result[name] = provider.credentials;
    }
    return result;
  }

  clear(): void {
    this.providers.clear();
  }
}

/** Global singleton registry instance */
export const globalRegistry = new ProviderRegistry();
