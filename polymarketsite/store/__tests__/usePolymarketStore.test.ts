import { describe, it, expect } from "vitest";
import { act } from "react";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import type { EventOutcomes } from "@/types/markets";
import gammaMultiOutcome from "@/__tests__/fixtures/gammaMultiOutcome.json";
import { buildEventOutcomes } from "@/lib/markets";

describe("usePolymarketStore event outcomes", () => {
  it("hydrates and updates event outcomes", () => {
    const normalized = buildEventOutcomes(gammaMultiOutcome) as EventOutcomes;
    const event = { ...normalized, updatedAt: Date.now() };

    act(() => {
      usePolymarketStore.getState().hydrateEventOutcomes(event);
    });

    let stored = usePolymarketStore.getState().eventOutcomes.get(event.eventId);
    expect(stored).toBeDefined();
    expect(stored?.markets[0].id).toBe(event.markets[0].id);
    expect(stored?.markets[0].primaryOutcome?.name).toBe("Outcome A");
    expect(stored?.markets[0].primaryOutcome?.probability).toBeCloseTo(0.52);

    act(() => {
      usePolymarketStore
        .getState()
        .updateEventOutcomeByCondition(event.markets[0].conditionId!, (market) => ({
          ...market,
          outcomes: market.outcomes.map((outcome) =>
            outcome.name === "Outcome A"
              ? { ...outcome, probability: 0.7 }
              : outcome,
          ),
          primaryOutcome: market.primaryOutcome
            ? { ...market.primaryOutcome, probability: 0.7 }
            : market.primaryOutcome,
        }));
    });

    stored = usePolymarketStore.getState().eventOutcomes.get(event.eventId);
    const probability = stored?.markets[0].outcomes[0]?.probability;
    expect(probability).not.toBeUndefined();
    expect(stored?.markets[0].primaryOutcome?.probability).toBeCloseTo(0.7);

    act(() => {
      usePolymarketStore.getState().clearEventOutcomes();
    });

    expect(usePolymarketStore.getState().eventOutcomes.size).toBe(0);
  });
});
