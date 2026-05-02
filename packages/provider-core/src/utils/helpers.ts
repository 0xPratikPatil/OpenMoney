/**
 * Provider utility helpers.
 *
 * Port of OpenBB's `openbb_core/provider/utils/helpers.py`.
 */

/**
 * Check whether a function is async (returns a Promise/Thenable).
 */
export function isAsyncFunction(
  fn: (...args: unknown[]) => unknown,
): boolean {
  return fn.constructor.name === "AsyncFunction" || fn.toString().startsWith("async ");
}

/**
 * Execute a function that may be sync or async, and always return a Promise.
 *
 * Port of OpenBB's `maybe_coroutine`.
 *
 * @param fn — A function that may return T or Promise<T>
 * @param args — Arguments to pass to the function
 * @returns A Promise resolving to the function's return value
 */
export async function maybeCoroutine<T>(
  fn: ((...args: unknown[]) => T | Promise<T>),
  ...args: unknown[]
): Promise<T> {
  const result = fn(...args);
  if (result instanceof Promise) {
    return result;
  }
  return result;
}

/**
 * Run a (possibly sync) function as if it were async.
 *
 * Port of OpenBB's `run_async`.
 * In OpenBB this uses `anyio.from_thread.start_blocking_portal`;
 * in Bun/Node this is a simple wrapper.
 *
 * @param fn — A function returning T or Promise<T>
 * @param args — Arguments to pass
 * @returns The function result
 */
export async function runAsync<T>(
  fn: ((...args: unknown[]) => T | Promise<T>),
  ...args: unknown[]
): Promise<T> {
  return maybeCoroutine(fn, ...args);
}

/**
 * Convert a camelCase or PascalCase string to snake_case.
 *
 * Port of OpenBB's `to_snake_case`.
 *
 * @example
 * ```ts
 * toSnakeCase("equityHistorical") // "equity_historical"
 * toSnakeCase("symbol")           // "symbol"
 * ```
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "")
    .replace(/__+/g, "_")
    .replace(/ /g, "_");
}

/**
 * Convert a snake_case string to camelCase.
 *
 * Inverse of `toSnakeCase`.
 *
 * @example
 * ```ts
 * toCamelCase("equity_historical") // "equityHistorical"
 * toCamelCase("symbol")            // "symbol"
 * ```
 */
export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/_[a-z]/g, (match) => match[1]!.toUpperCase());
}

/**
 * Type guard: check if a value is a non-null object.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Safely get a nested property from an object using a dot-separated path.
 *
 * @example
 * ```ts
 * getNested({ a: { b: 42 } }, "a.b") // 42
 * ```
 */
export function getNested<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
): T | undefined {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj) as T | undefined;
}
