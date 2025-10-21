import { describe, it, expect } from "vitest";
import {
  normalizeMarketData,
  normalizeEventMarkets,
  detectMarketType,
  buildEventOutcomes,
} from "@/lib/markets";
import gammaMultiOutcome from "@/__tests__/fixtures/gammaMultiOutcome.json";

describe("normalizeMarketData", () => {
  it("normalizes binary market", () => {
    const market = normalizeMarketData({
      id: "m1",
      slug: "market-slug",
      question: "Will it rain?",
      outcomes: ["Yes", "No"],
      outcomePrices: [0.6, 0.4],
      clobTokenIds: ["token-no", "token-yes"],
      volume: "1000",
      liquidity: "500",
      startDate: "2024-01-01",
      endDate: "2024-02-01",
      conditionId: "cond-1",
    });

    expect(market.id).toBe("m1");
    expect(market.type).toBe("binary");
    expect(market.outcomes).toHaveLength(2);
    expect(market.outcomes[0].probability).toBeCloseTo(0.6);
    expect(market.clobTokenIds).toEqual(["token-no", "token-yes"]);
    expect(market.conditionId).toBe("cond-1");
    expect(market.marketType).toBe("binary");
    expect(market.primaryOutcome?.name).toBe("Yes");
    expect(market.primaryOutcome?.probability).toBeCloseTo(0.6);
    expect(market.displayName).toBe("Yes");
  });

  it("defaults probabilities safely", () => {
    const market = normalizeMarketData({
      id: "m2",
      outcomes: ["A", "B", "C"],
      outcomePrices: [1.2, -0.5, 0.3],
    });

    const probabilities = market.outcomes.map((outcome) => outcome.probability);
    expect(probabilities).toContain(1);
    expect(probabilities).toContain(0);
    expect(probabilities).toContain(0.3);
  });
});

describe("normalizeEventMarkets", () => {
  it("maps event outcomes with metadata", () => {
    const event = {
      id: "event-1",
      title: "Election",
      icon: "icon.png",
      image: "image.png",
      featured: true,
      commentCount: 5,
      markets: [
        {
          id: "market-1",
          question: "Candidate A",
          outcomes: ["Yes", "No"],
          outcomePrices: [0.55, 0.45],
          conditionId: "cond-1",
        },
        {
          id: "market-2",
          question: "Candidate B",
          outcomes: ["Yes", "No"],
          outcomePrices: [0.35, 0.65],
          conditionId: "cond-2",
        },
      ],
    };

    const markets = normalizeEventMarkets(event);
    expect(markets).toHaveLength(2);
    expect(markets[0].eventId).toBe("event-1");
    expect(markets[0].totalOutcomes).toBe(2);
    expect(markets[1].outcomeIndex).toBe(1);
    expect(markets[1].conditionId).toBe("cond-2");
    expect(markets[0].primaryOutcome?.name).toBe("Candidate A");
    expect(markets[1].primaryOutcome?.name).toBe("Candidate B");
  });
});

describe("detectMarketType", () => {
  it("detects multi outcome market", () => {
    expect(
      detectMarketType({
        outcomes: ["A", "B", "C"],
        outcomePrices: [0.3, 0.4, 0.3],
      }),
    ).toBe("multi");
  });
});

describe("buildEventOutcomes", () => {
  it("parses string arrays for multi-outcome events", () => {
    const event = buildEventOutcomes(gammaMultiOutcome);
    expect(event).not.toBeNull();
    expect(event?.markets).toHaveLength(2);
    const firstMarket = event?.markets[0];
    expect(firstMarket?.outcomes[0].name).toBe("Outcome A");
    expect(firstMarket?.primaryOutcome?.name).toBe("Outcome A");
    expect(firstMarket?.primaryOutcome?.probability).toBeCloseTo(0.52);
    expect(firstMarket?.displayName).toBe("Outcome A");
    expect(firstMarket?.clobTokenIds?.[1]).toBe("token-yes-a");
  });
});
