import { describe, expect, it, vi, afterEach } from "vitest";
import { normalizeCryptoPricePayload } from "@/services/cryptoPriceNormalizer";

describe("normalizeCryptoPricePayload", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("prefers the value field when present", () => {
    const fixedNow = new Date("2024-01-01T00:00:00Z").getTime();
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);

    const result = normalizeCryptoPricePayload({
      symbol: "eth-usd",
      value: 2345.12,
      price: 1200,
      change24h: -0.015,
      volume24h: 1000000,
      marketCap: 50000000,
    });

    expect(result).toEqual({
      symbol: "ETHUSDT",
      price: "2345.12",
      change24h: "-0.015",
      volume24h: "1000000",
      marketCap: "50000000",
      timestamp: fixedNow,
    });
  });

  it("falls back to price when value is not available", () => {
    const result = normalizeCryptoPricePayload({
      symbol: "BTCUSDT",
      price: "64000.5",
    });

    expect(result).toMatchObject({
      symbol: "BTCUSDT",
      price: "64000.5",
    });
  });

  it("uses fallback symbol when payload omits symbol", () => {
    const result = normalizeCryptoPricePayload(
      {
        value: 0.78,
        change24h: "0.05",
      },
      "matic-usd",
    );

    expect(result).toMatchObject({
      symbol: "MATICUSDT",
      price: "0.78",
      change24h: "0.05",
    });
  });

  it("returns null when neither payload nor fallback provide a symbol", () => {
    expect(
      normalizeCryptoPricePayload({
        value: 1,
      }),
    ).toBeNull();
  });
});
