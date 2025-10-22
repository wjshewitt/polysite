/**
 * Market filtering utilities
 * Filters out markets with low liquidity or volume to improve data quality
 */

import type { NormalizedMarket } from "@/types/markets";
import type { GammaEvent, GammaMarket } from "@/services/gamma";

// Minimum thresholds in USD
const MIN_LIQUIDITY_USD = 500;
const MIN_VOLUME_USD = 500;
const NEW_MARKET_GRACE_PERIOD_MS = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if a market is new (less than 1 hour old)
 * New markets are exempt from liquidity/volume requirements
 */
export function isNewMarket(creationDate: string | number | Date): boolean {
  try {
    const createdAt =
      typeof creationDate === "number"
        ? creationDate
        : new Date(creationDate).getTime();

    if (!Number.isFinite(createdAt) || createdAt <= 0) {
      return false;
    }

    const now = Date.now();
    const age = now - createdAt;

    return age < NEW_MARKET_GRACE_PERIOD_MS;
  } catch (error) {
    console.warn("[MarketFilters] Error checking market age:", error);
    return false;
  }
}

/**
 * Check if a market meets the minimum liquidity or volume requirements
 * Returns true if market should be shown, false if it should be filtered out
 */
export function meetsMinimumThresholds(
  liquidity: number | string,
  volume: number | string,
  creationDate?: string | number | Date,
): boolean {
  // Parse liquidity and volume to numbers
  const liquidityNum =
    typeof liquidity === "string" ? parseFloat(liquidity) : liquidity;
  const volumeNum = typeof volume === "string" ? parseFloat(volume) : volume;

  // Handle invalid numbers
  if (!Number.isFinite(liquidityNum) || !Number.isFinite(volumeNum)) {
    return false;
  }

  // Check if market is new (exempt from requirements)
  if (creationDate && isNewMarket(creationDate)) {
    return true;
  }

  // Market must meet EITHER liquidity OR volume requirement
  return liquidityNum >= MIN_LIQUIDITY_USD || volumeNum >= MIN_VOLUME_USD;
}

/**
 * Filter a single GammaEvent
 * Returns null if the event should be filtered out
 */
export function filterGammaEvent(event: GammaEvent): GammaEvent | null {
  if (!event) return null;

  // Check if event meets thresholds
  const eventMeetsThreshold = meetsMinimumThresholds(
    event.liquidity,
    event.volume,
    event.creationDate,
  );

  if (!eventMeetsThreshold) {
    return null;
  }

  // If event has no markets, return the event as-is (it meets thresholds)
  if (!Array.isArray(event.markets) || event.markets.length === 0) {
    return event;
  }

  // Filter markets within the event
  const filteredMarkets = event.markets.filter((market) =>
    meetsMinimumThresholds(market.liquidity, market.volume, market.startDate),
  );

  // If no markets remain after filtering, exclude the entire event
  if (filteredMarkets.length === 0) {
    return null;
  }

  // Return event with filtered markets
  return {
    ...event,
    markets: filteredMarkets,
  };
}

/**
 * Filter an array of GammaEvents
 */
export function filterGammaEvents(events: GammaEvent[]): GammaEvent[] {
  if (!Array.isArray(events)) {
    return [];
  }

  return events
    .map(filterGammaEvent)
    .filter((event): event is GammaEvent => event !== null);
}

/**
 * Filter a single GammaMarket
 * Returns null if the market should be filtered out
 */
export function filterGammaMarket(market: GammaMarket): GammaMarket | null {
  if (!market) return null;

  const meetsThreshold = meetsMinimumThresholds(
    market.liquidity,
    market.volume,
    market.startDate,
  );

  return meetsThreshold ? market : null;
}

/**
 * Filter an array of GammaMarkets
 */
export function filterGammaMarkets(markets: GammaMarket[]): GammaMarket[] {
  if (!Array.isArray(markets)) {
    return [];
  }

  return markets
    .map(filterGammaMarket)
    .filter((market): market is GammaMarket => market !== null);
}

/**
 * Filter a single NormalizedMarket
 * Returns null if the market should be filtered out
 */
export function filterNormalizedMarket(
  market: NormalizedMarket,
): NormalizedMarket | null {
  if (!market) return null;

  const liquidity = market.liquidity ?? 0;
  const volume = market.volume ?? 0;

  // Use startDate if available, fallback to lastUpdated
  const creationDate = market.startDate ?? market.lastUpdated;

  const meetsThreshold = meetsMinimumThresholds(
    liquidity,
    volume,
    creationDate,
  );

  return meetsThreshold ? market : null;
}

/**
 * Filter an array of NormalizedMarkets
 */
export function filterNormalizedMarkets(
  markets: NormalizedMarket[],
): NormalizedMarket[] {
  if (!Array.isArray(markets)) {
    return [];
  }

  return markets
    .map(filterNormalizedMarket)
    .filter((market): market is NormalizedMarket => market !== null);
}

/**
 * Get filter stats for debugging/monitoring
 */
export interface FilterStats {
  total: number;
  passed: number;
  filtered: number;
  newMarkets: number;
  belowThreshold: number;
}

export function getFilterStats(
  items: Array<{
    liquidity: number | string;
    volume: number | string;
    creationDate?: string | number | Date;
  }>,
): FilterStats {
  let passed = 0;
  let newMarkets = 0;
  let belowThreshold = 0;

  for (const item of items) {
    const isNew = item.creationDate && isNewMarket(item.creationDate);
    const meetsThreshold = meetsMinimumThresholds(
      item.liquidity,
      item.volume,
      item.creationDate,
    );

    if (meetsThreshold) {
      passed++;
      if (isNew) {
        newMarkets++;
      }
    } else {
      belowThreshold++;
    }
  }

  return {
    total: items.length,
    passed,
    filtered: belowThreshold,
    newMarkets,
    belowThreshold,
  };
}

/**
 * Log filter statistics (useful for debugging)
 */
export function logFilterStats(context: string, stats: FilterStats): void {
  console.log(`[MarketFilters][${context}]`, {
    total: stats.total,
    passed: stats.passed,
    filtered: stats.filtered,
    newMarkets: stats.newMarkets,
    filterRate: `${((stats.filtered / stats.total) * 100).toFixed(1)}%`,
  });
}
