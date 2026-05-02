import { randomUUID } from "node:crypto";

/**
 * OBBject — the standard OpenBB response wrapper.
 *
 * Every query result is wrapped in an OBBject, providing consistent
 * metadata alongside the results array.
 *
 * Direct port of OpenBB's OBBject[T] (Pydantic BaseModel).
 *
 * @typeParam T — The inner data type contained in the results array.
 */
export class OBBject<T> {
  /** The actual data results. */
  readonly results: T[];

  /** Metadata about the query execution. */
  readonly metadata: OBBjectMetadata;

  constructor(results: T[], metadata: Partial<OBBjectMetadata> = {}) {
    this.results = results;
    this.metadata = {
      provider: metadata.provider ?? "unknown",
      model: metadata.model ?? "unknown",
      timestamp: metadata.timestamp ?? new Date().toISOString(),
      requestId: metadata.requestId ?? randomUUID(),
      duration: metadata.duration ?? 0,
    };
  }

  /**
   * Factory: create an OBBject from a query execution.
   *
   * @param results — The raw query results
   * @param provider — Provider name
   * @param model — Model name
   * @param duration — Execution duration in ms (optional)
   * @returns A new OBBject wrapping the results
   */
  static fromResults<T>(
    results: T[],
    provider: string,
    model: string,
    duration?: number,
  ): OBBject<T> {
    return new OBBject<T>(results, {
      provider,
      model,
      duration,
    });
  }

  /**
   * Map over the results array to transform each item.
   * Preserves metadata.
   */
  map<U>(fn: (item: T, index: number) => U): OBBject<U> {
    return new OBBject<U>(
      this.results.map(fn),
      { ...this.metadata },
    );
  }

  /**
   * Filter the results array.
   * Preserves metadata.
   */
  filter(predicate: (item: T, index: number) => boolean): OBBject<T> {
    return new OBBject<T>(
      this.results.filter(predicate),
      { ...this.metadata },
    );
  }

  /**
   * Return the first result, or undefined if empty.
   */
  first(): T | undefined {
    return this.results[0];
  }

  /**
   * Return the last result, or undefined if empty.
   */
  last(): T | undefined {
    return this.results[this.results.length - 1];
  }

  /**
   * Check whether results are empty.
   */
  isEmpty(): boolean {
    return this.results.length === 0;
  }

  /**
   * Return a JSON-compatible plain object.
   */
  toJSON(): { results: T[]; metadata: OBBjectMetadata } {
    return {
      results: this.results,
      metadata: { ...this.metadata },
    };
  }
}

/**
 * Standard metadata attached to every OBBject.
 */
export interface OBBjectMetadata {
  /** Provider name (e.g. "yfinance", "fmp") */
  provider: string;
  /** Model name (e.g. "equity/historical") */
  model: string;
  /** ISO timestamp when the query was executed */
  timestamp: string;
  /** Unique request identifier */
  requestId: string;
  /** Execution duration in milliseconds */
  duration: number;
}
