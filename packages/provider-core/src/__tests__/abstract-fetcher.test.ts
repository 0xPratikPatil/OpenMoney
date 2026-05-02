import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { AbstractFetcher, UnauthorizedError, ProviderError } from "../abstract/abstract-fetcher";
import { AbstractProvider } from "../abstract/abstract-provider";
import { ProviderRegistry } from "../registry";
import { QueryExecutor } from "../query-executor";

// --- Test schemas ---
const TestQueryParams = z.object({
  symbol: z.string(),
  limit: z.number().optional().default(100),
});

const TestData = z.object({
  symbol: z.string(),
  price: z.number(),
  volume: z.number().optional(),
});

// --- Test fetcher ---
class TestFetcher extends AbstractFetcher<typeof TestQueryParams, typeof TestData> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof TestQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 100,
    };
  }

  async extractData(query: z.infer<typeof TestQueryParams>) {
    return [
      { s: query.symbol, p: 150.25, v: 1000000 },
      { s: query.symbol, p: 151.00, v: 1200000 },
    ];
  }

  async transformData(raw: unknown) {
    const items = raw as Array<Record<string, unknown>>;
    return items.map((item) =>
      TestData.parse({
        symbol: item.s,
        price: item.p,
        volume: item.v,
      }),
    );
  }
}

class AuthRequiredFetcher extends TestFetcher {
  requireCredentials = true;
}

describe("AbstractFetcher", () => {
  it("should execute TET pipeline and return typed data", async () => {
    const fetcher = new TestFetcher();
    const result = await fetcher.fetchData({ symbol: "aapl" }, {});
    expect(result).toHaveLength(2);
    expect(result[0]?.symbol).toBe("AAPL");
    expect(result[0]?.price).toBe(150.25);
  });

  it("should transform query params (uppercase symbol)", async () => {
    const fetcher = new TestFetcher();
    const query = await fetcher.transformQuery({ symbol: "msft" });
    expect(query.symbol).toBe("MSFT");
  });

  it("should apply default limit", async () => {
    const fetcher = new TestFetcher();
    const query = await fetcher.transformQuery({ symbol: "goog" });
    expect(query.limit).toBe(100);
  });
});

describe("ProviderRegistry", () => {
  it("should register and retrieve providers", () => {
    const registry = new ProviderRegistry();
    const provider = new AbstractProvider({
      name: "test",
      description: "Test provider",
      fetcherMap: { "equity/quote": new TestFetcher() },
    });
    registry.register(provider);
    expect(registry.get("test")).toBeDefined();
    expect(registry.availableProviders).toContain("test");
  });

  it("should find providers by model", () => {
    const registry = new ProviderRegistry();
    registry.register(
      new AbstractProvider({
        name: "alpha",
        description: "Alpha",
        fetcherMap: { "equity/quote": new TestFetcher() },
      }),
    );
    registry.register(
      new AbstractProvider({
        name: "beta",
        description: "Beta",
        fetcherMap: { "equity/historical": new TestFetcher() },
      }),
    );
    const models = registry.getProvidersForModel("equity/quote");
    expect(models.has("alpha")).toBe(true);
    expect(models.has("beta")).toBe(false);
  });
});

describe("QueryExecutor", () => {
  it("should execute a query through the registry", async () => {
    const registry = new ProviderRegistry();
    registry.register(
      new AbstractProvider({
        name: "test",
        description: "Test",
        fetcherMap: { "equity/quote": new TestFetcher() },
      }),
    );
    const executor = new QueryExecutor(registry);
    const result = await executor.execute<any[]>("test", "equity/quote", {
      symbol: "aapl",
    });
    expect(result).toHaveLength(2);
    expect(result[0]?.symbol).toBe("AAPL");
  });

  it("should throw for unknown provider", async () => {
    const executor = new QueryExecutor(new ProviderRegistry());
    expect(
      executor.execute("nonexistent", "equity/quote", { symbol: "aapl" }),
    ).rejects.toThrow(ProviderError);
  });

  it("should throw for missing credentials when required", async () => {
    const registry = new ProviderRegistry();
    registry.register(
      new AbstractProvider({
        name: "secure",
        description: "Secure",
        credentials: ["api_key"],
        fetcherMap: { "equity/quote": new AuthRequiredFetcher() },
      }),
    );
    const executor = new QueryExecutor(registry);
    expect(
      executor.execute("secure", "equity/quote", { symbol: "aapl" }, {}),
    ).rejects.toThrow(UnauthorizedError);
  });
});
