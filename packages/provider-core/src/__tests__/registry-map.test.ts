import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { AbstractFetcher } from "../abstract/abstract-fetcher";
import { AbstractProvider } from "../abstract/abstract-provider";
import { ProviderRegistry } from "../registry";
import { RegistryMap } from "../registry-map";

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
    return [{ s: query.symbol, p: 150.25, v: 1000000 }];
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
TestFetcher.initTypeMetadata(TestQueryParams, z.array(TestData), TestData);

// --- Another fetcher for the same model ---
class AnotherFetcher extends AbstractFetcher<typeof TestQueryParams, typeof TestData> {
  requireCredentials = true;

  async transformQuery(params: z.input<typeof TestQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 50,
    };
  }

  async extractData(query: z.infer<typeof TestQueryParams>) {
    return [{ sym: query.symbol, price: 200.0, vol: 500000 }];
  }

  async transformData(raw: unknown) {
    const items = raw as Array<Record<string, unknown>>;
    return items.map((item) =>
      TestData.parse({
        symbol: item.sym,
        price: item.price,
        volume: item.vol,
      }),
    );
  }
}
AnotherFetcher.initTypeMetadata(TestQueryParams, z.array(TestData), TestData);

describe("RegistryMap", () => {
  it("should list available providers", () => {
    const registry = new ProviderRegistry();
    registry.register(
      new AbstractProvider({
        name: "alpha",
        description: "Alpha",
        fetcherMap: { "equity/quote": new TestFetcher() },
      }),
    );

    const map = new RegistryMap(registry);
    expect(map.availableProviders).toEqual(["alpha"]);
  });

  it("should list credentials by provider", () => {
    const registry = new ProviderRegistry();
    registry.register(
      new AbstractProvider({
        name: "alpha",
        description: "Alpha",
        credentials: ["api_key", "secret"],
        fetcherMap: { "equity/quote": new TestFetcher() },
      }),
    );

    const map = new RegistryMap(registry);
    expect(map.credentials).toHaveProperty("alpha");
    expect(map.credentials.alpha).toContain("alpha_api_key");
    expect(map.credentials.alpha).toContain("alpha_secret");
  });

  it("should list all models", () => {
    const registry = new ProviderRegistry();
    registry.register(
      new AbstractProvider({
        name: "alpha",
        description: "Alpha",
        fetcherMap: {
          "equity/quote": new TestFetcher(),
          "equity/historical": new TestFetcher(),
        },
      }),
    );
    registry.register(
      new AbstractProvider({
        name: "beta",
        description: "Beta",
        fetcherMap: { "equity/quote": new AnotherFetcher() },
      }),
    );

    const map = new RegistryMap(registry);
    expect(map.models.sort()).toEqual(["equity/historical", "equity/quote"]);
  });

  it("should map providers by model", () => {
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
        fetcherMap: { "equity/quote": new AnotherFetcher() },
      }),
    );

    const map = new RegistryMap(registry);
    const providers = map.getProvidersForModel("equity/quote");
    expect(providers).toContain("alpha");
    expect(providers).toContain("beta");
  });

  it("should getFetcherInfo for a provider+model", () => {
    const registry = new ProviderRegistry();
    registry.register(
      new AbstractProvider({
        name: "alpha",
        description: "Alpha",
        fetcherMap: { "equity/quote": new TestFetcher() },
      }),
    );

    const map = new RegistryMap(registry);
    const info = map.getFetcherInfo("alpha", "equity/quote");
    expect(info).toBeDefined();
    expect(info?.queryParamsType).toBeDefined();
    expect(info?.dataType).toBeDefined();
    expect(info?.returnType).toBeDefined();
  });

  it("should check hasProvider correctly", () => {
    const registry = new ProviderRegistry();
    registry.register(
      new AbstractProvider({
        name: "alpha",
        description: "Alpha",
        fetcherMap: { "equity/quote": new TestFetcher() },
      }),
    );

    const map = new RegistryMap(registry);
    expect(map.hasProvider("alpha", "equity/quote")).toBe(true);
    expect(map.hasProvider("alpha", "nonexistent")).toBe(false);
    expect(map.hasProvider("beta", "equity/quote")).toBe(false);
  });
});
