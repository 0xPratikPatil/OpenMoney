import type { AbstractFetcher } from "./abstract-fetcher";

/**
 * Provider descriptor — equivalent to OpenBB's Provider class.
 * Each data provider creates one of these to register itself with the system.
 */
export class AbstractProvider {
  public readonly name: string;
  public readonly description: string;
  public readonly website?: string;
  public readonly credentials: string[];
  public readonly fetcherMap: Map<string, AbstractFetcher>;
  public readonly reprName?: string;
  public readonly deprecatedCredentials?: Record<string, string | null>;
  public readonly instructions?: string;

  constructor(config: {
    name: string;
    description: string;
    website?: string;
    credentials?: string[];
    fetcherMap?: Record<string, AbstractFetcher>;
    reprName?: string;
    deprecatedCredentials?: Record<string, string | null>;
    instructions?: string;
  }) {
    this.name = config.name.toLowerCase();
    this.description = config.description;
    this.website = config.website;
    this.credentials = (config.credentials ?? []).map(
      (c) => `${this.name}_${c}`,
    );
    this.fetcherMap = new Map(Object.entries(config.fetcherMap ?? {}));
    this.reprName = config.reprName;
    this.deprecatedCredentials = config.deprecatedCredentials;
    this.instructions = config.instructions;
  }
}
