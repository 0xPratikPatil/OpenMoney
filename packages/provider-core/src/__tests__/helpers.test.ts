import { describe, expect, it } from "bun:test";
import {
  isAsyncFunction,
  maybeCoroutine,
  runAsync,
  toSnakeCase,
  toCamelCase,
  isObject,
  getNested,
} from "../utils/helpers";

describe("toSnakeCase", () => {
  it("should convert camelCase to snake_case", () => {
    expect(toSnakeCase("equityHistorical")).toBe("equity_historical");
    expect(toSnakeCase("symbol")).toBe("symbol");
    expect(toSnakeCase("equityHistoricalData")).toBe("equity_historical_data");
  });

  it("should convert PascalCase to snake_case", () => {
    expect(toSnakeCase("EquityHistorical")).toBe("equity_historical");
    expect(toSnakeCase("DataPoint")).toBe("data_point");
  });

  it("should handle spaces", () => {
    expect(toSnakeCase("equity historical")).toBe("equity_historical");
  });
});

describe("toCamelCase", () => {
  it("should convert snake_case to camelCase", () => {
    expect(toCamelCase("equity_historical")).toBe("equityHistorical");
    expect(toCamelCase("symbol")).toBe("symbol");
    expect(toCamelCase("equity_historical_data")).toBe("equityHistoricalData");
  });
});

describe("isAsyncFunction", () => {
  it("should detect async functions", () => {
    expect(isAsyncFunction(async () => {})).toBe(true);
    expect(isAsyncFunction(() => {})).toBe(false);
    expect(isAsyncFunction(function () {})).toBe(false);
  });
});

describe("maybeCoroutine", () => {
  it("should handle sync functions", async () => {
    const result = await maybeCoroutine(() => 42);
    expect(result).toBe(42);
  });

  it("should handle async functions", async () => {
    const result = await maybeCoroutine(async () => 42);
    expect(result).toBe(42);
  });
});

describe("runAsync", () => {
  it("should run a sync function and return a promise", async () => {
    const result = await runAsync(() => "hello");
    expect(result).toBe("hello");
  });

  it("should run an async function", async () => {
    const result = await runAsync(async () => "world");
    expect(result).toBe("world");
  });
});

describe("isObject", () => {
  it("should return true for plain objects", () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it("should return false for non-objects", () => {
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
    expect(isObject("string")).toBe(false);
    expect(isObject(42)).toBe(false);
  });
});

describe("getNested", () => {
  it("should get nested values by dot path", () => {
    const obj = { a: { b: { c: 42 } } };
    expect(getNested<number>(obj, "a.b.c")).toBe(42);
    expect(getNested<{ c: number }>(obj, "a.b")).toEqual({ c: 42 });
  });

  it("should return undefined for missing paths", () => {
    const obj = { a: 1 };
    expect(getNested(obj, "b")).toBeUndefined();
    expect(getNested(obj, "a.b")).toBeUndefined();
  });
});
