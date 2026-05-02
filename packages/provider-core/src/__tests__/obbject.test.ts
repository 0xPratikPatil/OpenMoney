import { describe, expect, it } from "bun:test";
import { OBBject } from "../obbject";

describe("OBBject", () => {
  it("should create an OBBject with results and metadata", () => {
    const obj = new OBBject([{ symbol: "AAPL", price: 150 }], {
      provider: "test",
      model: "equity/quote",
    });

    expect(obj.results).toHaveLength(1);
    expect(obj.results[0]).toEqual({ symbol: "AAPL", price: 150 });
    expect(obj.metadata.provider).toBe("test");
    expect(obj.metadata.model).toBe("equity/quote");
    expect(obj.metadata.timestamp).toBeDefined();
    expect(obj.metadata.requestId).toBeDefined();
    expect(obj.metadata.duration).toBe(0);
  });

  it("should create via fromResults factory", () => {
    const obj = OBBject.fromResults(
      [{ symbol: "MSFT", price: 300 }],
      "yfinance",
      "equity/historical",
      42,
    );

    expect(obj.results).toHaveLength(1);
    expect(obj.metadata.provider).toBe("yfinance");
    expect(obj.metadata.model).toBe("equity/historical");
    expect(obj.metadata.duration).toBe(42);
  });

  it("should map over results", () => {
    const obj = new OBBject([{ symbol: "AAPL", price: 150 }], {
      provider: "test",
      model: "equity/quote",
    });

    const mapped = obj.map((item) => ({
      ...item,
      price: item.price * 2,
    }));

    expect(mapped.results[0]?.price).toBe(300);
    expect(mapped.metadata.provider).toBe("test");
  });

  it("should filter results", () => {
    const obj = new OBBject(
      [
        { symbol: "AAPL", price: 150 },
        { symbol: "MSFT", price: 300 },
      ],
      { provider: "test", model: "equity/quote" },
    );

    const filtered = obj.filter((item) => item.price > 200);
    expect(filtered.results).toHaveLength(1);
    expect(filtered.results[0]?.symbol).toBe("MSFT");
  });

  it("should return first and last", () => {
    const obj = new OBBject(
      [
        { symbol: "AAPL", price: 150 },
        { symbol: "MSFT", price: 300 },
      ],
      { provider: "test", model: "equity/quote" },
    );

    expect(obj.first()?.symbol).toBe("AAPL");
    expect(obj.last()?.symbol).toBe("MSFT");
  });

  it("should detect empty", () => {
    const empty = new OBBject([], { provider: "test", model: "empty" });
    expect(empty.isEmpty()).toBe(true);

    const nonEmpty = new OBBject([{ symbol: "AAPL" }], {
      provider: "test",
      model: "nonempty",
    });
    expect(nonEmpty.isEmpty()).toBe(false);
  });

  it("should produce correct JSON", () => {
    const obj = new OBBject([{ symbol: "AAPL" }], {
      provider: "test",
      model: "equity/quote",
    });
    const json = obj.toJSON();
    expect(json.results).toHaveLength(1);
    expect(json.metadata.provider).toBe("test");
    expect(json.metadata.model).toBe("equity/quote");
  });
});
