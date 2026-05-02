import { z } from "zod";

/**
 * ProviderChoices — a discriminated union type for provider selection.
 *
 * Maps model names to the set of providers that support them.
 * Equivalent to OpenBB's `ProviderChoices` dataclass which contains
 * a `provider: Literal[...]` field.
 *
 * @example
 * ```ts
 * const choices: ProviderChoices = {
 *   "equity/historical": "yfinance", // or "fmp", etc.
 * };
 * ```
 */
export type ProviderChoices = Record<string, string>;

/**
 * Create a typed provider choices map for a specific set of providers.
 *
 * @param providers — List of provider names that support the model
 * @param defaultProvider — Optional default provider
 * @returns A ProviderChoices instance
 */
export function createProviderChoices(
  modelName: string,
  providers: string[],
  defaultProvider?: string,
): ProviderChoices {
  return {
    [modelName]: defaultProvider ?? providers[0] ?? "",
  };
}

/**
 * StandardParams — holds the standard (shared) Zod schema for a model's query parameters.
 *
 * All providers supporting a given model share the same StandardParams fields.
 * Equivalent to OpenBB's `StandardParams` dataclass.
 *
 * @typeParam T — A Zod object type describing the standard params.
 */
export class StandardParams<T extends z.ZodObject<z.ZodRawShape>> {
  /** The Zod schema for the standard parameters. */
  readonly schema: T;

  constructor(schema: T) {
    this.schema = schema;
  }

  /**
   * Parse and validate input against the standard params schema.
   */
  parse(input: unknown): z.infer<T> {
    return this.schema.parse(input);
  }

  /**
   * Safe-parse input against the standard params schema.
   */
  safeParse(input: unknown): z.SafeParseReturnType<unknown, z.infer<T>> {
    return this.schema.safeParse(input);
  }

  /**
   * Get the descriptions of all fields in the schema.
   */
  getFieldDescriptions(): Record<string, string | undefined> {
    const descriptions: Record<string, string | undefined> = {};
    const shape = this.schema.shape;
    for (const key of Object.keys(shape)) {
      const field = shape[key];
      if (field && typeof field === "object" && "_def" in field) {
        descriptions[key] = field.description ?? undefined;
      }
    }
    return descriptions;
  }
}

/**
 * ExtraParams — holds provider-specific (extra) Zod schema additions for a model.
 *
 * Each provider may extend the standard params with additional fields.
 * Equivalent to OpenBB's `ExtraParams` dataclass.
 *
 * @typeParam T — A Zod object type describing the extra params.
 */
export class ExtraParams<T extends z.ZodObject<z.ZodRawShape>> {
  /** The Zod schema for the extra (provider-specific) parameters. */
  readonly schema: T;

  /** The provider name these extra params belong to. */
  readonly providerName: string;

  constructor(schema: T, providerName: string) {
    this.schema = schema;
    this.providerName = providerName;
  }

  /**
   * Parse and validate input against the extra params schema.
   */
  parse(input: unknown): z.infer<T> {
    return this.schema.parse(input);
  }

  /**
   * Safe-parse input against the extra params schema.
   */
  safeParse(input: unknown): z.SafeParseReturnType<unknown, z.infer<T>> {
    return this.schema.safeParse(input);
  }
}

/**
 * MergedParams — combines StandardParams + ExtraParams into a single schema.
 *
 * Equivalent to OpenBB's dynamic return schema generation (merging StandardData + ExtraData).
 */
export class MergedParams {
  private readonly _schema: z.ZodObject<z.ZodRawShape>;

  constructor(standard: z.ZodObject<z.ZodRawShape>, extra?: z.ZodObject<z.ZodRawShape>) {
    const merged: Record<string, z.ZodTypeAny> = { ...standard.shape };
    if (extra) {
      for (const [key, value] of Object.entries(extra.shape)) {
        merged[key] = value;
      }
    }
    this._schema = z.object(merged) as z.ZodObject<z.ZodRawShape>;
  }

  get schema(): z.ZodObject<z.ZodRawShape> {
    return this._schema;
  }

  parse(input: unknown): Record<string, unknown> {
    return this._schema.parse(input);
  }
}

/**
 * ParamsMap — maps model names to their StandardParams and per-provider ExtraParams.
 * Equivalent to OpenBB's `ProviderInterface.params` dictionary.
 */
export class ParamsMap {
  private readonly _map: Map<string, { standard: StandardParams<z.ZodObject<z.ZodRawShape>>; extra: Map<string, ExtraParams<z.ZodObject<z.ZodRawShape>>> }>;

  constructor() {
    this._map = new Map();
  }

  /**
   * Register standard params for a model.
   */
  setStandard(modelName: string, params: StandardParams<z.ZodObject<z.ZodRawShape>>): void {
    const entry = this._map.get(modelName) ?? { standard: params, extra: new Map() };
    entry.standard = params;
    this._map.set(modelName, entry);
  }

  /**
   * Register extra params for a provider + model.
   */
  setExtra(modelName: string, providerName: string, params: ExtraParams<z.ZodObject<z.ZodRawShape>>): void {
    const entry = this._map.get(modelName) ?? {
      standard: new StandardParams(z.object({})),
      extra: new Map(),
    };
    entry.extra.set(providerName, params);
    this._map.set(modelName, entry);
  }

  /**
   * Get standard params for a model.
   */
  getStandard(modelName: string): StandardParams<z.ZodObject<z.ZodRawShape>> | undefined {
    return this._map.get(modelName)?.standard;
  }

  /**
   * Get extra params for a provider + model.
   */
  getExtra(modelName: string, providerName: string): ExtraParams<z.ZodObject<z.ZodRawShape>> | undefined {
    return this._map.get(modelName)?.extra.get(providerName);
  }

  /**
   * Get all registered model names.
   */
  get modelNames(): string[] {
    return Array.from(this._map.keys()).sort();
  }
}

/**
 * ReturnAnnotation — describes the return type for a model.
 * Equivalent to OpenBB's `OBBject[Union[...]]` return annotations.
 */
export class ReturnAnnotation {
  constructor(
    /** The model name. */
    readonly modelName: string,
    /** The merged return schema (combines standard + extra data fields). */
    readonly schema: z.ZodTypeAny,
  ) {}

  /**
   * Create an OBBject type annotation string for docs/OpenAPI.
   */
  get obbjectTypeName(): string {
    return `OBBject[${this.modelName}]`;
  }
}
